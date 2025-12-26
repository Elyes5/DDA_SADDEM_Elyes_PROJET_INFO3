from extensions.otp_ext import db
from datetime import datetime, timezone

snippet_topic = db.Table('snippet_topic',
    db.Column('snippet_id', db.Integer, db.ForeignKey('snippet.snippet_id', ondelete="CASCADE"), primary_key=True),
    db.Column('topic_id', db.Integer, db.ForeignKey('topic.topic_id', ondelete="CASCADE"), primary_key=True)
)

class Snippet(db.Model):
    __tablename__ = 'snippet'
    snippet_id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    code_content = db.Column(db.Text)
    language = db.Column(db.String(50))
    description = db.Column(db.Text)
    is_public = db.Column(db.Boolean, default=True)
    view_count = db.Column(db.Integer, default=0)
    like_count = db.Column(db.Integer, default=0)
    creation_date = db.Column(db.Date, default=lambda: datetime.now(timezone.utc).date())
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    author = db.relationship('User', back_populates='snippets')
    
    reviews = db.relationship('Review', back_populates='snippet', cascade="all, delete-orphan")
    
    topics = db.relationship('Topic', secondary=snippet_topic, back_populates='snippets')
    liked_by = db.relationship('User', secondary='user_likes_snippet', back_populates='liked_snippets')