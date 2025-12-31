from models.review import Review
from models.snippet import Snippet
from extensions.otp_ext import db

class ReviewService:
    @staticmethod
    def add_or_update_review(snippet_id, user_id, rating):
        if not (1 <= rating <= 5):
            return None, "Rating must be between 1 and 5"

        snippet = Snippet.query.get(snippet_id)
        if not snippet:
            return None, "Snippet not found"

        if not snippet.is_public and snippet.author_id != user_id:
            return None, "Unauthorized"
        if int(snippet.author_id) == int(user_id):
            return None, "You cannot review your own snippet"

        existing_review = Review.query.filter_by(
            snippet_id=snippet_id,
            reviewer_id=user_id
        ).first()

        if existing_review:
            existing_review.rating = rating
            message = "Review updated"
        else:
            new_review = Review(
                snippet_id=snippet_id,
                reviewer_id=user_id,
                rating=rating
            )
            db.session.add(new_review)
            message = "Review added"

        try:
            db.session.commit()
            return {"message": message, "rating": rating}, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

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