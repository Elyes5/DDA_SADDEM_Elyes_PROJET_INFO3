import os
import uuid
from sqlalchemy import or_
from flask import current_app
from azure.storage.blob import BlobServiceClient
from models.snippet import Snippet
from models.user import User
from models.topic import Topic
from models.snippet_image import SnippetImage
from extensions.otp_ext import db
from services.notification_service import NotificationService
import services.cache_service as cache_service


class SnippetService:
    @staticmethod
    def _delete_image_file(image_url):
        if not image_url:
            return

        try:
            if current_app.config.get("ENV") == "development":
                filename = image_url.split('/')[-1]
                base_folder = current_app.config.get("LOCAL_UPLOAD_SNIPPETS_FOLDER", "uploads")
                file_path = os.path.join(base_folder, "snippets", filename)

                if os.path.exists(file_path):
                    os.remove(file_path)
            else:
                container_name = current_app.config["AZURE_STORAGE_CONTAINER"]
                if "snippets/" in image_url:
                    blob_path = f"snippets/{image_url.split('snippets/')[-1]}"

                    blob_service_client = BlobServiceClient.from_connection_string(
                        current_app.config["AZURE_STORAGE_CONNECTION_STRING"]
                    )
                    container_client = blob_service_client.get_container_client(container_name)
                    blob_client = container_client.get_blob_client(blob_path)

                    if blob_client.exists():
                        blob_client.delete_blob()
        except Exception as e:
            print(f"Warning: Failed to delete physical file {image_url} - {str(e)}")

    @staticmethod
    def _handle_image_upload(file, snippet_id):
        """Helper to handle image upload based on environment."""
        _, ext = os.path.splitext(file.filename)
        new_filename = f"{uuid.uuid4().hex}{ext}"

        if current_app.config.get("ENV") == "development":
            base_folder = current_app.config.get("LOCAL_UPLOAD_SNIPPETS_FOLDER", "uploads")
            upload_folder = os.path.join(base_folder, "snippets")
            os.makedirs(upload_folder, exist_ok=True)
            file.save(os.path.join(upload_folder, new_filename))

            return f"{os.getenv('DEV_API_URL')}uploads/snippets/{new_filename}"
        else:
            blob_service_client = BlobServiceClient.from_connection_string(
                current_app.config["AZURE_STORAGE_CONNECTION_STRING"]
            )
            container_name = current_app.config["AZURE_STORAGE_CONTAINER"]
            container_client = blob_service_client.get_container_client(container_name)

            blob_path = f"snippets/{new_filename}"
            blob_client = container_client.get_blob_client(blob_path)
            blob_client.upload_blob(file, overwrite=True)

            account_name = current_app.config["AZURE_STORAGE_ACCOUNT_NAME"]
            return f"https://{account_name}.blob.core.windows.net/{container_name}/{blob_path}"

    @staticmethod
    def get_snippet_by_id(snippet_id, requester_id=None):
        snippet = Snippet.query.get(snippet_id)
        if not snippet:
            return None, "Snippet not found"

        is_owner = requester_id and int(snippet.author_id) == int(requester_id)
        if not snippet.is_public and not is_owner:
            return None, "Unauthorized"

        return snippet.to_dict(), None

    @staticmethod
    def get_user_snippets(target_user_id, requester_id=None):
        target_user = User.get_by_id(target_user_id)
        if not target_user:
            return None, "User not found"

        is_owner = requester_id and int(target_user_id) == int(requester_id)

        if is_owner:
            snippets = Snippet.query.filter_by(author_id=target_user_id).all()
        else:
            snippets = Snippet.query.filter_by(author_id=target_user_id, is_public=True).all()

        return [s.to_dict() for s in snippets], None

    @staticmethod
    def get_snippets_by_topic(topic_id):
        topic = Topic.query.get(topic_id)
        if not topic:
            return None, "Topic not found"

        snippets = Snippet.query.filter_by(topic_id=topic_id, is_public=True).all()
        return [s.to_dict() for s in snippets], None

    @staticmethod
    def create_snippet(data, images, author_id):
        if not data.get('title') or not data.get('code_content'):
            return None, "Title and code_content are required"

        topic_id = data.get('topic_id')
        if topic_id:
            if not Topic.query.get(topic_id):
                return None, "The specified topic does not exist"

        try:
            is_public_str = str(data.get('is_public', 'true')).lower()
            is_public = is_public_str in ['true', '1', 'yes']

            new_snippet = Snippet(
                title=data.get('title'),
                language=data.get('language', 'JavaScript'),
                description=data.get('description', ''),
                code_content=data.get('code_content'),
                is_public=is_public,
                author_id=author_id,
                topic_id=topic_id
            )
            db.session.add(new_snippet)
            db.session.flush()

            if images:
                for file in images:
                    if file and file.filename:
                        image_url = SnippetService._handle_image_upload(file, new_snippet.snippet_id)

                        new_image = SnippetImage(
                            snippet_id=new_snippet.snippet_id,
                            image_url=image_url
                        )
                        db.session.add(new_image)

            db.session.commit()

            # Invalidate cache
            try:
                cache_service.invalidate_public_feed()
                cache_service.invalidate_private(author_id)
            except Exception as e:
                print(f'[Cache] Invalidation error on create: {e}')

            # Notify followers (fire-and-forget)
            try:
                author = User.get_by_id(author_id)
                if author:
                    NotificationService.create_and_push(author, new_snippet)
            except Exception as e:
                print(f'[Notification] create_and_push error: {e}')

            return new_snippet.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def update_snippet(snippet_id, data, images, requester_id):
        snippet = Snippet.query.get(snippet_id)
        if not snippet:
            return None, "Snippet not found"

        if int(snippet.author_id) != int(requester_id):
            return None, "Unauthorized: You do not own this snippet"

        new_topic_id = data.get('topic_id')
        if new_topic_id and new_topic_id != snippet.topic_id:
            if not Topic.query.get(new_topic_id):
                return None, "The specified topic does not exist"
            snippet.topic_id = new_topic_id

        try:
            # 1. Handle existing images deletion
            deleted_image_ids_str = data.get('deleted_image_ids')
            if deleted_image_ids_str:
                deleted_ids = [
                    int(img_id.strip())
                    for img_id in deleted_image_ids_str.split(',')
                    if img_id.strip().isdigit()
                ]

                if deleted_ids:
                    images_to_delete = SnippetImage.query.filter(
                        SnippetImage.image_id.in_(deleted_ids),
                        SnippetImage.snippet_id == snippet.snippet_id
                    ).all()

                    for img in images_to_delete:
                        SnippetService._delete_image_file(img.image_url)
                        db.session.delete(img)

            # 2. Update textual information
            if 'is_public' in data:
                is_public_str = str(data.get('is_public')).lower()
                snippet.is_public = is_public_str in ['true', '1', 'yes']

            snippet.title = data.get('title', snippet.title)
            snippet.language = data.get('language', snippet.language)
            snippet.description = data.get('description', snippet.description)
            snippet.code_content = data.get('code_content', snippet.code_content)

            # 3. Add new images
            if images:
                for file in images:
                    if file and file.filename:
                        image_url = SnippetService._handle_image_upload(file, snippet.snippet_id)

                        new_image = SnippetImage(
                            snippet_id=snippet.snippet_id,
                            image_url=image_url
                        )
                        db.session.add(new_image)

            db.session.commit()

            # Invalidate cache
            try:
                cache_service.invalidate_public_feed()
                cache_service.invalidate_private(requester_id)
            except Exception as e:
                print(f'[Cache] Invalidation error on update: {e}')

            return snippet.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def delete_snippet(snippet_id, requester_id):
        snippet = Snippet.query.get(snippet_id)
        if not snippet:
            return None, "Snippet not found"

        if int(snippet.author_id) != int(requester_id):
            return None, "Unauthorized: You do not own this snippet"

        try:
            if snippet.images:
                for image in snippet.images:
                    SnippetService._delete_image_file(image.image_url)

            db.session.delete(snippet)
            db.session.commit()

            # Invalidate cache
            try:
                cache_service.invalidate_public_feed()
                cache_service.invalidate_private(requester_id)
            except Exception as e:
                print(f'[Cache] Invalidation error on delete: {e}')

            return True, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def like_snippet(snippet_id, user_id):
        snippet = Snippet.query.get(snippet_id)
        user = User.get_by_id(user_id)

        if not snippet:
            return None, "Snippet not found"

        if not snippet.is_public and int(snippet.author_id) != int(user_id):
            return None, "Unauthorized"

        if user in snippet.liked_by:
            return None, "This snippet is already liked by you"

        try:
            snippet.liked_by.append(user)
            snippet.like_count = len(snippet.liked_by)
            db.session.commit()

            # Like count changes: invalidate public feed + author's private cache
            # (private snippets can only be liked by their owner, so their cached
            # like_count would be stale if we skip this)
            try:
                cache_service.invalidate_public_feed()
                cache_service.invalidate_private(snippet.author_id)
            except Exception as e:
                print(f'[Cache] Invalidation error on like: {e}')

            return {"like_count": snippet.like_count}, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def unlike_snippet(snippet_id, user_id):
        snippet = Snippet.query.get(snippet_id)
        user = User.get_by_id(user_id)

        if not snippet:
            return None, "Snippet not found"

        if not snippet.is_public and int(snippet.author_id) != int(user_id):
            return None, "Unauthorized"

        if user not in snippet.liked_by:
            return None, "You haven't liked this snippet yet"

        try:
            snippet.liked_by.remove(user)
            snippet.like_count = len(snippet.liked_by)
            db.session.commit()

            # Like count changes: invalidate public feed + author's private cache
            try:
                cache_service.invalidate_public_feed()
                cache_service.invalidate_private(snippet.author_id)
            except Exception as e:
                print(f'[Cache] Invalidation error on unlike: {e}')

            return {"like_count": snippet.like_count}, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    # ---------------------------------------------------------------------------
    # Merge sort helper
    # ---------------------------------------------------------------------------

    @staticmethod
    def _sort_key(snippet_dict: dict, sort_by: str):
        """Return a sort key for an in-memory snippet dict."""
        if sort_by == 'most_liked':
            return snippet_dict.get('like_count', 0)
        # 'newest' / 'oldest' — sort by creation_date string (ISO format sorts lexicographically)
        return snippet_dict.get('creation_date', '')

    @staticmethod
    def _merge_and_paginate(public_snippets: list, private_snippets: list,
                            page: int, limit: int, sort_by: str) -> dict:
        """
        Merge a full list of public snippets and all the user's private
        snippets, sort them, then slice out the requested page.

        Public snippets come pre-sorted from the DB but we re-sort after
        merging so that private snippets land in the correct position.
        """
        combined = public_snippets + private_snippets

        reverse = sort_by != 'oldest'  # newest & most_liked → descending
        combined.sort(key=lambda s: SnippetService._sort_key(s, sort_by), reverse=reverse)

        total = len(combined)
        start = (page - 1) * limit
        end = start + limit
        page_items = combined[start:end]

        return {
            "snippets": page_items,
            "hasMore": end < total,
            "total": total,
        }

    # ---------------------------------------------------------------------------
    # Main feed query — now split into public (shared cache) + private (per-user)
    # ---------------------------------------------------------------------------

    @staticmethod
    def get_all_public_snippets(user_id, page=1, limit=10, topic_name=None, language=None, sort_by='newest'):
        try:
            # ------------------------------------------------------------------
            # 1. Fetch PUBLIC snippets (shared cache)
            # ------------------------------------------------------------------
            public_snippets = cache_service.get_public_snippets(topic_name, language, sort_by)

            if public_snippets is None:
                # Cache MISS — query the DB
                query = Snippet.query.filter(Snippet.is_public == True)

                if topic_name and topic_name.lower() != 'all':
                    query = query.join(Topic).filter(Topic.name.ilike(topic_name))

                if language and language.lower() != 'all':
                    query = query.filter(Snippet.language.ilike(language))

                if sort_by == 'oldest':
                    query = query.order_by(Snippet.creation_date.asc(), Snippet.snippet_id.asc())
                elif sort_by == 'most_liked':
                    query = query.order_by(Snippet.like_count.desc(), Snippet.snippet_id.desc())
                else:  # newest (default)
                    query = query.order_by(Snippet.creation_date.desc(), Snippet.snippet_id.desc())

                public_snippets = [s.to_dict() for s in query.all()]

                # Store in shared cache — page-agnostic, full list
                try:
                    cache_service.set_public_snippets(topic_name, language, sort_by, public_snippets)
                except Exception as e:
                    print(f'[Cache] Write error (public snippets): {e}')

            # ------------------------------------------------------------------
            # 2. Fetch PRIVATE snippets for this user (per-user cache)
            # ------------------------------------------------------------------
            private_snippets = cache_service.get_private_snippets(user_id)

            if private_snippets is None:
                # Cache MISS — query the DB
                private_query = Snippet.query.filter(
                    Snippet.author_id == user_id,
                    Snippet.is_public == False
                )
                private_snippets = [s.to_dict() for s in private_query.all()]

                try:
                    cache_service.set_private_snippets(user_id, private_snippets)
                except Exception as e:
                    print(f'[Cache] Write error (private snippets): {e}')

            # ------------------------------------------------------------------
            # 3. Apply the same filters to the private list in memory.
            #    The private cache stores ALL private snippets (no filter) so it
            #    can be reused across different filter combinations — but before
            #    merging we must narrow it down to match the current request.
            # ------------------------------------------------------------------
            filtered_private = private_snippets

            if language and language.lower() != 'all':
                filtered_private = [
                    s for s in filtered_private
                    if (s.get('language') or '').lower() == language.lower()
                ]

            if topic_name and topic_name.lower() != 'all':
                filtered_private = [
                    s for s in filtered_private
                    if (s.get('topic') or {}).get('name', '').lower() == topic_name.lower()
                ]

            # ------------------------------------------------------------------
            # 4. Merge + sort + paginate in memory
            # ------------------------------------------------------------------
            result = SnippetService._merge_and_paginate(
                public_snippets, filtered_private, page, limit, sort_by
            )
            return result, None


        except Exception as e:
            return None, str(e)
