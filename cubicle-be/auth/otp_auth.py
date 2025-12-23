from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from flask_jwt_extended import JWTManager, create_access_token
from datetime import datetime as dt
import datetime
from datetime import timedelta
import secrets

app = Flask(__name__)

# Database Config
app.config['SECRET_KEY'] = "SECRET_KEY"
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///cubicle.db"
app.config['JWT_SECRET_KEY'] = "JWT_SECRET_KEY"

# Email Config
# TODO: Change MAIL_SERVER for infomaniak smtp server when pushing for prod
app.config['MAIL_SERVER'] = 'localhost'
app.config['MAIL_PORT'] = 8025


db = SQLAlchemy(app)
mail = Mail(app)
jwt = JWTManager(app)


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

with app.app_context():
    db.create_all()


# Functions
def send_email(sender, recipients, content):
    msg = Message("Cubicle One Time Password",
              sender=sender,
              recipients=recipients)
    msg.body = content
    mail.send(msg)


def send_message_fake(sender, recipients, content):
    print(f"sender: {sender}")
    print(f"recipients: {recipients}")
    print(f"content: {content}")



# Login
@app.route('/api/auth/email-login', methods=['POST'])
def email_login():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"msg": "Email is required."}), 400
    
    # Check if the user exists
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "This mail is wrong or is not registered, please sign up before logging in."}), 400

    # Generate the code
    otp_code = secrets.randbelow(100000)
    otp_code = f"{otp_code:06d}" # format 1 234 into 001234

    # Clean the old code and save the new one
    OTP.query.filter_by(email=email).delete()
    new_otp = OTP(email=email, code=otp_code)
    db.session.add(new_otp)
    db.session.commit()

    # Send the email
    try:
        send_email("noreply@cubicle.net",[email], f"Welcome back to Cubicle! \n Here is your code: {otp_code} It will expire in 10 minutes.")
        #send_message_fake("noreply@cubicle.net",[email], f"Welcome back to Cubicle! \n Here is your code: {otp_code} It will expire in 10 minutes.")
    except Exception as e:
        return jsonify({"msg": "Error trying to send the email", "error": str(e)}), 500
    
    return jsonify({"msg": "Code sent!"}), 200


# Register
@app.route('/api/auth/email-register', methods=['POST'])
def email_register():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"msg": "Email is required."}), 400
    
    # Check if the user exists
    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({"msg": "This mail is wrong or is already registered, please sign in or check your email spelling."}), 400
    
    # Generate the code
    otp_code = secrets.randbelow(100000)
    otp_code = f"{otp_code:06d}" # format 1 234 into 001234
    
    OTP.query.filter_by(email=email).delete()
    otp_entry = OTP(email=email, code=otp_code)
    db.session.add(otp_entry)
    db.session.commit()

    # Send the email
    try:
        send_email("noreply@cubicle.net",[email], f"Welcome to Cubicle! \n Here is your code: {otp_code} It will expire in 10 minutes.")
        #send_message_fake("noreply@cubicle.net",[email], f"Welcome back to Cubicle! \n Here is your code: {otp_code} It will expire in 10 minutes.")
    except Exception as e:
        return jsonify({"msg": "Error trying to send the email", "error": str(e)}), 500
    
    # If everything is good, we add the user to the database
    user = User(email=email, is_registered=False)
    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "Code sent!"}), 200


# Verify Code
@app.route('/api/auth/verify-code', methods=['POST'])
def verify_code():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    is_registered = data.get('is_registered')

    if not email or not code:
        return jsonify({"msg": "Missing data"}), 400
    
    # Get the code from database
    otp_entry = OTP.query.filter_by(email=email).first()

    # Security checks
    if not otp_entry:
        return jsonify({"msg": "Incorrect email"}), 400
    
    if otp_entry.code != code:
        return jsonify({"msg": "Incorrect code"}), 401
    
    if not otp_entry.is_valid():
        db.session.delete(otp_entry)
        db.session.commit()
        return jsonify({"msg": "The code has expired"}), 401
    
    # If auth is OK, get the user to include it in the token
    user = User.query.filter_by(email=email).first()

    if is_registered:
        user.is_verified = True

    # Create a JW Token
    access_token = create_access_token(identity=user.email) # Should be better than using email

    # Cleanning the mess
    db.session.delete(otp_entry)
    db.session.commit()

    return jsonify({"msg":"Connexion approved",
                    "access_token": access_token,
                    "user": {"id": user.id, "email": user.email}
                    }), 200

app.run("localhost")