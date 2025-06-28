from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Recipe, Category, Rating
from app.utils.decorators import admin_required, role_required
from datetime import datetime, timedelta
from sqlalchemy import func, or_

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard_stats():
    """Get admin dashboard statistics"""
    try:
        # Get basic counts
        total_users = User.query.count()
        total_recipes = Recipe.query.count()
        total_categories = Category.query.count()
        total_ratings = Rating.query.count()
        
        # Get recent registrations (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_users = User.query.filter(User.created_at >= thirty_days_ago).count()
        
        # Get published recipes
        published_recipes = Recipe.query.filter_by(is_published=True).count()
        
        # Get user role distribution
        user_roles = db.session.query(
            User.role, 
            func.count(User.id).label('count')
        ).group_by(User.role).all()
        
        role_distribution = {role: count for role, count in user_roles}
        
        # Get average rating
        avg_rating = db.session.query(func.avg(Rating.rating)).scalar()
        
        return jsonify({
            'message': 'Dashboard stats retrieved successfully',
            'stats': {
                'total_users': total_users,
                'total_recipes': total_recipes,
                'total_categories': total_categories,
                'total_ratings': total_ratings,
                'published_recipes': published_recipes,
                'recent_users': recent_users,
                'role_distribution': role_distribution,
                'average_rating': float(avg_rating) if avg_rating else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get dashboard stats', 'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Get all users for admin management"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '', type=str)
        role_filter = request.args.get('role', '', type=str)
        
        query = User.query
        
        # Apply search filter
        if search:
            query = query.filter(
                or_(
                    User.username.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%'),
                    User.full_name.ilike(f'%{search}%')
                )
            )
        
        # Apply role filter
        if role_filter:
            query = query.filter(User.role == role_filter)
        
        # Paginate results
        users = query.order_by(User.created_at.desc()).paginate(
            page=page, 
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'message': 'Users retrieved successfully',
            'users': [user.to_dict(include_private=True) for user in users.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': users.total,
                'pages': users.pages,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get users', 'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
@admin_required
def update_user_role(user_id):
    """Update user role"""
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Prevent admin from changing their own role
        if user_id == current_user_id:
            return jsonify({'message': 'Cannot change your own role'}), 400
        
        new_role = data.get('role')
        if new_role not in ['user', 'chef', 'admin']:
            return jsonify({'message': 'Invalid role. Must be user, chef, or admin'}), 400
        
        old_role = user.role
        user.role = new_role
        db.session.commit()
        
        return jsonify({
            'message': f'User role updated from {old_role} to {new_role}',
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update user role', 'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_user_status(user_id):
    """Activate/deactivate user account"""
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get_or_404(user_id)
        
        # Prevent admin from deactivating their own account
        if user_id == current_user_id:
            return jsonify({'message': 'Cannot deactivate your own account'}), 400
        
        user.is_active = not user.is_active
        db.session.commit()
        
        status = 'activated' if user.is_active else 'deactivated'
        
        return jsonify({
            'message': f'User account {status}',
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update user status', 'error': str(e)}), 500

@admin_bp.route('/recipes', methods=['GET'])
@jwt_required()
@admin_required
def get_all_recipes():
    """Get all recipes for admin management"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)  # Increased for admin dashboard
        search = request.args.get('search', '', type=str)
        status_filter = request.args.get('status', '', type=str)
        
        # Join with User table to get author information
        query = Recipe.query.join(User, Recipe.user_id == User.id)
        
        # Apply search filter
        if search:
            query = query.filter(
                or_(
                    Recipe.title.ilike(f'%{search}%'),
                    Recipe.description.ilike(f'%{search}%'),
                    User.username.ilike(f'%{search}%')
                )
            )
        
        # Apply status filter
        if status_filter == 'published':
            query = query.filter(Recipe.is_published == True)
        elif status_filter == 'draft':
            query = query.filter(Recipe.is_published == False)
        elif status_filter == 'featured':
            query = query.filter(Recipe.is_featured == True)
        
        # Paginate results
        recipes = query.order_by(Recipe.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Create recipe data with author information
        recipes_data = []
        for recipe in recipes.items:
            try:
                recipe_dict = recipe.to_dict(include_details=True)
                # Ensure author information is included - check if user exists
                if hasattr(recipe, 'user') and recipe.user:
                    recipe_dict['author'] = {
                        'id': recipe.user.id,
                        'username': recipe.user.username,
                        'full_name': recipe.user.full_name,
                        'role': recipe.user.role
                    }
                else:
                    # Fallback if user is not loaded
                    user = User.query.get(recipe.user_id)
                    if user:
                        recipe_dict['author'] = {
                            'id': user.id,
                            'username': user.username,
                            'full_name': user.full_name,
                            'role': user.role
                        }
                    else:
                        recipe_dict['author'] = {
                            'id': None,
                            'username': 'Unknown',
                            'full_name': 'Unknown Author',
                            'role': 'user'
                        }
                recipes_data.append(recipe_dict)
            except Exception as e:
                print(f"Error processing recipe {recipe.id}: {str(e)}")
                continue
        
        return jsonify({
            'message': 'Recipes retrieved successfully',
            'recipes': recipes_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': recipes.total,
                'pages': recipes.pages,
                'has_next': recipes.has_next,
                'has_prev': recipes.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get recipes', 'error': str(e)}), 500

@admin_bp.route('/recipes/<int:recipe_id>/toggle-featured', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_recipe_featured(recipe_id):
    """Toggle recipe featured status"""
    try:
        recipe = Recipe.query.get_or_404(recipe_id)
        recipe.is_featured = not recipe.is_featured
        db.session.commit()
        
        status = 'featured' if recipe.is_featured else 'unfeatured'
        
        return jsonify({
            'message': f'Recipe {status} successfully',
            'recipe': recipe.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update recipe status', 'error': str(e)}), 500

@admin_bp.route('/categories', methods=['POST'])
@jwt_required()
@admin_required
def create_category():
    """Create new category"""
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'message': 'Category name is required'}), 400
        
        # Check if category already exists
        existing = Category.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({'message': 'Category already exists'}), 400
        
        category = Category(
            name=data['name'],
            description=data.get('description', ''),
            image_url=data.get('image_url', ''),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'message': 'Category created successfully',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create category', 'error': str(e)}), 500

@admin_bp.route('/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_category(category_id):
    """Update category"""
    try:
        category = Category.query.get_or_404(category_id)
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            category.name = data['name']
        if 'description' in data:
            category.description = data['description']
        if 'image_url' in data:
            category.image_url = data['image_url']
        if 'is_active' in data:
            category.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Category updated successfully',
            'category': category.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update category', 'error': str(e)}), 500
