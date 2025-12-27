import os

JWT_TOKEN_LOCATION = ["cookies"]

JWT_COOKIE_SECURE = os.getenv("JWT_COOKIE_SECURE", "false").lower() == "true"

JWT_COOKIE_SAMESITE = os.getenv("JWT_COOKIE_SAMESITE", "Lax")

JWT_COOKIE_CSRF_PROTECT = True

JWT_ACCESS_COOKIE_PATH = "/"