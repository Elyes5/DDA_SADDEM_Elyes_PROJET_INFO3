from flask import request, jsonify, Blueprint
from models.user import User


users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
def get_user():
    data = request.get_json()
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.to_dict()), 200