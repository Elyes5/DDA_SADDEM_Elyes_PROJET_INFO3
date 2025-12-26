import os
def init_ssl(app):
    # Kubernetes uses the DB_CA_PATH in PRODUCTION
    ca_path = os.getenv("DB_CA_PATH")

    if os.getenv("FLASK_ENV") == "production" and ca_path and os.path.exists(ca_path):
        app.config.update(
            SQLALCHEMY_ENGINE_OPTIONS={
                "connect_args": {
                    "ssl": {"ca": ca_path},
                }
            }
        )