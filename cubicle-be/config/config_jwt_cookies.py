import os

flask_env = os.getenv("FLASK_ENV", "production").lower()
_COOKIE_ENV_PREFIX = "DEV" if flask_env == "development" else "PROD"

def get_cookie_bool(name, default_val):
    value = os.getenv(f"{_COOKIE_ENV_PREFIX}_{name}", str(default_val))
    return value.lower() == "true"

def get_cookie_str(name, default_val):
    return os.getenv(f"{_COOKIE_ENV_PREFIX}_{name}", default_val)

# --- JWT Configuration ---
JWT_TOKEN_LOCATION = ["cookies"]
JWT_ACCESS_COOKIE_PATH = "/"
JWT_REFRESH_COOKIE_PATH = "/api/auth/refresh"

JWT_COOKIE_DOMAIN = get_cookie_str("JWT_COOKIE_DOMAIN", None)

# --- Security Configuration ---
JWT_COOKIE_SECURE = get_cookie_bool("JWT_COOKIE_SECURE", True)
JWT_COOKIE_SAMESITE = get_cookie_str("JWT_COOKIE_SAMESITE", "Lax") # Default to Lax now
JWT_COOKIE_CSRF_PROTECT = get_cookie_bool("JWT_COOKIE_CSRF_PROTECT", True)

# --- HttpOnly Configuration ---
JWT_ACCESS_COOKIE_HTTPONLY = True
JWT_REFRESH_COOKIE_HTTPONLY = True

# --- CSRF Configuration ---
JWT_ACCESS_CSRF_COOKIE_HTTPONLY = get_cookie_bool("JWT_ACCESS_CSRF_COOKIE_HTTPONLY", False)
JWT_REFRESH_CSRF_COOKIE_HTTPONLY = get_cookie_bool("JWT_REFRESH_CSRF_COOKIE_HTTPONLY", False)