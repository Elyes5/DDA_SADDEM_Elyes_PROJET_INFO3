import os

flask_env = os.getenv("FLASK_ENV", "production").lower()
_COOKIE_ENV_PREFIX = "DEV" if flask_env == "development" else "PROD"


def get_cookie_bool(name, default):
    value = os.getenv(f"{_COOKIE_ENV_PREFIX}_{name}", default)
    return value.lower() == "true"


def get_cookie_str(name, default):
    return os.getenv(f"{_COOKIE_ENV_PREFIX}_{name}", default)


JWT_TOKEN_LOCATION = ["cookies"]

JWT_COOKIE_SECURE = get_cookie_bool("JWT_COOKIE_SECURE", "false")
JWT_COOKIE_SAMESITE = get_cookie_str("JWT_COOKIE_SAMESITE", "None")
JWT_COOKIE_CSRF_PROTECT = get_cookie_bool("JWT_COOKIE_CSRF_PROTECT", "true")
JWT_ACCESS_COOKIE_PATH = "/"