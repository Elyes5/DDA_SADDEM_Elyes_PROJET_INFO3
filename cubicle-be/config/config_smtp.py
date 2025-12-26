import os

ENV = os.getenv("FLASK_ENV", "development")

# Configuration SMTP Infomaniak
MAIL_SERVER = os.getenv("SMTP_SERVER")
MAIL_PORT = int(os.getenv("SMTP_PORT"))

MAIL_USE_TLS = os.getenv("SMTP_USE_TLS").lower() == "true"
MAIL_USE_SSL = os.getenv("SMTP_USE_SSL").lower() == "true"

# Authentification (votre email complet et son mot de passe)
MAIL_USERNAME = os.getenv("SMTP_USER")
MAIL_PASSWORD = os.getenv("SMTP_PASSWORD")

# Expéditeur par défaut
MAIL_DEFAULT_SENDER = os.getenv("SMTP_DEFAULT_SENDER")

MAIL_MAX_EMAILS = None
MAIL_SUPPRESS_SEND = False