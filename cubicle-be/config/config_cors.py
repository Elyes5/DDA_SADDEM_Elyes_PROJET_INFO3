import os
from flask_cors import CORS


def setup_cors(app):
    # Determine environment (default to development)
    env = os.getenv("FLASK_ENV", "development")
    prod_url = os.getenv("PROD_FRONT_END_ORIGIN", "https://cubicleapp.tech")
    prod_url_alias = os.getenv("PROD_FRONT_END_ORIGIN_ALIAS", "https://www.cubicleapp.tech")
    dev_url = os.getenv("DEV_FRONT_END_ORIGIN", "http://localhost:5173")
    if env == "production":
        origins = [prod_url,prod_url_alias]
    else:
        origins = [dev_url]

    # Apply CORS settings
    CORS(app, resources={
        r"/api/*": {
            "origins": origins,
            "supports_credentials": True,  # Allows HttpOnly cookies
            "allow_headers": ["Content-Type", "X-CSRF-TOKEN"],  # Necessary for CSRF protection
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
        }
    })