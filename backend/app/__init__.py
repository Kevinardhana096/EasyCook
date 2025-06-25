from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Database configuration
    app.config['SECRET_KEY'] = 'cookeasy-working-2025-nowriafisda'
    app.config['JWT_SECRET_KEY'] = 'jwt-cookeasy-2025'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cookeasy.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Import models to ensure they're registered
    from app.models import User, Recipe, Category, Rating, Ingredient
    
    # Create tables
    with app.app_context():
        db.create_all()
        init_sample_data()
    
    # Import and register routes
    from app.api.auth.routes import auth_bp
    from app.api.recipes.routes import recipes_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(recipes_bp, url_prefix='/api/recipes')
    
    return app

def init_sample_data():
    """Initialize database with sample data"""
    from app.models import User, Category, Recipe, Ingredient, Rating
    from werkzeug.security import generate_password_hash
    
    # Check if data already exists
    if User.query.count() > 0:
        return
    
    print("🏗️  Initializing sample data...")
    
    # Create sample users
    users_data = [
        {
            'username': 'admin',
            'email': 'admin@cookeasy.com',
            'password': 'admin123',
            'full_name': 'CookEasy Admin',
            'role': 'admin',
            'bio': 'Administrator of CookEasy platform',
            'is_verified': True
        },
        {
            'username': 'chef_budi',
            'email': 'chef@cookeasy.com',
            'password': 'chef123',
            'full_name': 'Chef Budi Santoso',
            'role': 'chef',
            'bio': 'Professional Indonesian chef with 15 years experience',
            'is_verified': True
        },
        {
            'username': 'user_sari',
            'email': 'sari@example.com',
            'password': 'sari123',
            'full_name': 'Sari Dewi',
            'role': 'user',
            'bio': 'Home cooking enthusiast',
            'is_verified': True
        }
    ]
    
    for user_data in users_data:
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            full_name=user_data['full_name'],
            role=user_data['role'],
            bio=user_data['bio'],
            is_verified=user_data['is_verified']
        )
        user.set_password(user_data['password'])
        db.session.add(user)
    
    # Create sample categories
    categories_data = [
        {'name': 'Main Dishes', 'icon': '🍽️', 'color': '#FF6B35', 'description': 'Hearty main course recipes'},
        {'name': 'Appetizers', 'icon': '🥗', 'color': '#2EC4B6', 'description': 'Delicious starters and snacks'},
        {'name': 'Desserts', 'icon': '🍰', 'color': '#FFE66D', 'description': 'Sweet treats and desserts'},
        {'name': 'Beverages', 'icon': '🥤', 'color': '#4ECDC4', 'description': 'Refreshing drinks and beverages'},
        {'name': 'Indonesian', 'icon': '🍛', 'color': '#E74C3C', 'description': 'Traditional Indonesian cuisine'}
    ]
    
    for cat_data in categories_data:
        category = Category(
            name=cat_data['name'],
            slug=cat_data['name'].lower().replace(' ', '-'),
            icon=cat_data['icon'],
            color=cat_data['color'],
            description=cat_data['description']
        )
        db.session.add(category)
    
    # Create sample ingredients
    ingredients_data = [
        {'name': 'Rice', 'unit': 'cup', 'category': 'grain'},
        {'name': 'Chicken', 'unit': 'gram', 'category': 'protein'},
        {'name': 'Onion', 'unit': 'piece', 'category': 'vegetable'},
        {'name': 'Garlic', 'unit': 'clove', 'category': 'vegetable'},
        {'name': 'Soy Sauce', 'unit': 'tablespoon', 'category': 'condiment'},
        {'name': 'Cooking Oil', 'unit': 'tablespoon', 'category': 'oil'},
        {'name': 'Salt', 'unit': 'teaspoon', 'category': 'seasoning'},
        {'name': 'Pepper', 'unit': 'teaspoon', 'category': 'seasoning'}
    ]
    
    for ing_data in ingredients_data:
        ingredient = Ingredient(
            name=ing_data['name'],
            unit=ing_data['unit'],
            category=ing_data['category'],
            description=f"Fresh {ing_data['name'].lower()}"
        )
        db.session.add(ingredient)
    
    db.session.commit()
    
    # Create sample recipes
    chef_user = User.query.filter_by(username='chef_budi').first()
    user_sari = User.query.filter_by(username='user_sari').first()
    main_category = Category.query.filter_by(name='Main Dishes').first()
    indonesian_category = Category.query.filter_by(name='Indonesian').first()
    
    recipes_data = [
        {
            'title': 'Nasi Goreng Spesial',
            'description': 'Indonesian fried rice with chicken and vegetables, served with kerupuk',
            'instructions': '1. Heat oil in wok\n2. Fry garlic and onion until fragrant\n3. Add chicken, cook until done\n4. Add rice and soy sauce\n5. Stir-fry until well mixed\n6. Season with salt and pepper\n7. Serve with kerupuk',
            'prep_time': 15,
            'cook_time': 10,
            'servings': 2,
            'difficulty': 'Easy',
            'image_url': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
            'is_published': True,
            'is_featured': True,
            'user_id': chef_user.id,
            'category_id': indonesian_category.id
        },
        {
            'title': 'Ayam Goreng Kremes',
            'description': 'Crispy Indonesian fried chicken with spiced coating',
            'instructions': '1. Marinate chicken with spices\n2. Coat with seasoned flour\n3. Deep fry until golden brown\n4. Drain excess oil\n5. Serve with sambal',
            'prep_time': 30,
            'cook_time': 20,
            'servings': 4,
            'difficulty': 'Medium',
            'image_url': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
            'is_published': True,
            'is_featured': False,
            'user_id': chef_user.id,
            'category_id': main_category.id
        }
    ]
    
    for recipe_data in recipes_data:
        recipe_data['slug'] = recipe_data['title'].lower().replace(' ', '-').replace(',', '')
        recipe_data['total_time'] = recipe_data['prep_time'] + recipe_data['cook_time']
        
        recipe = Recipe(**recipe_data)
        db.session.add(recipe)
    
    db.session.commit()
    
    # Create sample ratings
    recipes = Recipe.query.all()
    for recipe in recipes:
        # Rating from user_sari
        rating1 = Rating(
            user_id=user_sari.id,
            recipe_id=recipe.id,
            rating=5,
            review="Absolutely delicious! Easy to follow recipe.",
            is_verified=True
        )
        db.session.add(rating1)
        
        # Rating from admin (if different recipe)
        if recipe.user_id != User.query.filter_by(username='admin').first().id:
            admin_user = User.query.filter_by(username='admin').first()
            rating2 = Rating(
                user_id=admin_user.id,
                recipe_id=recipe.id,
                rating=4,
                review="Great recipe, well explained steps.",
                is_verified=False
            )
            db.session.add(rating2)
    
    db.session.commit()
    print("✅ Sample data initialized!")