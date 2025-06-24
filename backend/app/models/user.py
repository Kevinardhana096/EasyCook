from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import jwt
from app.config import Config

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # user, chef, admin
    
    # Profile information
    full_name = db.Column(db.String(100))
    bio = db.Column(db.Text)
    profile_image = db.Column(db.String(500))
    location = db.Column(db.String(100))
    website = db.Column(db.String(200))
    social_links = db.Column(db.JSON)  # Store social media links as JSON
    
    # Account status
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    email_verified_at = db.Column(db.DateTime)
    
    # Statistics
    follower_count = db.Column(db.Integer, default=0)
    following_count = db.Column(db.Integer, default=0)
    recipe_count = db.Column(db.Integer, default=0)
    total_likes = db.Column(db.Integer, default=0)  # Total likes received on recipes
    
    # Preferences
    dietary_preferences = db.Column(db.JSON)  # vegetarian, vegan, gluten-free, etc.
    cooking_level = db.Column(db.String(20), default='beginner')  # beginner, intermediate, expert
    favorite_cuisines = db.Column(db.JSON)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = db.Column(db.DateTime)
    last_seen_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    recipes = db.relationship('Recipe', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    ratings = db.relationship('Rating', back_populates='user', cascade='all, delete-orphan')
    bookmarks = db.relationship('Bookmark', back_populates='user', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def generate_token(self, expires_in=86400):  # 24 hours default
        """Generate JWT token"""
        payload = {
            'user_id': self.id,
            'username': self.username,
            'role': self.role,
            'exp': datetime.utcnow().timestamp() + expires_in
        }
        return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
    
    @staticmethod
    def verify_token(token):
        """Verify JWT token and return user"""
        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            user = User.query.filter_by(id=payload['user_id']).first()
            return user
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def to_dict(self, include_private=False):
        """Convert user to dictionary"""
        data = {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'bio': self.bio,
            'profile_image': self.profile_image,
            'location': self.location,
            'website': self.website,
            'social_links': self.social_links,
            'role': self.role,
            'is_verified': self.is_verified,
            'follower_count': self.follower_count,
            'following_count': self.following_count,
            'recipe_count': self.recipe_count,
            'total_likes': self.total_likes,
            'cooking_level': self.cooking_level,
            'favorite_cuisines': self.favorite_cuisines,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_seen_at': self.last_seen_at.isoformat() if self.last_seen_at else None
        }
        
        if include_private:
            data.update({
                'email': self.email,
                'is_active': self.is_active,
                'email_verified_at': self.email_verified_at.isoformat() if self.email_verified_at else None,
                'dietary_preferences': self.dietary_preferences,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None,
                'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None
            })
        
        return data
    
    def update_last_seen(self):
        """Update last seen timestamp"""
        self.last_seen_at = datetime.utcnow()
        db.session.commit()
    
    def get_bookmarked_recipes(self):
        """Get user's bookmarked recipes"""
        from app.models.recipe import Recipe
        return Recipe.query.join(Bookmark).filter(Bookmark.user_id == self.id).all()
    
    def is_recipe_bookmarked(self, recipe_id):
        """Check if user has bookmarked a recipe"""
        from app.models.recipe import Bookmark
        return Bookmark.query.filter_by(user_id=self.id, recipe_id=recipe_id).first() is not None