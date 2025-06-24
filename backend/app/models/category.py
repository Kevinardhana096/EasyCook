from app import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    slug = db.Column(db.String(60), unique=True, nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(50))  # For emoji or icon class
    color = db.Column(db.String(20))  # Hex color for UI
    parent_id = db.Column(db.Integer, db.ForeignKey('categories.id'))  # For subcategories
    is_active = db.Column(db.Boolean, default=True)
    recipe_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Self-referential relationship for parent/child categories
    parent = db.relationship('Category', remote_side=[id], backref='subcategories')
    
    # Relationship with recipes
    recipes = db.relationship('Recipe', back_populates='category', lazy='dynamic')
    
    def __repr__(self):
        return f'<Category {self.name}>'
    
    def to_dict(self, include_recipes=False):
        data = {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'icon': self.icon,
            'color': self.color,
            'parent_id': self.parent_id,
            'is_active': self.is_active,
            'recipe_count': self.recipe_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_recipes:
            data['recipes'] = [recipe.to_dict(include_details=False) for recipe in self.recipes.filter_by(is_published=True)]
        
        return data
    
    @staticmethod
    def create_slug(name):
        """Create URL-friendly slug from category name"""
        import re
        slug = name.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        return slug.strip('-')