from models.user import User
from extensions.otp_ext import db

class UserService:

    @staticmethod
    def get_full_profile(user_id, current_user_id):
        user = User.get_by_id(user_id)
        if not user:
            return None, "User not found"
        try:
            profile_data = user.to_full_dict(requester_id=current_user_id)
            return profile_data, None

        except Exception as e:
            return None, str(e)

    @staticmethod
    def follow_user(follower_id, followed_id):
        if int(follower_id) == int(followed_id):
            return None, "You cannot follow yourself"

        follower = User.get_by_id(follower_id)
        followed = User.get_by_id(followed_id)

        if not followed:
            return None, "User to follow not found"

        if follower.following.filter_by(user_id=followed_id).first():
            return None, "Already following this user"

        try:
            follower.following.append(followed)
            db.session.commit()
            return {"status": "followed"}, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def unfollow_user(follower_id, followed_id):
        follower = User.get_by_id(follower_id)
        followed = User.get_by_id(followed_id)

        if not followed:
            return None, "User not found"

        if not follower.following.filter_by(user_id=followed_id).first():
            return None, "You are not following this user"

        try:
            follower.following.remove(followed)
            db.session.commit()
            return {"status": "unfollowed"}, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def get_followers(user_id):
        user = User.get_by_id(user_id)
        if not user:
            return None, "User not found"

        return [f.to_dict() for f in user.followers], None


    @staticmethod
    def get_following(user_id):
        user = User.get_by_id(user_id)
        if not user:
            return None, "User not found"

        return [u.to_dict() for u in user.following.all()], None