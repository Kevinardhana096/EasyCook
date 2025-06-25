from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Recipe, Category, Rating, User
from app.utils.decorators import chef_or_admin_required, admin_required

recipes_bp = Blueprint('recipes', __name__)

@recipes_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = Category.query.filter_by(is_active=True).order_by(Category.name).all()
        
        return jsonify({
            'message': 'Categories retrieved successfully',
            'categories': [category.to_dict() for category in categories]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get categories', 'error': str(e)}), 500

@recipes_bp.route('/', methods=['GET'])
def get_recipes():
    try:
        recipes = Recipe.query.filter_by(is_published=True).order_by(Recipe.created_at.desc()).all()
        
        return jsonify({
            'message': 'Recipes retrieved successfully',
            'recipes': [recipe.to_dict(include_details=False) for recipe in recipes],
            'total': len(recipes)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get recipes', 'error': str(e)}), 500

@recipes_bp.route('/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    try:
        recipe = Recipe.query.get(recipe_id)
        
        if not recipe or not recipe.is_published:
            return jsonify({'message': 'Recipe not found'}), 404
        
        # Increment view count
        recipe.view_count = (recipe.view_count or 0) + 1
        db.session.commit()
        
        return jsonify({
            'message': 'Recipe retrieved successfully',
            'recipe': recipe.to_dict(include_details=True)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get recipe', 'error': str(e)}), 500

@recipes_bp.route('/', methods=['POST'])
@jwt_required()
@chef_or_admin_required
def create_recipe():
    """Create new recipe - only chefs and admins can create recipes"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'instructions']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Create slug from title
        slug = data['title'].lower().replace(' ', '-').replace(',', '').replace('.', '')
        
        # Check if slug already exists
        existing_recipe = Recipe.query.filter_by(slug=slug).first()
        if existing_recipe:
            slug = f"{slug}-{Recipe.query.count() + 1}"
        
        recipe = Recipe(
            title=data['title'],
            slug=slug,
            description=data['description'],
            instructions=data['instructions'],
            prep_time=data.get('prep_time', 0),
            cook_time=data.get('cook_time', 0),
            total_time=data.get('total_time', data.get('prep_time', 0) + data.get('cook_time', 0)),
            servings=data.get('servings', 4),
            difficulty=data.get('difficulty', 'Medium'),
            image_url=data.get('image_url', ''),
            is_published=data.get('is_published', False),
            is_featured=data.get('is_featured', False),
            user_id=user_id,
            category_id=data.get('category_id')
        )
        
        db.session.add(recipe)
        db.session.commit()
        
        return jsonify({
            'message': 'Recipe created successfully',
            'recipe': recipe.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create recipe', 'error': str(e)}), 500

@recipes_bp.route('/<int:recipe_id>', methods=['PUT'])
@jwt_required()
def update_recipe(recipe_id):
    """Update recipe - only recipe owner or admin can update"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        recipe = Recipe.query.get_or_404(recipe_id)
        
        # Check permissions
        if recipe.user_id != user_id and user.role != 'admin':
            return jsonify({'message': 'Insufficient permissions'}), 403
        
        data = request.get_json()
        
        # Update fields
        updateable_fields = ['title', 'description', 'instructions', 'prep_time', 
                           'cook_time', 'total_time', 'servings', 'difficulty', 
                           'image_url', 'is_published', 'is_featured', 'category_id']
        
        for field in updateable_fields:
            if field in data:
                setattr(recipe, field, data[field])
        
        # Update slug if title changed
        if 'title' in data:
            new_slug = data['title'].lower().replace(' ', '-').replace(',', '').replace('.', '')
            if new_slug != recipe.slug:
                existing = Recipe.query.filter_by(slug=new_slug).filter(Recipe.id != recipe_id).first()
                if existing:
                    new_slug = f"{new_slug}-{recipe_id}"
                recipe.slug = new_slug
        
        db.session.commit()
        
        return jsonify({
            'message': 'Recipe updated successfully',
            'recipe': recipe.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update recipe', 'error': str(e)}), 500

@recipes_bp.route('/<int:recipe_id>', methods=['DELETE'])
@jwt_required()
def delete_recipe(recipe_id):
    """Delete recipe - only recipe owner or admin can delete"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        recipe = Recipe.query.get_or_404(recipe_id)
        
        # Check permissions
        if recipe.user_id != user_id and user.role != 'admin':
            return jsonify({'message': 'Insufficient permissions'}), 403
        
        db.session.delete(recipe)
        db.session.commit()
        
        return jsonify({'message': 'Recipe deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete recipe', 'error': str(e)}), 500

# Rating endpoints
@recipes_bp.route('/<int:recipe_id>/ratings', methods=['GET'])
def get_recipe_ratings(recipe_id):
    """Get all ratings for a recipe"""
    try:
        recipe = Recipe.query.get_or_404(recipe_id)
        ratings = Rating.query.filter_by(recipe_id=recipe_id).order_by(Rating.created_at.desc()).all()
        
        return jsonify({
            'message': 'Ratings retrieved successfully',
            'ratings': [rating.to_dict() for rating in ratings],
            'average_rating': Rating.get_average_rating(recipe_id),
            'total_ratings': len(ratings),
            'rating_distribution': Rating.get_rating_distribution(recipe_id)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get ratings', 'error': str(e)}), 500

@recipes_bp.route('/<int:recipe_id>/ratings', methods=['POST'])
@jwt_required()
def rate_recipe(recipe_id):
    """Rate a recipe"""
    try:
        user_id = int(get_jwt_identity())
        recipe = Recipe.query.get_or_404(recipe_id)
        data = request.get_json()
        
        # Validate rating
        if not data.get('rating') or not isinstance(data['rating'], int) or not (1 <= data['rating'] <= 5):
            return jsonify({'message': 'Rating must be an integer between 1 and 5'}), 400
        
        # Check if user already rated this recipe
        existing_rating = Rating.query.filter_by(user_id=user_id, recipe_id=recipe_id).first()
        
        if existing_rating:
            # Update existing rating
            existing_rating.rating = data['rating']
            existing_rating.review = data.get('review', '')
            existing_rating.is_verified = data.get('is_verified', False)
            
            db.session.commit()
            
            return jsonify({
                'message': 'Rating updated successfully',
                'rating': existing_rating.to_dict()
            }), 200
        else:
            # Create new rating
            rating = Rating(
                user_id=user_id,
                recipe_id=recipe_id,
                rating=data['rating'],
                review=data.get('review', ''),
                is_verified=data.get('is_verified', False)
            )
            
            db.session.add(rating)
            db.session.commit()
            
            return jsonify({
                'message': 'Rating added successfully',
                'rating': rating.to_dict()
            }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to rate recipe', 'error': str(e)}), 500

@recipes_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_recipes(user_id):
    """Get recipes by specific user"""
    try:
        user = User.query.get_or_404(user_id)
        recipes = Recipe.query.filter_by(user_id=user_id, is_published=True).order_by(Recipe.created_at.desc()).all()
        
        return jsonify({
            'message': 'User recipes retrieved successfully',
            'recipes': [recipe.to_dict(include_details=False) for recipe in recipes],
            'user': user.to_dict(),
            'total': len(recipes)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get user recipes', 'error': str(e)}), 500

@recipes_bp.route('/search', methods=['GET'])
def search_recipes():
    """Search recipes by title, description, or category"""
    try:
        query = request.args.get('q', '').strip()
        category_id = request.args.get('category_id')
        difficulty = request.args.get('difficulty')
        
        if not query and not category_id and not difficulty:
            return jsonify({'message': 'Search query or filter required'}), 400
        
        recipes_query = Recipe.query.filter_by(is_published=True)
        
        if query:
            recipes_query = recipes_query.filter(
                Recipe.title.contains(query) | 
                Recipe.description.contains(query)
            )
        
        if category_id:
            recipes_query = recipes_query.filter_by(category_id=int(category_id))
        
        if difficulty:
            recipes_query = recipes_query.filter_by(difficulty=difficulty)
        
        recipes = recipes_query.order_by(Recipe.created_at.desc()).all()
        
        return jsonify({
            'message': 'Search completed successfully',
            'recipes': [recipe.to_dict(include_details=False) for recipe in recipes],
            'total': len(recipes),
            'search_query': query,
            'filters': {
                'category_id': category_id,
                'difficulty': difficulty
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Search failed', 'error': str(e)}), 500