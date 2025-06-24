from app import db
from datetime import datetime
from sqlalchemy import text

class Recipe(db.Model):
    __tablename__ = 'recipes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(250), unique=True, nullable=False)
    description = db.Column(db.Text)
    instructions = db.Column(db.Text, nullable=False)
    prep_time = db.Column(db.Integer)  # in minutes
    cook_time = db.Column(db.Integer)  # in minutes
    total_time = db.Column(db.Integer)  # in minutes
    servings = db.Column(db.Integer, default=4)
    difficulty = db.Column(db.String(20), default='Medium')  # Easy, Medium, Hard
    image_url = db.Column(db.String(500))
    video_url = db.Column(db.String(500))
    tips = db.Column(db.Text)
    
    # Nutritional information (optional)
    calories_per_serving = db.Column(db.Integer)
    protein = db.Column(db.Float)  # in grams
    carbs = db.Column(db.Float)   # in grams
    fat = db.Column(db.Float)     # in grams
    fiber = db.Column(db.Float)   # in grams
    
    # Status and metadata
    is_published = db.Column(db.Boolean, default=False)
    is_featured = db.Column(db.Boolean, default=False)
    view_count = db.Column(db.Integer, default=0)
    like_count = db.Column(db.Integer, default=0)
    bookmark_count = db.Column(db.Integer, default=0)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime)
    
    # Relationships
    user = db.relationship('User', back_populates='recipes')
    category = db.relationship('Category', back_populates='recipes')
    recipe_ingredients = db.relationship('RecipeIngredient', back_populates='recipe', cascade='all, delete-orphan')
    ratings = db.relationship('Rating', back_populates='recipe', cascade='all, delete-orphan')
    bookmarks = db.relationship('Bookmark', back_populates='recipe', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Recipe {self.title}>'
    
    @property
    def average_rating(self):
        if not self.ratings:
            return 0.0
        return round(sum(r.rating for r in self.ratings) / len(self.ratings), 1)
    
    @property
    def total_ratings(self):
        return len(self.ratings)
    
    def to_dict(self, include_details=True, include_user=True):
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
            'video_url': self.video_url,
            'is_published': self.is_published,
            'is_featured': self.is_featured,
            'view_count': self.view_count,
            'like_count': self.like_count,
            'bookmark_count': self.bookmark_count,
            'average_rating': self.average_rating,
            'total_ratings': self.total_ratings,
            'category_id': self.category_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None
        }
        
        if include_user and self.user:
            data['user'] = {
                'id': self.user.id,
                'username': self.user.username,
                'profile_image': self.user.profile_image
            }
        
        if self.category:
            data['category'] = {
                'id': self.category.id,
                'name': self.category.name,
                'slug': self.category.slug,
                'icon': self.category.icon
            }
        
        if include_details:
            data.update({
                'instructions': self.instructions,
                'tips': self.tips,
                'calories_per_serving': self.calories_per_serving,
                'protein': self.protein,
                'carbs': self.carbs,
                'fat': self.fat,
                'fiber': self.fiber,
                'ingredients': [ri.to_dict() for ri in self.recipe_ingredients],
                'ratings': [r.to_dict() for r in self.ratings[-5:]]  # Last 5 ratings
            })
        
        return data
    
    @staticmethod
    def create_slug(title):
        """Create URL-friendly slug from recipe title"""
        import re
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        return slug.strip('-')
    
    def increment_view_count(self):
        """Increment view count"""
        self.view_count = (self.view_count or 0) + 1
        db.session.commit()

# Association table for recipe bookmarks/favorites
class Bookmark(db.Model):
    __tablename__ = 'bookmarks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Composite unique constraint
    __table_args__ = (db.UniqueConstraint('user_id', 'recipe_id', name='unique_user_recipe_bookmark'),)
    
    # Relationships
    user = db.relationship('User', back_populates='bookmarks')
    recipe = db.relationship('Recipe', back_populates='bookmarks')
    
    def __repr__(self):
        return f'<Bookmark {self.user.username if self.user else "Unknown"} -> {self.recipe.title if self.recipe else "Unknown"}>'