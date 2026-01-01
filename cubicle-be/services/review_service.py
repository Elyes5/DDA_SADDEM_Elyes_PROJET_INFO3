from models.review import Review
from models.snippet import Snippet
from extensions.otp_ext import db
from models.user import User

class ReviewService:
    @staticmethod
    def add_or_update_review(snippet_id, user_id, rating, comment=None):
        try:
            snippet_id = int(snippet_id)
            user_id = int(user_id)
            rating = int(rating)
        except (ValueError, TypeError):
            return None, "Invalid ID or rating format"

        if not (1 <= rating <= 5):
            return None, "Rating must be between 1 and 5"

        reviewer = User.query.get(user_id)
        if not reviewer:
            return None, f"User with ID {user_id} does not exist"

        snippet = Snippet.query.get(snippet_id)
        if not snippet:
            return None, "Snippet not found"

        if not snippet.is_public and int(snippet.author_id) != user_id:
            return None, "Unauthorized"

        if int(snippet.author_id) == user_id:
            return None, "You cannot review your own snippet"

        existing_review = Review.query.filter_by(
            snippet_id=snippet_id,
            reviewer_id=user_id
        ).first()

        try:
            print(comment)
            if existing_review:
                existing_review.rating = rating
                existing_review.comment = comment
                message = "Review updated"
                db.session.flush()
                review_data = existing_review.to_dict()
            else:
                new_review = Review(
                    snippet_id=snippet_id,
                    reviewer_id=user_id,
                    rating=rating,
                    comment=comment
                )
                db.session.add(new_review)
                message = "Review added"
                db.session.flush()
                review_data = new_review.to_dict()

            db.session.commit()
            return {"message": message, "review": review_data}, None

        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"

    @staticmethod
    def delete_review(snippet_id, user_id):
        snippet = Snippet.query.get(snippet_id)
        if not snippet:
            return None, "Snippet not found"

        if not snippet.is_public and int(snippet.author_id) != int(user_id):
            return None, "Unauthorized"

        review = Review.query.filter_by(snippet_id=snippet_id, reviewer_id=user_id).first()
        if not review:
            return None, "Review not found"

        try:
            db.session.delete(review)
            db.session.commit()
            return {"message": "Review deleted"}, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)