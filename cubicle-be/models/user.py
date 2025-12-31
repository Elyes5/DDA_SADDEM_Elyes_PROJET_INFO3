from extensions.otp_ext import db
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
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    join_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime)
    snippets = db.relationship('Snippet', back_populates='author', cascade="all, delete-orphan")
    reviews = db.relationship('Review', back_populates='reviewer', cascade="all, delete-orphan")
    liked_snippets = db.relationship('Snippet', secondary=user_likes_snippet, back_populates='liked_by')
    
    followers = db.relationship(
        'User', secondary=user_follower,
        primaryjoin=(user_follower.c.followed_id == user_id),
        secondaryjoin=(user_follower.c.follower_id == user_id),
        backref=db.backref('following', lazy='dynamic'), lazy='dynamic'
    )

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "bio": self.bio,
            "avatar_url": self.avatar_url,
            "phone_number": self.phone_number,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "join_date": self.join_date.isoformat() if self.last_login else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }

    def to_full_dict(self, requester_id=None):
        current_id = int(requester_id) if requester_id is not None else None
        is_owner = (current_id == self.user_id)

        data = self.to_dict()
        data.update({
            "snippets": [
                s.to_dict() for s in self.snippets
                if is_owner or s.is_public
            ],
            "liked_snippets": [
                s.to_dict() for s in self.liked_snippets
                if s.is_public or (current_id and int(s.user_id) == current_id)
            ],
            "followers_count": self.followers.count(),
            "following_count": self.following.count()
        })
        return data

    @staticmethod
    def get_by_id(user_id):
        return User.query.get(user_id)