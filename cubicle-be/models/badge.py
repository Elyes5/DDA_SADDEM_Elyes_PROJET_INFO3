from extensions.otp_ext import db

class Badge(db.Model):
    __tablename__ = 'badge'
    badge_id = db.Column(db.Integer, primary_key=True)
    badge_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    date_obtained = db.Column(db.Date)
    icon_url = db.Column(db.String(255))
    users = db.relationship('User', back_populates='badge')