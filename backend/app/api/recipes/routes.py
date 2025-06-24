from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.api.recipes import recipes_bp
from app import db
from app.models.recipe import Recipe, Category, Ingredient, Rating, Favorite
from app.models.user import User
from sqlalchemy import or_, desc, func

@recipes_bp.route('/', methods=['GET'])
def get_recipes():
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 12)), 50)  # Max 50 per page
        category_id = request.args.get('category')
        difficulty = request.args.get('difficulty')
        search = request.args.get('search')
        sort = request.args.get('sort', 'newest')  # newest, oldest, rating, popular, title
        
        # Get current user ID if authenticated
        user_id = None
        try:
            user_id = get_jwt_identity()
        except:
            pass
        
        # Build query
        query = Recipe.query.filter_by(is_approved=True)
        
        # Apply filters
        if category_id:
            query = query.join(Recipe.categories).filter(Category.id == category_id)
        
        if difficulty:
            query = query.filter_by(difficulty=difficulty)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Recipe.title.ilike(search_term),
                    Recipe.description.ilike(search_term),
                    Recipe.instructions.ilike(search_term)
                )
            )
        
        # Apply sorting
        if sort == 'oldest':
            query = query.order_by(Recipe.created_at.asc())
        elif sort == 'rating':
            # Sort by average rating (simplified - in production use proper aggregation)
            query = query.outerjoin(Rating).group_by(Recipe.id).order_by(desc(func.avg(Rating.rating)))
        elif sort == 'popular':
            query = query.order_by(desc(Recipe.views_count))
        elif sort == 'title':
            query = query.order_by(Recipe.title.asc())
        else:  # newest (default)
            query = query.order_by(desc(Recipe.created_at))
        
        # Paginate
        recipes_pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Convert to dict with user context
        recipes_data = []
        for recipe in recipes_pagination.items:
            recipe_dict = recipe.to_dict(user_id=user_id)
            recipes_data.append(recipe_dict)
        
        return jsonify({
            'recipes': recipes_data,
            'total': recipes_pagination.total,
            'pages': recipes_pagination.pages,
            'current_page': page,
            'per_page': per_page,
            'has_next': recipes_pagination.has_next,
            'has_prev': recipes_pagination.has_prev
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get recipes', 'error': str(e)}), 500

@recipes_bp.route('/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    try:
        recipe = Recipe.query.get(recipe_id)
        
        if not recipe:
            return jsonify({'message': 'Recipe not found'}), 404
        
        if not recipe.is_approved:
            return jsonify({'message': 'Recipe is not approved'}), 403
        
        # Get current user ID if authenticated
        user_id = None
        try:
            user_id = get_jwt_identity()
        except:
            pass
        
        # Increment view count
        recipe.views_count += 1
        db.session.commit()
        
        return jsonify({
            'recipe': recipe.to_dict(include_details=True, user_id=user_id)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get recipe', 'error': str(e)}), 500

@recipes_bp.route('/', methods=['POST'])
@jwt_required()
def create_recipe():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Check if user can create recipes
        if user.role not in ['creator', 'admin']:
            return jsonify({'message': 'Only content creators and admins can create recipes'}), 403
        
        data = request.get_json()
        
        # Validation
        if not data.get('title') or not data.get('description'):
            return jsonify({'message': 'Title and description are required'}), 400
        
        if not data.get('ingredients') or len(data['ingredients']) == 0:
            return jsonify({'message': 'At least one ingredient is required'}), 400
        
        if not data.get('instructions'):
            return jsonify({'message': 'Instructions are required'}), 400
        
        # Create recipe
        recipe = Recipe(
            title=data['title'],
            description=data['description'],
            prep_time=data.get('prep_time', 0),
            cook_time=data.get('cook_time', 0),
            servings=data.get('servings', 4),
            difficulty=data.get('difficulty', 'medium'),
            image_url=data.get('image_url'),
            video_url=data.get('video_url'),
            instructions=data.get('instructions'),
            user_id=user_id,
            is_approved=True  # Auto-approve for creators and admins
        )
        
        db.session.add(recipe)
        db.session.flush()  # Flush to get recipe.id
        
        # Add ingredients
        for index, ing_data in enumerate(data['ingredients']):
            if not ing_data.get('name'):
                continue
                
            ingredient = Ingredient(
                recipe_id=recipe.id,
                name=ing_data['name'],
                quantity=ing_data.get('quantity', ''),
                unit=ing_data.get('unit', ''),
                order_index=index
            )
            db.session.add(ingredient)
        
        # Add categories
        if data.get('categories'):
            for category_id in data['categories']:
                category = Category.query.get(category_id)
                if category and category.is_active:
                    recipe.categories.append(category)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Recipe created successfully!',
            'recipe': recipe.to_dict(include_details=True, user_id=user_id)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create recipe', 'error': str(e)}), 500

@recipes_bp.route('/<int:recipe_id>/favorite', methods=['POST'])
@jwt_required()
def add_to_favorites(recipe_id):
    try:
        user_id = get_jwt_identity()
        
        # Check if recipe exists
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({'message': 'Recipe not found'}), 404
        
        # Check if already favorited
        existing_favorite = Favorite.query.filter_by(
            user_id=user_id, 
            recipe_id=recipe_id
        ).first()
        
        if existing_favorite:
            return jsonify({'message': 'Recipe is already in favorites'}), 400
        
        # Add to favorites
        favorite = Favorite(user_id=user_id, recipe_id=recipe_id)
        db.session.add(favorite)
        db.session.commit()
        
        return jsonify({'message': 'Recipe added to favorites'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to add to favorites', 'error': str(e)}), 500

@recipes_bp.route('/<int:recipe_id>/favorite', methods=['DELETE'])
@jwt_required()
def remove_from_favorites(recipe_id):
    try:
        user_id = get_jwt_identity()
        
        favorite = Favorite.query.filter_by(
            user_id=user_id, 
            recipe_id=recipe_id
        ).first()
        
        if not favorite:
            return jsonify({'message': 'Recipe is not in favorites'}), 404
        
        db.session.delete(favorite)
        db.session.commit()
        
        return jsonify({'message': 'Recipe removed from favorites'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to remove from favorites', 'error': str(e)}), 500

@recipes_bp.route('/<int:recipe_id>/rating', methods=['POST'])
@jwt_required()
def rate_recipe(recipe_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validation
        if not data.get('rating') or not isinstance(data['rating'], int):
            return jsonify({'message': 'Rating is required and must be a number'}), 400
        
        if not (1 <= data['rating'] <= 5):
            return jsonify({'message': 'Rating must be between 1 and 5'}), 400
        
        # Check if recipe exists
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({'message': 'Recipe not found'}), 404
        
        # Check if user already rated this recipe
        existing_rating = Rating.query.filter_by(
            user_id=user_id, 
            recipe_id=recipe_id
        ).first()
        
        if existing_rating:
            # Update existing rating
            existing_rating.rating = data['rating']
            existing_rating.comment = data.get('comment', '')
            message = 'Rating updated successfully'
        else:
            # Create new rating
            rating = Rating(
                user_id=user_id,
                recipe_id=recipe_id,
                rating=data['rating'],
                comment=data.get('comment', '')
            )
            db.session.add(rating)
            message = 'Rating added successfully'
        
        db.session.commit()
        
        return jsonify({'message': message}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to rate recipe', 'error': str(e)}), 500

# Categories endpoints
@recipes_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = Category.query.filter_by(is_active=True).all()
        return jsonify({
            'categories': [category.to_dict() for category in categories]
        }), 200
    except Exception as e:
        return jsonify({'message': 'Failed to get categories', 'error': str(e)}), 500