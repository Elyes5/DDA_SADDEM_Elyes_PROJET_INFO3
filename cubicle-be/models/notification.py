from extensions.otp_ext import db
from datetime import datetime, timezone


class Notification(db.Model):
    __tablename__ = 'notification'

    notification_id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.user_id', ondelete='CASCADE'), nullable=False)
    actor_id = db.Column(db.Integer, db.ForeignKey('user.user_id', ondelete='CASCADE'), nullable=False)
    snippet_id = db.Column(db.Integer, db.ForeignKey('snippet.snippet_id', ondelete='CASCADE'), nullable=True)
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    recipient = db.relationship('User', foreign_keys=[recipient_id])
    actor = db.relationship('User', foreign_keys=[actor_id])
    snippet = db.relationship('Snippet')

    def to_dict(self):
        return {
            'id': self.notification_id,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'actor': {
                'id': self.actor.user_id,
                'username': self.actor.username,
                'avatar_url': self.actor.avatar_url,
            } if self.actor else None,
            'snippet': {
                'id': self.snippet.snippet_id,
                'title': self.snippet.title,
            } if self.snippet else None,
        }
