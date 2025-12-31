from models.topic import Topic
from extensions.otp_ext import db

class TopicService:
    @staticmethod
    def get_all_topics():
        try:
            topics = Topic.query.order_by(Topic.popularity_score.desc()).all()
            return [t.to_dict() for t in topics], None
        except Exception as e:
            return None, str(e)

    @staticmethod
    def get_topic_by_id(topic_id):
        topic = Topic.query.get(topic_id)
        if not topic:
            return None, "Topic not found"
        return topic.to_dict(), None

    @staticmethod
    def create_topic(data):
        if not data.get('name') or not data.get('description'):
            return None, "Name and description are required"

        if Topic.query.filter_by(name=data.get('name')).first():
            return None, "Topic name already exists"

        try:
            new_topic = Topic(
                name=data.get('name'),
                description=data.get('description')
            )
            db.session.add(new_topic)
            db.session.commit()
            return new_topic.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, str(e)