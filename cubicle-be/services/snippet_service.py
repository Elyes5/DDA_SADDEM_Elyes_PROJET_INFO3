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
        # Extract the original file extension (e.g., '.jpg', '.png')
        _, ext = os.path.splitext(file.filename)
        # Generate a UUID for the new filename
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
                language=data.get('language', 'Javascript'),
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

            # Notify followers (fire-and-forget — errors don't break the response)
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
                        # Delete the physical file (local or Azure)
                        SnippetService._delete_image_file(img.image_url)
                        # Delete line from DB
                        db.session.delete(img)

            # 2. Update the textual information
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
            # Delete the physical images before deleting the database record
            if snippet.images:
                for image in snippet.images:
                    SnippetService._delete_image_file(image.image_url)

            db.session.delete(snippet)
            db.session.commit()
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
            return {"like_count": snippet.like_count}, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def get_all_public_snippets(user_id, page=1, limit=10, topic_name=None):
        try:
            query = Snippet.query.filter(
                or_(
                    Snippet.is_public == True,
                    Snippet.author_id == user_id
                )
            )

            if topic_name and topic_name.lower() != 'all':
                query = query.join(Topic).filter(Topic.name.ilike(topic_name))

            query = query.order_by(Snippet.creation_date.desc(), Snippet.snippet_id.desc())

            total_items = query.count()
            
            snippets = query.offset((page - 1) * limit).limit(limit).all()

            return {
                "snippets": [s.to_dict() for s in snippets],
                "hasMore": (page * limit) < total_items,
                "total": total_items
            }, None
        except Exception as e:
            return None, str(e)