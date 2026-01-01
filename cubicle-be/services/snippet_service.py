from sqlalchemy import or_

from models.snippet import Snippet
from models.user import User
from models.topic import Topic
from extensions.otp_ext import db


class SnippetService:

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
    def create_snippet(data, author_id):
        if not data.get('title') or not data.get('code_content'):
            return None, "Title and code_content are required"

        topic_id = data.get('topic_id')
        if topic_id:
            if not Topic.query.get(topic_id):
                return None, "The specified topic does not exist"

        try:
            new_snippet = Snippet(
                title=data.get('title'),
                language=data.get('language', 'Javascript'),
                description=data.get('description', ''),
                code_content=data.get('code_content'),
                is_public=data.get('is_public', True),
                author_id=author_id,
                topic_id=topic_id
            )
            db.session.add(new_snippet)
            db.session.commit()
            return new_snippet.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def update_snippet(snippet_id, data, requester_id):
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
            snippet.title = data.get('title', snippet.title)
            snippet.language = data.get('language', snippet.language)
            snippet.description = data.get('description', snippet.description)
            snippet.code_content = data.get('code_content', snippet.code_content)
            snippet.is_public = data.get('is_public', snippet.is_public)

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
    def get_all_public_snippets(user_id):
        try:
            snippets = Snippet.query.filter(
                or_(
                    Snippet.is_public == True,
                    Snippet.author_id == user_id
                )
            ).order_by(Snippet.creation_date.desc()).all()

            return [s.to_dict() for s in snippets], None
        except Exception as e:
            return None, str(e)