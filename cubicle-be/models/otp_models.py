from datetime import datetime as dt
import datetime
from datetime import timedelta
from extensions.otp_ext import db

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), nullable=True)
    is_registered = db.Column(db.Boolean, default=False)

class OTP(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=dt.now(datetime.UTC))

    # Check for code validity
    def is_valid(self):
        return dt.now(datetime.UTC).replace(tzinfo=None) < self.created_at + timedelta(minutes=10)
