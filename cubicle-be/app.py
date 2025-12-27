from flask import Flask
from dotenv import load_dotenv
import os
from flask_migrate import Migrate
from auth.otp_auth import auth_bp
from extensions.otp_ext import db, mail, jwt
from config.config_env import config_map
from config.config_ca import init_ssl
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

# ===== JWT COOKIES =====
app.config.from_object("config.config_jwt_cookies")

# ===== INITIALIZE EXTENSIONS =====
init_ssl(app)
db.init_app(app)
mail.init_app(app)
jwt.init_app(app)

# ===== Setup Flask migrations =====
migrate = Migrate(app, db)

# ===== BLUEPRINTS =====
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# ===== ROUTES =====
@app.route("/")
def server_working():
    return "<p>Serving on port 5000</p>"

# ===== RUN =====
if __name__ == "__main__":
    debug = env != "production"
    app.run(debug=debug, host="0.0.0.0")
