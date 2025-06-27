from app import db
from datetime import datetime

class Recipe(db.Model):
    __tablename__ = 'recipes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(250), unique=True, nullable=False)
    description = db.Column(db.Text)
    instructions = db.Column(db.Text, nullable=False)
    prep_time = db.Column(db.Integer)
    cook_time = db.Column(db.Integer)
    total_time = db.Column(db.Integer)
    servings = db.Column(db.Integer, default=4)
    difficulty = db.Column(db.String(20), default='Medium')
    image_url = db.Column(db.String(500))
    is_published = db.Column(db.Boolean, default=False)
    is_featured = db.Column(db.Boolean, default=False)
    view_count = db.Column(db.Integer, default=0)
    like_count = db.Column(db.Integer, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    ratings = db.relationship('Rating', backref='recipe', lazy='dynamic', cascade='all, delete-orphan')
    recipe_ingredients = db.relationship('RecipeIngredient', backref='recipe', lazy='dynamic', cascade='all, delete-orphan')
    
    @property
    def average_rating(self):
        """Calculate average rating for this recipe"""
        ratings = self.ratings.all()
        if not ratings:
            return 0.0
        return sum(rating.rating for rating in ratings) / len(ratings)
    
    @property
    def rating_count(self):
        """Get number of ratings for this recipe"""
        return self.ratings.count()
    
    def to_dict(self, include_details=True):
        data = {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'description': self.description,
            'prep_time': self.prep_time,
            'cook_time': self.cook_time,
            'total_time': self.total_time,
            'servings': self.servings,
            'difficulty': self.difficulty,
            'image_url': self.image_url,
            'is_published': self.is_published,
            'is_featured': self.is_featured,
            'view_count': self.view_count,
            'like_count': self.like_count,
            'average_rating': self.average_rating,
            'rating_count': self.rating_count,
            'user_id': self.user_id,
            'category_id': self.category_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_details:
            data['instructions'] = self.instructions
        
        # Include user data if available
        if hasattr(self, 'user') and self.user:
            data['user'] = {
                'id': self.user.id,
                'username': self.user.username,
                'full_name': self.user.full_name,
                'role': self.user.role
            }
        
        # Include category data if available  
        if hasattr(self, 'category') and self.category:
            data['category'] = {
                'id': self.category.id,
                'name': self.category.name,
                'slug': self.category.slug,
                'icon': self.category.icon
            }
        
        return data