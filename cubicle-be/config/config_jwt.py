import os

# Determine environment
ENV = os.getenv("FLASK_ENV", "development")  # defaults to development

# ===== JWT / COOKIE SECRET KEYS =====
if ENV == "production":
    SECRET_KEY = os.getenv("PROD_COOKIE_SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("PROD_JWT_SECRET_KEY")
else:
    SECRET_KEY = os.getenv("DEV_COOKIE_SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("DEV_JWT_SECRET_KEY")

# Optional: JWT settings
JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES"))
JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES"))