from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required
from services.topic_service import TopicService

topics_bp = Blueprint('topics', __name__)

@topics_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_topics():
    topics, error = TopicService.get_all_topics()
    if error:
        return jsonify({'error': 'Failed to fetch topics', 'details': error}), 500
    return jsonify(topics), 200

@topics_bp.route('/<int:topic_id>', methods=['GET'])
@jwt_required()
def get_topic(topic_id):
    topic, error = TopicService.get_topic_by_id(topic_id)
    if error:
        return jsonify({'error': error}), 404
    return jsonify(topic), 200

@topics_bp.route('/', methods=['POST'])
@jwt_required()
def create_topic():
    topic, error = TopicService.create_topic(request.get_json())
    if error:
        status = 400 if ("required" in error or "exists" in error) else 500
        return jsonify({'error': error}), status
    return jsonify(topic), 201