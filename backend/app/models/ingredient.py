from app import db
from datetime import datetime

class Ingredient(db.Model):
    __tablename__ = 'ingredients'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    unit = db.Column(db.String(20), default='gram')  # gram, ml, piece, cup, etc.
    category = db.Column(db.String(50))  # protein, vegetable, spice, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    recipe_ingredients = db.relationship('RecipeIngredient', back_populates='ingredient', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Ingredient {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'unit': self.unit,
            'category': self.category,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class RecipeIngredient(db.Model):
    __tablename__ = 'recipe_ingredients'
    
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredients.id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False)  # Override ingredient default unit if needed
    notes = db.Column(db.String(200))  # Optional notes like "chopped", "diced", etc.
    order = db.Column(db.Integer, default=0)  # Order in recipe
    
    # Relationships
    recipe = db.relationship('Recipe', back_populates='recipe_ingredients')
    ingredient = db.relationship('Ingredient', back_populates='recipe_ingredients')
    
    def __repr__(self):
        return f'<RecipeIngredient {self.quantity} {self.unit} {self.ingredient.name if self.ingredient else "Unknown"}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'recipe_id': self.recipe_id,
            'ingredient_id': self.ingredient_id,
            'ingredient_name': self.ingredient.name if self.ingredient else None,
            'quantity': self.quantity,
            'unit': self.unit,
            'notes': self.notes,
            'order': self.order
        }