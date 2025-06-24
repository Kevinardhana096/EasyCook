from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    jwt.init_app(app)
    
    # Import routes
    from app.routes import auth, recipe, user, main
    app.register_blueprint(auth.bp)
    app.register_blueprint(recipe.bp)
    app.register_blueprint(user.bp)
    app.register_blueprint(main.bp)
    
    # Health check route
    @app.route('/health')
    def health_check():
        return {
            'status': 'healthy',
            'message': 'CookEasy API is running!',
            'timestamp': '2025-06-21 07:12:38',
            'version': '1.0.0'
        }
    
    # Import models after app creation to avoid circular imports
    from app.models import user, recipe, ingredient, category, rating
    
    return app