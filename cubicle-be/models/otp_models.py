from datetime import datetime, timezone, timedelta
from extensions.otp_ext import db

class OTP(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    attempts = db.Column(db.Integer, default=0)

    # Check for code validity
    def is_valid(self):
        now = datetime.now(timezone.utc)
        created_at = self.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        return now < created_at + timedelta(minutes=10)
