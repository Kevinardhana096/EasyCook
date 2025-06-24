"""
CookEasy Backend with In-Memory Database (Working Version)
Created: 2025-06-21 07:41:57 UTC
User: nowriafisda
"""
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import traceback

# Create Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'cookeasy-working-2025-nowriafisda'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # In-memory database
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'jwt-cookeasy-2025'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

# Initialize extensions
db = SQLAlchemy(app)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
jwt = JWTManager(app)

# Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100))
    bio = db.Column(db.Text)
    role = db.Column(db.String(20), default='user')
    profile_image = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_private=False):
        data = {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'bio': self.bio,
            'role': self.role,
            'profile_image': self.profile_image,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_seen_at': self.last_seen_at.isoformat() if self.last_seen_at else None
        }
        
        if include_private:
            data.update({
                'email': self.email,
                'is_active': self.is_active
            })
        
        return data

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    slug = db.Column(db.String(60), unique=True, nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(50))
    color = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    recipe_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'icon': self.icon,
            'color': self.color,
            'is_active': self.is_active,
            'recipe_count': self.recipe_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

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
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self, include_details=True):
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
            'user_id': self.user_id,
            'category_id': self.category_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_details:
            data['instructions'] = self.instructions
        
        return data

# Routes
@app.route('/api/')
def api_home():
    return jsonify({
        'message': 'Welcome to CookEasy API! 🍳',
        'version': '1.0.0-working',
        'timestamp': datetime.utcnow().isoformat(),
        'status': 'healthy',
        'database': 'in-memory (working)',
        'developer': 'nowriafisda',
        'created': '2025-06-21 07:41:57 UTC',
        'endpoints': {
            'auth': '/api/auth/*',
            'recipes': '/api/recipes/*',
            'users': '/api/users/*'
        }
    })

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'CookEasy API is running!',
        'timestamp': datetime.utcnow().isoformat(),
        'user': 'nowriafisda'
    })

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print(f"📝 Registration data: {data}")
        
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Username, email, and password are required'}), 400
        
        # Check if user exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already taken'}), 400
        
        # Create user
        user = User(
            username=data['username'],
            email=data['email'],
            full_name=data.get('full_name', data['username']),
            bio=data.get('bio', ''),
            role=data.get('role', 'user'),
            is_active=True
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generate token
        access_token = create_access_token(identity=user.id)
        
        print(f"✅ User registered: {user.username}")
        
        return jsonify({
            'message': f'Welcome to CookEasy, {user.username}! 🎉',
            'access_token': access_token,
            'user': user.to_dict(include_private=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Registration error: {str(e)}")
        traceback.print_exc()
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print(f"📝 Login attempt: {data.get('email', 'unknown')}")
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'message': 'Account is deactivated'}), 401
        
        # Update last seen
        user.last_seen_at = datetime.utcnow()
        db.session.commit()
        
        # Generate token
        access_token = create_access_token(identity=user.id)
        
        print(f"✅ Login successful: {user.username}")
        
        return jsonify({
            'message': f'Welcome back, {user.username}! 👋',
            'access_token': access_token,
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        traceback.print_exc()
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict(include_private=True)}), 200
        
    except Exception as e:
        print(f"❌ Profile error: {str(e)}")
        return jsonify({'message': 'Failed to get profile'}), 500

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logged out successfully! See you soon! 👋'}), 200

# Recipe routes
@app.route('/api/recipes/categories', methods=['GET'])
def get_categories():
    try:
        print("📝 Getting categories...")
        categories = Category.query.filter_by(is_active=True).order_by(Category.name).all()
        print(f"📝 Found {len(categories)} categories")
        
        return jsonify({
            'categories': [category.to_dict() for category in categories],
            'count': len(categories),
            'message': 'Categories retrieved successfully'
        }), 200
        
    except Exception as e:
        print(f"❌ Get categories error: {str(e)}")
        traceback.print_exc()
        return jsonify({'message': 'Failed to get categories', 'error': str(e)}), 500

@app.route('/api/recipes/', methods=['GET'])
def get_recipes():
    try:
        print("📝 Getting recipes...")
        recipes = Recipe.query.filter_by(is_published=True).order_by(Recipe.created_at.desc()).all()
        print(f"📝 Found {len(recipes)} recipes")
        
        return jsonify({
            'recipes': [recipe.to_dict(include_details=False) for recipe in recipes],
            'count': len(recipes)
        }), 200
        
    except Exception as e:
        print(f"❌ Get recipes error: {str(e)}")
        return jsonify({'message': 'Failed to get recipes', 'error': str(e)}), 500

@app.route('/api/recipes/featured', methods=['GET'])
def get_featured_recipes():
    try:
        recipes = Recipe.query.filter_by(is_published=True, is_featured=True).limit(6).all()
        return jsonify({
            'recipes': [recipe.to_dict(include_details=False) for recipe in recipes],
            'count': len(recipes)
        }), 200
    except Exception as e:
        return jsonify({'message': 'Failed to get featured recipes'}), 500
    
# Add search endpoint to existing file
@app.route('/api/recipes/search', methods=['GET'])
def search_recipes():
    try:
        query = request.args.get('q', '').strip()
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 12)), 50)
        category_id = request.args.get('category_id', type=int)
        difficulty = request.args.get('difficulty')
        sort_by = request.args.get('sort_by', 'created_at')
        
        print(f"📝 Searching recipes: query='{query}', category={category_id}, difficulty={difficulty}")
        
        # Build query
        recipes_query = Recipe.query.filter_by(is_published=True)
        
        # Apply search filter
        if query:
            recipes_query = recipes_query.filter(
                db.or_(
                    Recipe.title.ilike(f'%{query}%'),
                    Recipe.description.ilike(f'%{query}%'),
                    Recipe.instructions.ilike(f'%{query}%')
                )
            )
        
        # Apply filters
        if category_id:
            recipes_query = recipes_query.filter_by(category_id=category_id)
        
        if difficulty:
            recipes_query = recipes_query.filter_by(difficulty=difficulty)
        
        # Apply sorting
        if sort_by == 'views':
            recipes_query = recipes_query.order_by(Recipe.view_count.desc())
        elif sort_by == 'likes':
            recipes_query = recipes_query.order_by(Recipe.like_count.desc())
        else:
            recipes_query = recipes_query.order_by(Recipe.created_at.desc())
        
        # Paginate
        recipes = recipes_query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        print(f"📝 Found {len(recipes.items)} recipes")
        
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
            'query': query,
            'filters': {
                'category_id': category_id,
                'difficulty': difficulty,
                'sort_by': sort_by
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Search error: {str(e)}")
        traceback.print_exc()
        return jsonify({'message': 'Search failed', 'error': str(e)}), 500

# Add recipe detail endpoint
@app.route('/api/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe_detail(recipe_id):
    try:
        print(f"📝 Getting recipe detail: {recipe_id}")
        
        recipe = Recipe.query.get(recipe_id)
        
        if not recipe or not recipe.is_published:
            return jsonify({'message': 'Recipe not found'}), 404
        
        # Increment view count
        recipe.view_count = (recipe.view_count or 0) + 1
        db.session.commit()
        
        # Get user info
        user = User.query.get(recipe.user_id) if recipe.user_id else None
        
        # Get category info
        category = Category.query.get(recipe.category_id) if recipe.category_id else None
        
        recipe_data = recipe.to_dict(include_details=True)
        
        # Add user info
        if user:
            recipe_data['user'] = user.to_dict()
        
        # Add category info
        if category:
            recipe_data['category'] = category.to_dict()
        
        # Mock ingredients for now
        recipe_data['ingredients'] = [
            {'ingredient_name': 'Rice', 'quantity': 2, 'unit': 'cups', 'notes': 'jasmine rice'},
            {'ingredient_name': 'Chicken', 'quantity': 300, 'unit': 'grams', 'notes': 'diced'},
            {'ingredient_name': 'Garlic', 'quantity': 3, 'unit': 'cloves', 'notes': 'minced'},
            {'ingredient_name': 'Onion', 'quantity': 1, 'unit': 'piece', 'notes': 'diced'},
            {'ingredient_name': 'Soy Sauce', 'quantity': 2, 'unit': 'tbsp', 'notes': 'dark soy sauce'}
        ]
        
        print(f"✅ Recipe detail loaded: {recipe.title}")
        
        return jsonify({'recipe': recipe_data}), 200
        
    except Exception as e:
        print(f"❌ Recipe detail error: {str(e)}")
        traceback.print_exc()
        return jsonify({'message': 'Failed to get recipe', 'error': str(e)}), 500
# Add create recipe endpoint (append to existing file)

@app.route('/api/recipes/', methods=['POST'])
@jwt_required()
def create_recipe():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        print(f"📝 Creating recipe by {user.username}: {data.get('title', 'Untitled')}")
        
        # Validation
        required_fields = ['title', 'description', 'instructions']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field.title()} is required'}), 400
        
        # Create recipe
        recipe = Recipe(
            title=data['title'],
            slug=data.get('slug', data['title'].lower().replace(' ', '-')),
            description=data['description'],
            instructions=data['instructions'],
            prep_time=data.get('prep_time'),
            cook_time=data.get('cook_time'),
            total_time=data.get('total_time'),
            servings=data.get('servings', 4),
            difficulty=data.get('difficulty', 'Medium'),
            image_url=data.get('image_url'),
            tips=data.get('tips'),
            calories_per_serving=data.get('nutrition', {}).get('calories_per_serving'),
            protein=data.get('nutrition', {}).get('protein'),
            carbs=data.get('nutrition', {}).get('carbs'),
            fat=data.get('nutrition', {}).get('fat'),
            fiber=data.get('nutrition', {}).get('fiber'),
            is_published=data.get('is_published', True),
            is_featured=False,
            view_count=0,
            like_count=0,
            user_id=user_id,
            category_id=data.get('category_id')
        )
        
        db.session.add(recipe)
        db.session.commit()
        
        print(f"✅ Recipe created: {recipe.title} (ID: {recipe.id})")
        
        return jsonify({
            'message': f'Recipe "{recipe.title}" created successfully! 🎉',
            'recipe': recipe.to_dict(include_details=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Create recipe error: {str(e)}")
        traceback.print_exc()
        return jsonify({'message': 'Failed to create recipe', 'error': str(e)}), 500

@app.route('/api/recipes/<int:recipe_id>', methods=['PUT'])
@jwt_required()
def update_recipe(recipe_id):
    try:
        user_id = get_jwt_identity()
        recipe = Recipe.query.get(recipe_id)
        
        if not recipe:
            return jsonify({'message': 'Recipe not found'}), 404
        
        if recipe.user_id != user_id:
            return jsonify({'message': 'Not authorized to edit this recipe'}), 403
        
        data = request.get_json()
        print(f"📝 Updating recipe: {recipe.title}")
        
        # Update recipe fields
        updatable_fields = [
            'title', 'description', 'instructions', 'prep_time', 'cook_time',
            'total_time', 'servings', 'difficulty', 'image_url', 'tips',
            'calories_per_serving', 'protein', 'carbs', 'fat', 'fiber',
            'category_id', 'is_published'
        ]
        
        for field in updatable_fields:
            if field in data:
                if field == 'slug':
                    setattr(recipe, field, data['title'].lower().replace(' ', '-'))
                else:
                    setattr(recipe, field, data[field])
        
        # Handle nutrition data
        if 'nutrition' in data:
            nutrition = data['nutrition']
            recipe.calories_per_serving = nutrition.get('calories_per_serving')
            recipe.protein = nutrition.get('protein')
            recipe.carbs = nutrition.get('carbs')
            recipe.fat = nutrition.get('fat')
            recipe.fiber = nutrition.get('fiber')
        
        recipe.updated_at = datetime.utcnow()
        db.session.commit()
        
        print(f"✅ Recipe updated: {recipe.title}")
        
        return jsonify({
            'message': 'Recipe updated successfully! ✨',
            'recipe': recipe.to_dict(include_details=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Update recipe error: {str(e)}")
        return jsonify({'message': 'Failed to update recipe', 'error': str(e)}), 500

@app.route('/api/users/me/recipes', methods=['GET'])
@jwt_required()
def get_my_recipes():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 12)), 50)
        
        recipes = Recipe.query.filter_by(user_id=user_id).order_by(
            Recipe.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'recipes': [recipe.to_dict(include_details=False) for recipe in recipes.items],
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
        print(f"❌ Get my recipes error: {str(e)}")
        return jsonify({'message': 'Failed to get recipes', 'error': str(e)}), 500
    
    # Add these endpoints to existing file (append at the end before if __name__ == '__main__':)

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_public_profile(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'message': 'User not found'}), 404
        
        print(f"📝 Getting public profile for user: {user.username}")
        
        return jsonify({
            'user': user.to_dict(include_private=False)
        }), 200
        
    except Exception as e:
        print(f"❌ Get user profile error: {str(e)}")
        return jsonify({'message': 'Failed to get user profile', 'error': str(e)}), 500

@app.route('/api/users/<int:user_id>/recipes', methods=['GET'])
def get_user_public_recipes(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'message': 'User not found'}), 404
        
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 12)), 50)
        
        recipes = Recipe.query.filter_by(
            user_id=user_id, 
            is_published=True
        ).order_by(Recipe.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        print(f"📝 Getting recipes for user {user.username}: {len(recipes.items)} recipes")
        
        return jsonify({
            'recipes': [recipe.to_dict(include_details=False) for recipe in recipes.items],
            'user': user.to_dict(include_private=False),
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
        print(f"❌ Get user recipes error: {str(e)}")
        return jsonify({'message': 'Failed to get user recipes', 'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        print(f"📝 Updating profile for {user.username}")
        
        # Update allowed fields
        updatable_fields = [
            'full_name', 'bio', 'location', 'website', 'profile_image',
            'cooking_level', 'favorite_cuisines', 'dietary_preferences'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(user, field, data[field])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        print(f"✅ Profile updated for {user.username}")
        
        return jsonify({
            'message': 'Profile updated successfully! ✨',
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Profile update error: {str(e)}")
        traceback.print_exc()
        return jsonify({'message': 'Failed to update profile', 'error': str(e)}), 500

# Update the init_database function to include more user data
def init_database():
    with app.app_context():
        # Create tables
        db.create_all()
        print("🏗️  Created database tables")
        
        # Add sample users with enhanced data
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@cookeasy.com',
                'password': 'admin123',
                'full_name': 'CookEasy Admin',
                'role': 'admin',
                'bio': 'Administrator of CookEasy platform. Food lover and community builder! 🍳',
                'location': 'Jakarta, Indonesia',
                'website': 'https://cookeasy.com',
                'cooking_level': 'expert',
                'favorite_cuisines': ['Indonesian', 'Italian', 'Japanese'],
                'dietary_preferences': ['Halal'],
                'is_verified': True,
                'recipe_count': 3,
                'total_likes': 201,
                'follower_count': 1250
            },
            {
                'username': 'chef_budi',
                'email': 'chef@cookeasy.com',
                'password': 'chef123',
                'full_name': 'Chef Budi Santoso',
                'role': 'chef',
                'bio': 'Professional Indonesian chef with 15+ years experience. Passionate about sharing traditional recipes with modern twists! 👨‍🍳',
                'location': 'Yogyakarta, Indonesia',
                'website': 'https://chefbudi.com',
                'cooking_level': 'expert',
                'favorite_cuisines': ['Indonesian', 'Asian Fusion', 'Thai'],
                'dietary_preferences': ['Halal'],
                'is_verified': True,
                'recipe_count': 0,
                'total_likes': 0,
                'follower_count': 850
            },
            {
                'username': 'nowriafisda',
                'email': 'nowriafisda@cookeasy.com',
                'password': 'nowria123',
                'full_name': 'Nowria Fisda',
                'role': 'user',
                'bio': 'Food enthusiast and home cook from Indonesia. Love experimenting with fusion recipes and sharing cooking tips! 🌟',
                'location': 'Indonesia',
                'website': 'https://nowriafisda.dev',
                'cooking_level': 'intermediate',
                'favorite_cuisines': ['Indonesian', 'Mediterranean', 'Korean'],
                'dietary_preferences': ['Vegetarian', 'Halal'],
                'is_verified': False,
                'recipe_count': 0,
                'total_likes': 0,
                'follower_count': 42
            }
        ]
        
        for user_data in users_data:
            if not User.query.filter_by(email=user_data['email']).first():
                user = User(
                    username=user_data['username'],
                    email=user_data['email'],
                    full_name=user_data['full_name'],
                    role=user_data['role'],
                    bio=user_data['bio'],
                    location=user_data.get('location'),
                    website=user_data.get('website'),
                    cooking_level=user_data.get('cooking_level', 'beginner'),
                    favorite_cuisines=user_data.get('favorite_cuisines', []),
                    dietary_preferences=user_data.get('dietary_preferences', []),
                    is_active=True,
                    is_verified=user_data.get('is_verified', False),
                    recipe_count=user_data.get('recipe_count', 0),
                    total_likes=user_data.get('total_likes', 0),
                    follower_count=user_data.get('follower_count', 0)
                )
                user.set_password(user_data['password'])
                db.session.add(user)
                print(f"   ✅ Added user: {user_data['username']}")
        
        # Rest of the initialization code remains the same...
        # (categories and recipes creation code)
        
        # Add sample categories
        categories_data = [
            {'name': 'Main Dishes', 'icon': '🍽️', 'color': '#FF6B35'},
            {'name': 'Appetizers', 'icon': '🥗', 'color': '#2EC4B6'},
            {'name': 'Desserts', 'icon': '🍰', 'color': '#FFE66D'},
            {'name': 'Beverages', 'icon': '🥤', 'color': '#4ECDC4'},
            {'name': 'Breakfast', 'icon': '🥞', 'color': '#45B7D1'},
            {'name': 'Snacks', 'icon': '🍿', 'color': '#96CEB4'}
        ]
        
        for cat_data in categories_data:
            if not Category.query.filter_by(name=cat_data['name']).first():
                category = Category(
                    name=cat_data['name'],
                    slug=cat_data['name'].lower().replace(' ', '-'),
                    icon=cat_data['icon'],
                    color=cat_data['color'],
                    description=f"Delicious {cat_data['name'].lower()} recipes",
                    is_active=True,
                    recipe_count=0
                )
                db.session.add(category)
                print(f"   ✅ Added category: {cat_data['name']}")
        
        # Add sample recipes
        admin_user = User.query.filter_by(username='admin').first()
        main_dishes_cat = Category.query.filter_by(name='Main Dishes').first()
        
        if admin_user and main_dishes_cat:
            sample_recipes = [
                {
                    'title': 'Nasi Goreng Spesial',
                    'slug': 'nasi-goreng-spesial',
                    'description': 'Nasi goreng Indonesia dengan bumbu rahasia yang menggugah selera',
                    'instructions': 'Tumis bumbu, masukkan nasi, aduk rata, sajikan dengan kerupuk.',
                    'prep_time': 15,
                    'cook_time': 10,
                    'total_time': 25,
                    'servings': 2,
                    'difficulty': 'Easy',
                    'image_url': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
                    'is_published': True,
                    'is_featured': True,
                    'view_count': 245,
                    'like_count': 89
                },
                {
                    'title': 'Mie Ayam Jakarta',
                    'slug': 'mie-ayam-jakarta',
                    'description': 'Mie ayam khas Jakarta dengan kuah kaldu yang gurih',
                    'instructions': 'Rebus mie, siapkan topping ayam, sajikan dengan kuah kaldu.',
                    'prep_time': 20,
                    'cook_time': 15,
                    'total_time': 35,
                    'servings': 1,
                    'difficulty': 'Medium',
                    'image_url': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
                    'is_published': True,
                    'is_featured': True,
                    'view_count': 156,
                    'like_count': 67
                },
                {
                    'title': 'Gado-Gado Betawi',
                    'slug': 'gado-gado-betawi',
                    'description': 'Salad sayuran Indonesia dengan bumbu kacang yang khas',
                    'instructions': 'Rebus sayuran, buat bumbu kacang, campur dan sajikan.',
                    'prep_time': 25,
                    'cook_time': 5,
                    'total_time': 30,
                    'servings': 2,
                    'difficulty': 'Easy',
                    'image_url': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
                    'is_published': True,
                    'is_featured': True,
                    'view_count': 198,
                    'like_count': 45
                }
            ]
            
            for recipe_data in sample_recipes:
                if not Recipe.query.filter_by(slug=recipe_data['slug']).first():
                    recipe = Recipe(
                        title=recipe_data['title'],
                        slug=recipe_data['slug'],
                        description=recipe_data['description'],
                        instructions=recipe_data['instructions'],
                        prep_time=recipe_data['prep_time'],
                        cook_time=recipe_data['cook_time'],
                        total_time=recipe_data['total_time'],
                        servings=recipe_data['servings'],
                        difficulty=recipe_data['difficulty'],
                        image_url=recipe_data['image_url'],
                        is_published=recipe_data['is_published'],
                        is_featured=recipe_data['is_featured'],
                        view_count=recipe_data['view_count'],
                        like_count=recipe_data['like_count'],
                        user_id=admin_user.id,
                        category_id=main_dishes_cat.id
                    )
                    db.session.add(recipe)
                    print(f"   ✅ Added recipe: {recipe_data['title']}")
        
        db.session.commit()
        
        # Final stats
        user_count = User.query.count()
        category_count = Category.query.count()
        recipe_count = Recipe.query.count()
        
        print(f"\n✅ Database initialized successfully!")
        print(f"📊 Created: {user_count} users, {category_count} categories, {recipe_count} recipes")
        print(f"🔐 Test accounts available:")
        print(f"   Admin: admin@cookeasy.com / admin123")
        print(f"   Chef: chef@cookeasy.com / chef123")
        print(f"   User: nowriafisda@cookeasy.com / nowria123")
        print(f"\n📅 Database updated: 2025-06-21 08:58:55 UTC")
        print(f"👤 Current user: nowriafisda")

# Initialize database with sample data
def init_database():
    with app.app_context():
        # Create tables
        db.create_all()
        print("🏗️  Created database tables")
        
        # Add sample users
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@cookeasy.com',
                'password': 'admin123',
                'full_name': 'CookEasy Admin',
                'role': 'admin',
                'bio': 'Administrator of CookEasy platform'
            },
            {
                'username': 'chef_budi',
                'email': 'chef@cookeasy.com',
                'password': 'chef123',
                'full_name': 'Chef Budi Santoso',
                'role': 'chef',
                'bio': 'Professional Indonesian chef with 15+ years experience'
            },
            {
                'username': 'nowriafisda',
                'email': 'nowriafisda@cookeasy.com',
                'password': 'nowria123',
                'full_name': 'Nowria Fisda',
                'role': 'user',
                'bio': 'Food enthusiast and home cook from Indonesia'
            }
        ]
        
        for user_data in users_data:
            if not User.query.filter_by(email=user_data['email']).first():
                user = User(
                    username=user_data['username'],
                    email=user_data['email'],
                    full_name=user_data['full_name'],
                    role=user_data['role'],
                    bio=user_data['bio'],
                    is_active=True,
                    is_verified=True
                )
                user.set_password(user_data['password'])
                db.session.add(user)
                print(f"   ✅ Added user: {user_data['username']}")
        
        # Add sample categories
        categories_data = [
            {'name': 'Main Dishes', 'icon': '🍽️', 'color': '#FF6B35'},
            {'name': 'Appetizers', 'icon': '🥗', 'color': '#2EC4B6'},
            {'name': 'Desserts', 'icon': '🍰', 'color': '#FFE66D'},
            {'name': 'Beverages', 'icon': '🥤', 'color': '#4ECDC4'},
            {'name': 'Breakfast', 'icon': '🥞', 'color': '#45B7D1'},
            {'name': 'Snacks', 'icon': '🍿', 'color': '#96CEB4'}
        ]
        
        for cat_data in categories_data:
            if not Category.query.filter_by(name=cat_data['name']).first():
                category = Category(
                    name=cat_data['name'],
                    slug=cat_data['name'].lower().replace(' ', '-'),
                    icon=cat_data['icon'],
                    color=cat_data['color'],
                    description=f"Delicious {cat_data['name'].lower()} recipes",
                    is_active=True,
                    recipe_count=0
                )
                db.session.add(category)
                print(f"   ✅ Added category: {cat_data['name']}")
        
        # Add sample recipes
        admin_user = User.query.filter_by(username='admin').first()
        main_dishes_cat = Category.query.filter_by(name='Main Dishes').first()
        
        if admin_user and main_dishes_cat:
            sample_recipes = [
                {
                    'title': 'Nasi Goreng Spesial',
                    'slug': 'nasi-goreng-spesial',
                    'description': 'Nasi goreng Indonesia dengan bumbu rahasia yang menggugah selera',
                    'instructions': 'Tumis bumbu, masukkan nasi, aduk rata, sajikan dengan kerupuk.',
                    'prep_time': 15,
                    'cook_time': 10,
                    'total_time': 25,
                    'servings': 2,
                    'difficulty': 'Easy',
                    'image_url': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
                    'is_published': True,
                    'is_featured': True,
                    'view_count': 245,
                    'like_count': 89
                },
                {
                    'title': 'Mie Ayam Jakarta',
                    'slug': 'mie-ayam-jakarta',
                    'description': 'Mie ayam khas Jakarta dengan kuah kaldu yang gurih',
                    'instructions': 'Rebus mie, siapkan topping ayam, sajikan dengan kuah kaldu.',
                    'prep_time': 20,
                    'cook_time': 15,
                    'total_time': 35,
                    'servings': 1,
                    'difficulty': 'Medium',
                    'image_url': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
                    'is_published': True,
                    'is_featured': True,
                    'view_count': 156,
                    'like_count': 67
                },
                {
                    'title': 'Gado-Gado Betawi',
                    'slug': 'gado-gado-betawi',
                    'description': 'Salad sayuran Indonesia dengan bumbu kacang yang khas',
                    'instructions': 'Rebus sayuran, buat bumbu kacang, campur dan sajikan.',
                    'prep_time': 25,
                    'cook_time': 5,
                    'total_time': 30,
                    'servings': 2,
                    'difficulty': 'Easy',
                    'image_url': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
                    'is_published': True,
                    'is_featured': True,
                    'view_count': 198,
                    'like_count': 45
                }
            ]
            
            for recipe_data in sample_recipes:
                if not Recipe.query.filter_by(slug=recipe_data['slug']).first():
                    recipe = Recipe(
                        title=recipe_data['title'],
                        slug=recipe_data['slug'],
                        description=recipe_data['description'],
                        instructions=recipe_data['instructions'],
                        prep_time=recipe_data['prep_time'],
                        cook_time=recipe_data['cook_time'],
                        total_time=recipe_data['total_time'],
                        servings=recipe_data['servings'],
                        difficulty=recipe_data['difficulty'],
                        image_url=recipe_data['image_url'],
                        is_published=recipe_data['is_published'],
                        is_featured=recipe_data['is_featured'],
                        view_count=recipe_data['view_count'],
                        like_count=recipe_data['like_count'],
                        user_id=admin_user.id,
                        category_id=main_dishes_cat.id
                    )
                    db.session.add(recipe)
                    print(f"   ✅ Added recipe: {recipe_data['title']}")
        
        db.session.commit()
        
        # Final stats
        user_count = User.query.count()
        category_count = Category.query.count()
        recipe_count = Recipe.query.count()
        
        print(f"\n✅ Database initialized successfully!")
        print(f"📊 Created: {user_count} users, {category_count} categories, {recipe_count} recipes")
        print(f"🔐 Test accounts available:")
        print(f"   Admin: admin@cookeasy.com / admin123")
        print(f"   Chef: chef@cookeasy.com / chef123")
        print(f"   User: nowriafisda@cookeasy.com / nowria123")

if __name__ == '__main__':
    print("🚀 CookEasy Backend (Working Version)")
    print(f"📅 Started: 2025-06-21 07:41:57 UTC")
    print(f"👤 Started by: nowriafisda")
    print("🗄️  Database: In-Memory SQLite (for development)")
    print("🌐 Server: http://localhost:5000")
    print("📖 API: http://localhost:5000/api")
    print("=" * 60)
    
    # Initialize database
    init_database()
    
    print("\n🎯 Ready to test! Try these endpoints:")
    print("   GET  http://localhost:5000/api/")
    print("   GET  http://localhost:5000/api/recipes/categories")
    print("   POST http://localhost:5000/api/auth/register")
    print("   POST http://localhost:5000/api/auth/login")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
    