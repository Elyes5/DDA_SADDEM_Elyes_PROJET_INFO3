import os
from flask_cors import CORS


def setup_cors(app):
    """
    Centralized CORS configuration using environment variables.
    """
    # 1. Determine environment (default to development)
    env = os.getenv("FLASK_ENV", "development")
    prod_url = os.getenv("PROD_FRONT_END_ORIGIN", "development")
    dev_url = os.getenv("DEV_FRONT_END_ORIGIN", "development")
    if env == "production":
        origins = [prod_url]
    else:
        origins = [dev_url]

    # 3. Apply CORS settings
    CORS(app, resources={
        r"/api/*": {
            "origins": origins,
            "supports_credentials": True,  # Allows HttpOnly cookies
            "allow_headers": ["Content-Type", "X-CSRF-TOKEN"],  # Necessary for CSRF protection
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
        }
    })