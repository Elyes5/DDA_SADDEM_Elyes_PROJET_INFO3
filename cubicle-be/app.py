from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_jwt_extended import JWTManager
from auth.otp_auth import auth_bp
from extensions.otp_ext import db, mail, jwt

app = Flask(__name__)

# Database Config
app.config['SECRET_KEY'] = "SECRET_KEY"
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///cubicle.db"
app.config['JWT_SECRET_KEY'] = "JWT_SECRET_KEY"

# Email Config
# TODO: Change MAIL_SERVER for infomaniak smtp server when pushing for prod
app.config['MAIL_SERVER'] = 'localhost'
app.config['MAIL_PORT'] = 8025


db.init_app(app)
mail.init_app(app)
jwt.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(auth_bp, url_prefix='/api/auth')

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(debug=True,host="0.0.0.0")