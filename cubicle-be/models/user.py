from extensions import db
from datetime import datetime, timezone

user_follower = db.Table('user_follower',
    db.Column('follower_id', db.Integer,db.ForeignKey('user.user_id', ondelete="CASCADE"),primary_key=True),
    db.Column('followed_id', db.Integer,db.ForeignKey('user.user_id', ondelete="CASCADE"),primary_key=True),
    db.Column('follow_date', db.DateTime,default=lambda: datetime.now(timezone.utc))
)

user_likes_snippet = db.Table('user_likes_snippet',
    db.Column('user_id', db.Integer, db.ForeignKey('user.user_id', ondelete="CASCADE"), primary_key=True),
    db.Column('snippet_id', db.Integer, db.ForeignKey('snippet.snippet_id', ondelete="CASCADE"), primary_key=True),
    db.Column('like_date', db.DateTime, default=lambda: datetime.now(timezone.utc))
)

class User(db.Model):
    __tablename__ = 'user'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    bio = db.Column(db.Text)
    avatar_url = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    join_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime)
    badge_id = db.Column(db.Integer, db.ForeignKey('badge.badge_id'))
    badge = db.relationship('Badge', back_populates='users')
    snippets = db.relationship('Snippet', back_populates='author', cascade="all, delete-orphan")
    reviews = db.relationship('Review', back_populates='reviewer', cascade="all, delete-orphan")
    liked_snippets = db.relationship('Snippet', secondary=user_likes_snippet, back_populates='liked_by')
    
    followers = db.relationship(
        'User', secondary=user_follower,
        primaryjoin=(user_follower.c.followed_id == user_id),
        secondaryjoin=(user_follower.c.follower_id == user_id),
        backref=db.backref('following', lazy='dynamic'), lazy='dynamic'
    )