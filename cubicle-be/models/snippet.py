from extensions.otp_ext import db
from datetime import datetime, timezone


class Snippet(db.Model):
    __tablename__ = 'snippet'
    snippet_id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey('topic.topic_id'), nullable=True)

    title = db.Column(db.String(200), nullable=False)
    code_content = db.Column(db.Text)
    language = db.Column(db.String(50))
    description = db.Column(db.Text)
    is_public = db.Column(db.Boolean, default=True)
    like_count = db.Column(db.Integer, default=0)
    creation_date = db.Column(db.Date, default=lambda: datetime.now(timezone.utc).date())
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),onupdate=lambda: datetime.now(timezone.utc))

    author = db.relationship('User', back_populates='snippets')
    reviews = db.relationship('Review', back_populates='snippet', cascade="all, delete-orphan")
    liked_by = db.relationship('User', secondary='user_likes_snippet', back_populates='liked_snippets')
    topic = db.relationship('Topic', back_populates='snippets')
    images = db.relationship('SnippetImage', back_populates='snippet', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.snippet_id,
            "title": self.title,
            "description": self.description,
            "code_content": self.code_content,
            "is_public": self.is_public,
            "language": self.language,
            "like_count": len(self.liked_by) if self.liked_by else 0,
            "creation_date": self.creation_date.isoformat() if self.creation_date else None,
            "author": self.author.to_dict() if self.author else None,
            "topic": self.topic.to_dict() if self.topic else None,
            "reviews": [review.to_dict() for review in self.reviews] if self.reviews else [],
            "likes": [user.to_dict() for user in self.liked_by] if self.liked_by else [],
            "images": [image.to_dict() for image in self.images] if self.images else []
        }