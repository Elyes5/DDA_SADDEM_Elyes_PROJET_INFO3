from flask import Flask
from dotenv import load_dotenv
import os
from flask_migrate import Migrate
from auth.otp_auth import auth_bp
from controllers import followers, user_controller
from extensions.otp_ext import db, mail, jwt
from config.config_env import config_map
from config.config_ca import init_ssl
from config.config_cors import setup_cors
from models.user import User
from models.topic import Topic
from models.snippet import Snippet
from models.review import Review
from models.user import user_likes_snippet
from routes.routes import register_routes

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

# ===== CORS Configuration =====
setup_cors(app)

# ===== INITIALIZE EXTENSIONS =====
init_ssl(app)
db.init_app(app)
mail.init_app(app)
jwt.init_app(app)

# ===== Setup Flask migrations =====
migrate = Migrate(app, db)

# ===== BLUEPRINTS =====
app.register_blueprint(followers.followers_bp, url_prefix='/api/followers')
register_routes(app)

# ===== ROUTES =====
@app.route("/")
def server_working():
    return "<p>Serving on port 5000</p>"

# ===== RUN =====
if __name__ == "__main__":
    debug = env != "production"
    app.run(debug=debug, host="0.0.0.0")
