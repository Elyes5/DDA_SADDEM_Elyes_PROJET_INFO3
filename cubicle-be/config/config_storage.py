import os

ENV = os.getenv("FLASK_ENV", "development")

if ENV == "production":
    ACCOUNT_NAME = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
    ACCOUNT_KEY = os.getenv("AZURE_STORAGE_ACCOUNT_KEY")
    CONTAINER_NAME = os.getenv("AZURE_STORAGE_CONTAINER_NAME")

    AZURE_STORAGE_CONNECTION_STRING = (
        f"DefaultEndpointsProtocol=https;"
        f"AccountName={ACCOUNT_NAME};"
        f"AccountKey={ACCOUNT_KEY};"
        f"EndpointSuffix=core.windows.net"
    )
    AZURE_STORAGE_CONTAINER = CONTAINER_NAME
    AZURE_STORAGE_ACCOUNT_NAME = ACCOUNT_NAME
else:
    # Local dev folder
    LOCAL_UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads", "avatars")