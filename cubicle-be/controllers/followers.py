from flask import request, jsonify, Blueprint
from models.user import User
from extensions.otp_ext import db

followers_bp = Blueprint('followers', __name__)

# Routes
@followers_bp.route('/', methods=['GET'])
def get_followers():
    data = request.get_json()
    email = data.get('email')


    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    followers = user.followers.all()
    if not followers:
        return jsonify({"message": "User has no followers"}), 200
    followers_json = []
    for f in followers:
        followers_json.append({
            "user_id": f.user_id,
            "username": f.username,
            "avatar_url": f.avatar_url
        })
    return jsonify(followers_json), 200


@followers_bp.route('/follow', methods=['POST'])
def add_follower():
    data = request.get_json()
    follower = User.query.filter_by(email=data.get('follower')).first()
    following = User.query.filter_by(email=data.get('following')).first()

    if follower in following.followers.all():
        following.followers.remove(follower)
        db.session.commit()
        return jsonify({"message": "User unfollowed"}), 200
    following.followers.append(follower)
    db.session.commit()
    return jsonify({"message": "User followed"}), 200