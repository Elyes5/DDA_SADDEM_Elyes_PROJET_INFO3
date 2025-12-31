from auth.otp_auth import auth_bp
from controllers.review_controller import review_bp
from controllers.user_controller import users_bp
from controllers.snippet_controller import snippets_bp
from controllers.topic_controller import topics_bp


def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(snippets_bp, url_prefix='/api/snippets')
    app.register_blueprint(topics_bp, url_prefix='/api/topics')
    app.register_blueprint(review_bp, url_prefix='/api/reviews')