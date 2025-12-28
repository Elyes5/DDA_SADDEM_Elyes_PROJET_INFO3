import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()
# Construct database URL depending on the environment
def build_db_uri(prefix):
    password = os.getenv(f"{prefix}_DB_PASSWORD") or ""
    password = quote_plus(password)

    return (
        f"mysql+pymysql://"
        f"{os.getenv(f'{prefix}_DB_USER')}:{password}@"
        f"{os.getenv(f'{prefix}_DB_HOST')}:"
        f"{os.getenv(f'{prefix}_DB_PORT')}/"
        f"{os.getenv(f'{prefix}_DB_NAME')}?charset=utf8mb4"
    )


class BaseConfig:
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = build_db_uri("DEV")
    DEBUG = True


class ProductionConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = build_db_uri("PROD")
    DEBUG = False


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
