from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Recipe, Category, Rating, User, Ingredient
from app.utils.decorators import chef_or_admin_required, admin_required
from sqlalchemy import func, desc

recipes_bp = Blueprint('recipes', __name__)

@recipes_bp.route('/stats', methods=['GET'])
def get_platform_stats():
    """Get global platform statistics"""
    try:
        # Calculate various statistics
        total_recipes = Recipe.query.filter_by(is_published=True).count()
        total_users = User.query.filter_by(is_active=True).count()
        total_categories = Category.query.filter_by(is_active=True).count()
        total_ratings = Rating.query.count()
        
        # Calculate total views across all recipes
        total_views = db.session.query(func.sum(Recipe.view_count)).filter_by(is_published=True).scalar() or 0
        
        # Calculate total likes across all recipes
        total_likes = db.session.query(func.sum(Recipe.like_count)).filter_by(is_published=True).scalar() or 0
        
        # Calculate average rating across all recipes
        avg_rating = db.session.query(func.avg(Rating.rating)).scalar() or 0
        
        # Get top categories by recipe count
        top_categories = db.session.query(
            Category.name,
            Category.icon,
            func.count(Recipe.id).label('recipe_count')
        ).join(Recipe).filter(
            Recipe.is_published == True,
            Category.is_active == True
        ).group_by(Category.id).order_by(desc('recipe_count')).limit(3).all()
        
        # Get featured recipes count
        featured_recipes = Recipe.query.filter_by(is_published=True, is_featured=True).count()
        
        return jsonify({
            'message': 'Platform statistics retrieved successfully',
            'stats': {
                'total_recipes': total_recipes,
                'total_users': total_users,
                'total_categories': total_categories,
                'total_ratings': total_ratings,
                'total_views': int(total_views),
                'total_likes': int(total_likes),
                'average_rating': round(float(avg_rating), 1),
                'featured_recipes': featured_recipes,
                'top_categories': [
                    {
                        'name': cat.name,
                        'icon': cat.icon,
                        'recipe_count': cat.recipe_count
                    } for cat in top_categories
                ]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get platform statistics', 'error': str(e)}), 500

@recipes_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = Category.query.filter_by(is_active=True).order_by(Category.name).all()
        
        # Add recipe count for each category
        categories_with_count = []
        for category in categories:
            category_dict = category.to_dict()
            # Count recipes from both many-to-many relationship and old single category
            many_to_many_count = db.session.query(Recipe).filter(
                Recipe.categories.any(Category.id == category.id),
                Recipe.is_published == True
            ).count()
            single_category_count = Recipe.query.filter_by(
                category_id=category.id, 
                is_published=True
            ).count()
            # Use distinct count to avoid double counting
            total_count = db.session.query(Recipe).filter(
                db.or_(
                    Recipe.categories.any(Category.id == category.id),
                    Recipe.category_id == category.id
                ),
                Recipe.is_published == True
            ).distinct().count()
            
            category_dict['recipe_count'] = total_count
            categories_with_count.append(category_dict)
        
        return jsonify({
            'message': 'Categories retrieved successfully',
            'categories': categories_with_count
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get categories', 'error': str(e)}), 500

@recipes_bp.route('', methods=['GET'])
@recipes_bp.route('/', methods=['GET'])
def get_recipes():
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 12))
        category_id = request.args.get('category_id')
        difficulty = request.args.get('difficulty')
        sort_by = request.args.get('sort_by', 'newest')  # newest, popular, rating
        
        # Use joinedload to eagerly load user and category data
        from sqlalchemy.orm import joinedload
        recipes_query = Recipe.query.options(
            joinedload(Recipe.user),
            joinedload(Recipe.category),
            joinedload(Recipe.categories)  # Load many-to-many categories
        ).filter_by(is_published=True)
        
        # Apply filters
        if category_id:
            # Filter by many-to-many relationship OR old single category for backward compatibility
            from app.models.recipe_category import recipe_categories
            recipes_query = recipes_query.filter(
                db.or_(
                    Recipe.categories.any(Category.id == int(category_id)),
                    Recipe.category_id == int(category_id)
                )
            )
        
        if difficulty:
            recipes_query = recipes_query.filter_by(difficulty=difficulty)
        
        # Apply sorting
        if sort_by == 'popular':
            recipes_query = recipes_query.order_by(desc(Recipe.view_count))
        elif sort_by == 'rating':
            # Order by average rating
            recipes_query = recipes_query.outerjoin(Rating).group_by(Recipe.id).order_by(desc(func.avg(Rating.rating)))
        else:  # newest
            recipes_query = recipes_query.order_by(Recipe.created_at.desc())
        
        # Paginate
        recipes = recipes_query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Get current user ID if authenticated
        current_user_id = None
        try:
            current_user_id = int(get_jwt_identity()) if get_jwt_identity() else None
        except:
            pass
        
        return jsonify({
            'message': 'Recipes retrieved successfully',
            'recipes': [recipe.to_dict(include_details=False, current_user_id=current_user_id) for recipe in recipes.items],
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

@recipes_bp.route('/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    try:
        # Use joinedload to eagerly load user and category data
        from sqlalchemy.orm import joinedload
        recipe = Recipe.query.options(
            joinedload(Recipe.user),
            joinedload(Recipe.category)
        ).get(recipe_id)
        
        if not recipe or not recipe.is_published:
            return jsonify({'message': 'Recipe not found'}), 404
        
        # Increment view count
        recipe.view_count = (recipe.view_count or 0) + 1
        db.session.commit()
        
        # Get current user ID if authenticated
        current_user_id = None
        try:
            current_user_id = int(get_jwt_identity()) if get_jwt_identity() else None
        except:
            pass
        
        return jsonify({
            'message': 'Recipe retrieved successfully',
            'recipe': recipe.to_dict(include_details=True, current_user_id=current_user_id)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get recipe', 'error': str(e)}), 500

@recipes_bp.route('', methods=['POST'])
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
            category_id=data.get('category_id')  # Keep for backward compatibility
        )
        
        db.session.add(recipe)
        db.session.flush()  # Get the recipe ID before adding categories
        
        # Handle multiple categories
        category_ids = data.get('category_ids', [])
        if category_ids:
            # Add multiple categories
            for category_id in category_ids:
                category = Category.query.get(category_id)
                if category:
                    recipe.categories.append(category)
        elif data.get('category_id'):
            # Fallback: add single category for backward compatibility
            category = Category.query.get(data.get('category_id'))
            if category:
                recipe.categories.append(category)
        
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
        
        # Handle multiple categories update
        if 'category_ids' in data:
            # Clear existing categories and add new ones
            recipe.categories.clear()
            category_ids = data['category_ids']
            for category_id in category_ids:
                category = Category.query.get(category_id)
                if category:
                    recipe.categories.append(category)
        elif 'category_id' in data:
            # Fallback: handle single category update for backward compatibility
            recipe.categories.clear()
            if data['category_id']:
                category = Category.query.get(data['category_id'])
                if category:
                    recipe.categories.append(category)
        
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
            
            # Get updated recipe stats
            average_rating = Rating.get_average_rating(recipe_id)
            rating_count = Rating.query.filter_by(recipe_id=recipe_id).count()
            
            return jsonify({
                'message': 'Rating updated successfully',
                'rating': existing_rating.to_dict(),
                'recipe_stats': {
                    'average_rating': average_rating,
                    'rating_count': rating_count
                }
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
            
            # Get updated recipe stats
            average_rating = Rating.get_average_rating(recipe_id)
            rating_count = Rating.query.filter_by(recipe_id=recipe_id).count()
            
            return jsonify({
                'message': 'Rating added successfully',
                'rating': rating.to_dict(),
                'recipe_stats': {
                    'average_rating': average_rating,
                    'rating_count': rating_count
                }
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
        
        # Get current user ID if authenticated
        current_user_id = None
        try:
            current_user_id = int(get_jwt_identity()) if get_jwt_identity() else None
        except:
            pass
        
        return jsonify({
            'message': 'User recipes retrieved successfully',
            'recipes': [recipe.to_dict(include_details=False, current_user_id=current_user_id) for recipe in recipes],
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

@recipes_bp.route('/featured', methods=['GET'])
def get_featured_recipes():
    try:
        from sqlalchemy.orm import joinedload
        recipes = Recipe.query.options(
            joinedload(Recipe.user),
            joinedload(Recipe.category)
        ).filter_by(is_published=True, is_featured=True).order_by(Recipe.created_at.desc()).limit(6).all()
        
        return jsonify({
            'message': 'Featured recipes retrieved successfully',
            'recipes': [recipe.to_dict(include_details=False) for recipe in recipes]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get featured recipes', 'error': str(e)}), 500

@recipes_bp.route('/popular', methods=['GET'])
def get_popular_recipes():
    try:
        from sqlalchemy.orm import joinedload
        limit = int(request.args.get('limit', 6))
        recipes = Recipe.query.options(
            joinedload(Recipe.user),
            joinedload(Recipe.category)
        ).filter_by(is_published=True).order_by(Recipe.view_count.desc()).limit(limit).all()
        
        return jsonify({
            'message': 'Popular recipes retrieved successfully',
            'recipes': [recipe.to_dict(include_details=False) for recipe in recipes]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get popular recipes', 'error': str(e)}), 500

@recipes_bp.route('/favorites', methods=['GET'])
@jwt_required()
def get_user_favorites():
    try:
        user_id = int(get_jwt_identity())
        
        # Get user's favorite recipes via ratings with high score
        favorites_query = db.session.query(Recipe).join(Rating).filter(
            Rating.user_id == user_id,
            Rating.rating >= 4,
            Recipe.is_published == True
        ).order_by(Rating.created_at.desc())
        
        favorites = favorites_query.all()
        
        return jsonify({
            'message': 'Favorite recipes retrieved successfully',
            'recipes': [recipe.to_dict(include_details=False, current_user_id=user_id) for recipe in favorites],
            'total': len(favorites)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get favorite recipes', 'error': str(e)}), 500

@recipes_bp.route('/<int:recipe_id>/favorite', methods=['POST'])
@jwt_required()
def toggle_favorite(recipe_id):
    try:
        user_id = int(get_jwt_identity())
        recipe = Recipe.query.get_or_404(recipe_id)
        
        # Check if user already has a rating for this recipe
        existing_rating = Rating.query.filter_by(user_id=user_id, recipe_id=recipe_id).first()
        
        if existing_rating:
            # Toggle favorite status by rating (4-5 = favorite, 1-3 = not favorite)
            if existing_rating.rating >= 4:
                # Remove from favorites by setting rating to 3
                existing_rating.rating = 3
                message = 'Recipe removed from favorites'
                is_favorited = False
            else:
                # Add to favorites by setting rating to 5
                existing_rating.rating = 5
                message = 'Recipe added to favorites'
                is_favorited = True
        else:
            # Create new rating as favorite
            rating = Rating(
                user_id=user_id,
                recipe_id=recipe_id,
                rating=5,
                review='',
                is_verified=False
            )
            db.session.add(rating)
            message = 'Recipe added to favorites'
            is_favorited = True
        
        db.session.commit()
        
        return jsonify({
            'message': message,
            'is_favorited': is_favorited
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to toggle favorite', 'error': str(e)}), 500

@recipes_bp.route('/ingredients', methods=['GET'])
def get_ingredients():
    try:
        ingredients = Ingredient.query.filter_by(is_active=True).order_by(Ingredient.name).all()
        
        return jsonify({
            'message': 'Ingredients retrieved successfully',
            'ingredients': [ingredient.to_dict() for ingredient in ingredients]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get ingredients', 'error': str(e)}), 500

@recipes_bp.route('/<int:recipe_id>/toggle-publish', methods=['PUT'])
@jwt_required()
def toggle_recipe_publish(recipe_id):
    """Toggle recipe published status - only recipe owner or admin can do this"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        recipe = Recipe.query.get_or_404(recipe_id)
        
        # Check permissions
        if recipe.user_id != user_id and user.role != 'admin':
            return jsonify({'message': 'Insufficient permissions'}), 403
        
        # Toggle published status
        recipe.is_published = not recipe.is_published
        db.session.commit()
        
        status = 'published' if recipe.is_published else 'unpublished'
        return jsonify({
            'message': f'Recipe {status} successfully',
            'recipe': recipe.to_dict(),
            'is_published': recipe.is_published
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to toggle recipe status', 'error': str(e)}), 500