from flask import Flask, send_from_directory
from dotenv import load_dotenv
import os
from flask_migrate import Migrate
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

# ===== REMOVE REDIRECTIONS =====
app.url_map.strict_slashes = False

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
register_routes(app)

# ===== ROUTES =====
@app.route('/')
def server_working():
    return "<p>Serving on port 5000</p>"

if os.getenv('FLASK_ENV') == 'development':
    UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads')
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(UPLOAD_FOLDER, filename)

# ===== RUN =====
if __name__ == "__main__":
    debug = env != "production"
    app.run(debug=debug, host="0.0.0.0")