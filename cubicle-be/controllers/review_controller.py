from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.review_service import ReviewService

review_bp = Blueprint('review', __name__)


@review_bp.route('/snippet/<int:snippet_id>', methods=['POST'])
@jwt_required()
def post_review(snippet_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    rating = data.get('rating')
    comment = data.get('comment')

    if rating is None:
        return jsonify({"error": "Rating is required"}), 400

    if comment is None:
        return jsonify({"error": "Comment is required"}), 400

    result, error = ReviewService.add_or_update_review(snippet_id, user_id, rating, comment)
    if error:
        status = 403 if "Unauthorized" in error or "own" in error else 400
        if "not found" in error: status = 404
        return jsonify({"error": error}), status

    return jsonify(result), 200


@review_bp.route('/snippet/<int:snippet_id>', methods=['DELETE'])
@jwt_required()
def remove_review(snippet_id):
    user_id = get_jwt_identity()
    result, error = ReviewService.delete_review(snippet_id, user_id)
    if error:
        status = 403 if "Unauthorized" in error else 404
        return jsonify({"error": error}), status

    return jsonify(result), 200