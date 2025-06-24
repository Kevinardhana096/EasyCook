import os
from datetime import timedelta

# Get the absolute path to the backend directory
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Secret key for sessions and JWT
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'cookeasy-super-secret-key-2025-nowriafisda'
    
    # Database configuration - FIXED FOR WINDOWS
    # Use current directory instead of relative path
    DATABASE_PATH = os.path.join(os.getcwd(), 'cookeasy.db')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{DATABASE_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string-cookeasy-2025'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Upload configuration
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # API Configuration
    API_TITLE = 'CookEasy API'
    API_VERSION = 'v1.0'
    
    @staticmethod
    def init_app(app):
        # Create database directory if it doesn't exist
        os.makedirs(os.path.dirname(Config.DATABASE_PATH), exist_ok=True)

class DevelopmentConfig(Config):
    DEBUG = True
    DATABASE_PATH = os.path.join(os.getcwd(), 'cookeasy-dev.db')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or f'sqlite:///{DATABASE_PATH}'

class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}