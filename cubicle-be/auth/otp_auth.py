from datetime import timezone
import os
from flask import request, jsonify, Blueprint
from flask_mail import Message
from flask_jwt_extended import create_access_token, set_access_cookies
import secrets
from sqlalchemy.exc import IntegrityError
from flask import current_app
from models.otp_models import OTP
from models.user import User
from extensions.otp_ext import db, mail
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime
import re
from flask_jwt_extended import jwt_required, get_jwt_identity
from azure.storage.blob import BlobServiceClient
from flask import render_template
# Functions
def send_email(sender, recipients, code, subject="Cubicle One-Time Password"):
    """
    Send OTP email using Flask-Mail with a template from templates/email_template.html.
    """
    current_year = datetime.now().year
    html_content = render_template(
        "email_template.html",
        code=code,
        year=current_year
    )

    message = Message(
        subject=subject,
        sender=sender,
        recipients=recipients,
        html=html_content
    )
    mail.send(message)
auth_bp = Blueprint('auth', __name__)

# Login
@auth_bp.route('/login', methods=['POST'])
def email_login():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required."}), 400

    email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    if not re.match(email_regex, email):
        return jsonify({"message": "Invalid email format."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Email is not registered, please sign up."}), 400

    # Generate OTP code
    otp_code = f"{secrets.randbelow(1_000_000):06d}"

    # Clean old OTPs
    OTP.query.filter_by(email=email).delete()
    db.session.add(OTP(email=email, code=otp_code))
    db.session.commit()

    # Send OTP email via Infomaniak SMTP, let's note that sender is configured on the config/config_smtp
    try:
        send_email(
            sender=current_app.config["MAIL_DEFAULT_SENDER"],
            recipients=[email],
            code=otp_code,
            subject="Cubicle One-Time Password"
        )
    except Exception as e:
        return jsonify({"message": "Error sending email", "error": str(e)}), 500

    if os.getenv("FLASK_ENV", "development") != "production":
        print(f"[DEV OTP] {email}: {otp_code}")

    return jsonify({"message": "OTP code sent!"}), 200


ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@auth_bp.route('/register', methods=['POST'])
def register_user():
    """
    Register a new user with optional avatar upload.
    - Local dev: store in uploads/avatars/
    - Production: store in Azure Blob Storage container
    """
    data = request.form
    username = data.get('username')
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    bio = data.get('bio')
    phone_number = data.get('phone_number')

    # Validate required fields
    if not username or not email or not first_name or not last_name:
        return jsonify({"message": "Username, email, first name, and last name are required."}), 400

    # Validate email format
    email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    if not re.match(email_regex, email):
        return jsonify({"message": "Invalid email format."}), 400

    # Handle avatar file
    avatar_url = None
    file = request.files.get('avatar')

    if file:
        # Check if extension is valid
        if not allowed_file(file.filename):
            return jsonify({"message": "Invalid file extension. Please upload an image (png, jpg, jpeg, gif)."}), 400

        # Generate a unique filename
        filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"

        if current_app.config.get("ENV") == "development":
            # Local storage
            upload_folder = current_app.config["LOCAL_UPLOAD_FOLDER"]
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            avatar_url = f"/uploads/avatars/{filename}"
        else:
            # Production: Azure Blob Storage
            blob_service_client = BlobServiceClient.from_connection_string(
                current_app.config["AZURE_STORAGE_CONNECTION_STRING"]
            )
            container_client = blob_service_client.get_container_client(
                current_app.config["AZURE_STORAGE_CONTAINER"]
            )
            blob_client = container_client.get_blob_client(filename)
            blob_client.upload_blob(file, overwrite=True)
            account_name = current_app.config["AZURE_STORAGE_ACCOUNT_NAME"]
            container_name = current_app.config["AZURE_STORAGE_CONTAINER"]
            avatar_url = f"https://{account_name}.blob.core.windows.net/{container_name}/{filename}"

    # Create new user instance
    new_user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        bio=bio,
        avatar_url=avatar_url,
        phone_number=phone_number,
        is_verified=False,
        join_date=datetime.now(timezone.utc)
    )

    # Save to database
    try:
        db.session.add(new_user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Username or email already exists."}), 400

    return jsonify({
        "message": "User registered successfully. Please verify your email."
    }), 201

# Verify Code with 3 attempts limit
@auth_bp.route('/verify-code', methods=['POST'])
def verify_code():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')

    if not email or not code:
        return jsonify({"message": "Missing email or code"}), 400

    # 1. Recover OTP
    otp_entry = OTP.query.filter_by(email=email).first()
    if not otp_entry:
        return jsonify({"message": "Incorrect email or code"}), 400

    # 2. Manage attempts (max 3)
    if otp_entry.attempts is None:
        otp_entry.attempts = 0

    if otp_entry.attempts >= 3:
        db.session.delete(otp_entry)
        db.session.commit()
        return jsonify({"message": "Too many failed attempts. OTP is now invalid."}), 403

    # 3. Verify if the code is correct or not
    if otp_entry.code != code:
        otp_entry.attempts += 1
        db.session.commit()
        remaining = max(0, 3 - otp_entry.attempts)
        return jsonify({"message": f"Incorrect code. {remaining} attempts left."}), 401

    # 4. Verify is the OTP is valid (The otp should only be valid for 10 minutes)
    if not otp_entry.is_valid():
        db.session.delete(otp_entry)
        db.session.commit()
        return jsonify({"message": "The code has expired"}), 401

    # 5. Get and verify the user.
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 400

    # 6. Update user status to verified
    if not user.is_verified:
        user.is_verified = True

    # 7. Create the JWT (using user_id as identity)
    access_token = create_access_token(identity=str(user.user_id))

    # 8. Prepare the response (the token won't be returned, it will be stored in cookies)
    response = jsonify({
        "message": "User verified successfully",
        "user": {
            "id": user.user_id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "bio": user.bio,
            "avatar_url": user.avatar_url,
            "phone_number": user.phone_number,
            "is_verified": user.is_verified,
            "join_date": user.join_date.isoformat() if user.join_date else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "badge": user.badge.name if user.badge else None,
            "snippets_ids": [s.snippet_id for s in user.snippets],
            "liked_snippets_ids": [s.snippet_id for s in user.liked_snippets],
            "followers": user.followers.count()
        }
    })

    # 9. Clean up the database and remove the old OTP
    db.session.delete(otp_entry)
    db.session.commit()

    # 10. Injection du cookie JWT dans les headers de la réponse
    set_access_cookies(response, access_token)

    return response, 200


# Check if the user has a valid JWT cookie and return their data.
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Return user
    return jsonify({
        "user": {
            "id": user.user_id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "bio": user.bio,
            "avatar_url": user.avatar_url,
            "phone_number": user.phone_number,
            "is_verified": user.is_verified,
            "join_date": user.join_date.isoformat() if user.join_date else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "badge": user.badge.name if user.badge else None,
            "snippets_ids": [s.snippet_id for s in user.snippets],
            "liked_snippets_ids": [s.snippet_id for s in user.liked_snippets],
            "followers_count": user.followers.count()
        }
    }), 200