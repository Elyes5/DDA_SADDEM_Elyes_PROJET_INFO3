from extensions import db
from datetime import datetime, timezone

class Review(db.Model):
    __tablename__ = 'review'
    review_id = db.Column(db.Integer, primary_key=True)
    snippet_id = db.Column(db.Integer, db.ForeignKey('snippet.snippet_id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    rating = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    snippet = db.relationship('Snippet', back_populates='reviews')
    reviewer = db.relationship('User', back_populates='reviews')