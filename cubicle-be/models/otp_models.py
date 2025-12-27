from datetime import datetime as dt
import datetime
from datetime import timedelta
from extensions.otp_ext import db

# Models
from datetime import datetime, timezone

class OTP(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    attempts = db.Column(db.Integer, default=0)

    # Check for code validity
    def is_valid(self):
        return dt.now(datetime.UTC).replace(tzinfo=None) < self.created_at + timedelta(minutes=10)
