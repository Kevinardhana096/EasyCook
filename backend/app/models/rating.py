from app import db
from datetime import datetime

class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    review = db.Column(db.Text)  # Optional review text
    is_verified = db.Column(db.Boolean, default=False)  # If user actually made the recipe
    helpful_count = db.Column(db.Integer, default=0)  # How many found this review helpful
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Composite unique constraint - one rating per user per recipe
    __table_args__ = (db.UniqueConstraint('user_id', 'recipe_id', name='unique_user_recipe_rating'),)
    
    # Relationships are defined via backref in User and Recipe models
    helpful_votes = db.relationship('RatingHelpful', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Rating {self.rating}/5 by {self.user.username if self.user else "Unknown"} for recipe {self.recipe_id}>'
    
    def to_dict(self, include_user=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'recipe_id': self.recipe_id,
            'rating': self.rating,
            'review': self.review,
            'is_verified': self.is_verified,
            'helpful_count': self.helpful_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_user and self.user:
            data['user'] = {
                'id': self.user.id,
                'username': self.user.username,
                'profile_image': self.user.profile_image
            }
        
        return data
    
    @staticmethod
    def get_average_rating(recipe_id):
        """Get average rating for a recipe"""
        result = db.session.query(db.func.avg(Rating.rating)).filter_by(recipe_id=recipe_id).scalar()
        return round(float(result), 1) if result else 0.0
    
    @staticmethod
    def get_rating_distribution(recipe_id):
        """Get rating distribution (how many 1-star, 2-star, etc.)"""
        from sqlalchemy import func
        result = (db.session.query(Rating.rating, func.count(Rating.rating))
                 .filter_by(recipe_id=recipe_id)
                 .group_by(Rating.rating)
                 .all())
        
        distribution = {i: 0 for i in range(1, 6)}
        for rating, count in result:
            distribution[rating] = count
            
        return distribution

class RatingHelpful(db.Model):
    __tablename__ = 'rating_helpful'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating_id = db.Column(db.Integer, db.ForeignKey('ratings.id'), nullable=False)
    is_helpful = db.Column(db.Boolean, nullable=False)  # True for helpful, False for not helpful
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Composite unique constraint
    __table_args__ = (db.UniqueConstraint('user_id', 'rating_id', name='unique_user_rating_helpful'),)
    
    # Relationships
    user = db.relationship('User')
    # rating relationship will be handled by foreign key