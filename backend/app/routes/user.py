from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Recipe

bp = Blueprint('user', __name__, url_prefix='/api/users')

@bp.route('/', methods=['GET'])
def get_users():
    """Get all users (public info only)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)
        
        users = User.query.filter_by(is_active=True).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in users.items],
            'pagination': {
                'page': users.page,
                'pages': users.pages,
                'per_page': users.per_page,
                'total': users.total,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get users error: {str(e)}")
        return jsonify({'message': 'Failed to get users'}), 500

@bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get specific user profile"""
    try:
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get user error: {str(e)}")
        return jsonify({'message': 'Failed to get user'}), 500

@bp.route('/<int:user_id>/recipes', methods=['GET'])
def get_user_recipes(user_id):
    """Get recipes by specific user"""
    try:
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'message': 'User not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 12, type=int), 50)
        
        recipes = Recipe.query.filter_by(
            user_id=user_id, 
            is_published=True
        ).order_by(Recipe.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'recipes': [recipe.to_dict(include_details=False) for recipe in recipes.items],
            'user': user.to_dict(),
            'pagination': {
                'page': recipes.page,
                'pages': recipes.pages,
                'per_page': recipes.per_page,
                'total': recipes.total,
                'has_next': recipes.has_next,
                'has_prev': recipes.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get user recipes error: {str(e)}")
        return jsonify({'message': 'Failed to get user recipes'}), 500

@bp.route('/me/favorites', methods=['GET'])
@jwt_required()
def get_my_favorites():
    """Get current user's favorite recipes"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 12, type=int), 50)
        
        favorites = user.get_bookmarked_recipes()
        
        # Simple pagination for favorites
        start = (page - 1) * per_page
        end = start + per_page
        paginated_favorites = favorites[start:end]
        
        return jsonify({
            'favorites': [recipe.to_dict(include_details=False) for recipe in paginated_favorites],
            'pagination': {
                'page': page,
                'total': len(favorites),
                'per_page': per_page,
                'has_next': end < len(favorites),
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get favorites error: {str(e)}")
        return jsonify({'message': 'Failed to get favorites'}), 500

@bp.route('/search', methods=['GET'])
def search_users():
    """Search users by username or full name"""
    try:
        query = request.args.get('q', '').strip()
        
        if not query:
            return jsonify({'message': 'Search query is required'}), 400
        
        if len(query) < 2:
            return jsonify({'message': 'Search query must be at least 2 characters'}), 400
        
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)
        
        users = User.query.filter(
            db.and_(
                User.is_active == True,
                db.or_(
                    User.username.ilike(f'%{query}%'),
                    User.full_name.ilike(f'%{query}%')
                )
            )
        ).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in users.items],
            'query': query,
            'pagination': {
                'page': users.page,
                'pages': users.pages,
                'per_page': users.per_page,
                'total': users.total,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Search users error: {str(e)}")
        return jsonify({'message': 'Search failed'}), 500