from extensions.otp_ext import db

class Badge(db.Model):
    __tablename__ = 'badge'
    badge_id = db.Column(db.Integer, primary_key=True)
    badge_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    date_obtained = db.Column(db.Date)
    icon_url = db.Column(db.String(255))
    users = db.relationship('User', back_populates='badge')

    def to_dict(self):
        return {
            "badge_id": self.badge_id,
            "badge_name": self.badge_name,
            "description": self.description,
            "date_obtained": self.date_obtained.isoformat() if self.date_obtained else None,
            "icon_url": self.icon_url
        }