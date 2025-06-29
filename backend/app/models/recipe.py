from app import db
from datetime import datetime
from .recipe_category import recipe_categories

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
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))  # Keep for backward compatibility
    
    # Nutrition fields
    calories_per_serving = db.Column(db.Float)
    protein = db.Column(db.Float)
    carbs = db.Column(db.Float)
    fat = db.Column(db.Float)
    fiber = db.Column(db.Float)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    ratings = db.relationship('Rating', backref='recipe', lazy='dynamic', cascade='all, delete-orphan')
    recipe_ingredients = db.relationship('RecipeIngredient', backref='recipe', lazy='dynamic', cascade='all, delete-orphan')
    
    # Many-to-many relationship with categories
    categories = db.relationship('Category', secondary=recipe_categories, lazy='subquery',
                               backref=db.backref('recipes', lazy=True))
    
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
    
    def to_dict(self, include_details=True, current_user_id=None):
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
            'category_id': self.category_id,  # Keep for backward compatibility
            'categories': [{'id': cat.id, 'name': cat.name, 'slug': cat.slug, 'icon': cat.icon} for cat in self.categories],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            # Add nutrition fields at recipe level for frontend compatibility
            'calories_per_serving': self.calories_per_serving,
            'protein': self.protein,
            'carbs': self.carbs,
            'fat': self.fat,
            'fiber': self.fiber
        }
        
        # Check if current user has favorited this recipe
        if current_user_id:
            from .rating import Rating
            user_rating = Rating.query.filter_by(
                user_id=current_user_id, 
                recipe_id=self.id
            ).first()
            data['is_favorited'] = user_rating and user_rating.rating >= 4
        else:
            data['is_favorited'] = False
        
        if include_details:
            data['instructions'] = self.instructions
            
            # Include ingredients
            ingredients = []
            for recipe_ingredient in self.recipe_ingredients.order_by('order'):
                ingredients.append(recipe_ingredient.to_dict())
            data['ingredients'] = ingredients
            
            # Include nutrition data
            data['nutrition'] = {
                'calories_per_serving': self.calories_per_serving,
                'protein': self.protein,
                'carbs': self.carbs,
                'fat': self.fat,
                'fiber': self.fiber
            }
        
        # Include user data if available
        if hasattr(self, 'user') and self.user:
            user_data = {
                'id': self.user.id,
                'username': self.user.username,
                'full_name': self.user.full_name,
                'role': self.user.role
            }
            data['author'] = user_data
            data['user'] = user_data  # For backward compatibility
        else:
            # Fallback: load user data if not already loaded
            from .user import User
            user = User.query.get(self.user_id)
            if user:
                user_data = {
                    'id': user.id,
                    'username': user.username,
                    'full_name': user.full_name,
                    'role': user.role
                }
                data['author'] = user_data
                data['user'] = user_data  # For backward compatibility
            else:
                data['author'] = None
                data['user'] = None
        
        # Include category data (backward compatibility - use first category if multiple)  
        if self.categories:
            # Use first category for backward compatibility
            first_category = self.categories[0]
            data['category'] = {
                'id': first_category.id,
                'name': first_category.name,
                'slug': first_category.slug,
                'icon': first_category.icon
            }
        elif hasattr(self, 'category') and self.category:
            # Fallback to old single category relationship
            data['category'] = {
                'id': self.category.id,
                'name': self.category.name,
                'slug': self.category.slug,
                'icon': self.category.icon
            }
        
        return data