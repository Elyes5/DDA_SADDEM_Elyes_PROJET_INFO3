from flask import jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from services.user_service import UserService

users_bp = Blueprint('users', __name__)

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_full_profile(user_id):
    current_user_id = get_jwt_identity()
    profile, error = UserService.get_full_profile(user_id, current_user_id)

    if error:
        if error == "User not found":
            return jsonify({'error': error}), 404
        return jsonify({'error': 'Internal server error', 'details': error}), 500

    return jsonify(profile), 200

@users_bp.route('/<int:user_id>/follow', methods=['POST'])
@jwt_required()
def follow(user_id):
    current_user_id = get_jwt_identity()
    result, error = UserService.follow_user(current_user_id, user_id)
    if error:
        return jsonify({'error': error}), 400
    return jsonify(result), 200

@users_bp.route('/<int:user_id>/unfollow', methods=['POST'])
@jwt_required()
def unfollow(user_id):
    current_user_id = get_jwt_identity()
    result, error = UserService.unfollow_user(current_user_id, user_id)
    if error:
        return jsonify({'error': error}), 400
    return jsonify(result), 200

@users_bp.route('/<int:user_id>/followers', methods=['GET'])
@jwt_required()
def get_followers(user_id):
    followers, error = UserService.get_followers(user_id)
    if error:
        return jsonify({'error': error}), 404
    return jsonify(followers), 200

@users_bp.route('/<int:user_id>/following', methods=['GET'])
@jwt_required()
def get_following(user_id):
    following, error = UserService.get_following(user_id)
    if error:
        return jsonify({'error': error}), 404
    return jsonify(following), 200