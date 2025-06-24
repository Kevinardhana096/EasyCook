from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Recipe, Category, User, Bookmark, Rating
from datetime import datetime
import traceback

bp = Blueprint('recipe', __name__, url_prefix='/api/recipes')

@bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all recipe categories"""
    try:
        print("📝 Getting categories...")  # Debug log
        categories = Category.query.filter_by(is_active=True).order_by(Category.name).all()
        print(f"📝 Found {len(categories)} categories")  # Debug log
        
        result = {
            'categories': [category.to_dict() for category in categories],
            'count': len(categories),
            'message': 'Categories retrieved successfully'
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        error_msg = f"Get categories error: {str(e)}"
        print(f"❌ {error_msg}")  # Debug log
        traceback.print_exc()  # Print full error
        current_app.logger.error(error_msg)
        return jsonify({'message': 'Failed to get categories', 'error': str(e)}), 500

@bp.route('/', methods=['GET'])
def get_recipes():
    """Get all published recipes"""
    try:
        print("📝 Getting recipes...")  # Debug log
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 12, type=int), 50)
        category_id = request.args.get('category_id', type=int)
        difficulty = request.args.get('difficulty')
        sort_by = request.args.get('sort_by', 'created_at')
        
        query = Recipe.query.filter_by(is_published=True)
        
        # Apply filters
        if category_id:
            query = query.filter_by(category_id=category_id)
        
        if difficulty:
            query = query.filter_by(difficulty=difficulty)
        
        # Apply sorting
        if sort_by == 'views':
            query = query.order_by(Recipe.view_count.desc())
        elif sort_by == 'likes':
            query = query.order_by(Recipe.like_count.desc())
        else:
            query = query.order_by(Recipe.created_at.desc())
        
        recipes = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        print(f"📝 Found {len(recipes.items)} recipes")  # Debug log
        
        return jsonify({
            'recipes': [recipe.to_dict(include_details=False) for recipe in recipes.items],
            'pagination': {
                'page': recipes.page,
                'pages': recipes.pages,
                'per_page': recipes.per_page,
                'total': recipes.total,
                'has_next': recipes.has_next,
                'has_prev': recipes.has_prev
            },
            'filters': {
                'category_id': category_id,
                'difficulty': difficulty,
                'sort_by': sort_by
            }
        }), 200
        
    except Exception as e:
        error_msg = f"Get recipes error: {str(e)}"
        print(f"❌ {error_msg}")
        traceback.print_exc()
        current_app.logger.error(error_msg)
        return jsonify({'message': 'Failed to get recipes', 'error': str(e)}), 500

@bp.route('/featured', methods=['GET'])
def get_featured_recipes():
    """Get featured recipes"""
    try:
        print("📝 Getting featured recipes...")
        limit = min(request.args.get('limit', 6, type=int), 20)
        
        recipes = Recipe.query.filter_by(
            is_published=True, 
            is_featured=True
        ).order_by(Recipe.created_at.desc()).limit(limit).all()
        
        print(f"📝 Found {len(recipes)} featured recipes")
        
        return jsonify({
            'recipes': [recipe.to_dict(include_details=False) for recipe in recipes],
            'count': len(recipes)
        }), 200
        
    except Exception as e:
        error_msg = f"Get featured recipes error: {str(e)}"
        print(f"❌ {error_msg}")
        traceback.print_exc()
        current_app.logger.error(error_msg)
        return jsonify({'message': 'Failed to get featured recipes', 'error': str(e)}), 500

# Add more routes with similar error handling...