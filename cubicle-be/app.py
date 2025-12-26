from flask import Flask
from dotenv import load_dotenv
import os
from urllib.parse import quote_plus

from auth.otp_auth import auth_bp
from extensions.otp_ext import db, mail, jwt
from config.config_env import config_map
from models.user import User
from models.topic import Topic
from models.snippet import Snippet
from models.review import Review
from models.badge import Badge
from models.user import user_likes_snippet
from models.snippet import snippet_topic

load_dotenv()  # Load environment variables from .env

app = Flask(__name__)

# ===== FLASK ENV =====
env = os.getenv("FLASK_ENV", "development")  # default to development

# ===== SECRET KEYS =====
app.config.from_object("config.config_jwt")

# ===== DATABASE CONFIG =====
app.config.from_object(config_map.get(env, config_map["development"]))

# ===== MAIL CONFIG =====
app.config.from_object('config.config_smtp')

# ===== AZURE CONFIG =====
app.config.from_object("config.config_storage")

# ===== INITIALIZE EXTENSIONS =====
db.init_app(app)
mail.init_app(app)
jwt.init_app(app)

# ===== CREATE TABLES =====
with app.app_context():
    db.create_all()

# ===== BLUEPRINTS =====
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# ===== ROUTES =====
@app.route("/")
def server_working():
    return "<p>Serving on 5000</p>"

# ===== RUN =====
if __name__ == "__main__":
    debug = env != "production"
    app.run(debug=debug, host="0.0.0.0")
