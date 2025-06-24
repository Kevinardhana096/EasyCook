"""
Fixed database setup with better error handling
"""
import os
import sys
from app import create_app, db
from app.models import User, Category, Ingredient

def setup_database():
    """Setup database with proper error handling"""
    try:
        app = create_app()
        
        # Ensure database directory exists
        db_path = os.path.join(os.path.dirname(__file__), 'cookeasy-dev.db')
        db_dir = os.path.dirname(db_path)
        
        if not os.path.exists(db_dir):
            os.makedirs(db_dir)
            print(f"✅ Created database directory: {db_dir}")
        
        with app.app_context():
            print("🗑️  Dropping existing tables...")
            try:
                db.drop_all()
            except Exception as e:
                print(f"⚠️  Warning dropping tables: {e}")
            
            print("🏗️  Creating database tables...")
            db.create_all()
            
            # Verify tables were created
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"✅ Created tables: {tables}")
            
            print("🌱 Seeding initial data...")
            
            # Create users
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
                    'bio': 'Professional Indonesian chef'
                },
                {
                    'username': 'nowriafisda',
                    'email': 'nowriafisda@cookeasy.com',
                    'password': 'nowria123',
                    'full_name': 'Nowria Fisda',
                    'role': 'user',
                    'bio': 'Food enthusiast and developer'
                }
            ]
            
            for user_data in users_data:
                existing_user = User.query.filter_by(email=user_data['email']).first()
                if not existing_user:
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
                    print(f"   ✅ Created user: {user_data['username']}")
                else:
                    print(f"   ⚠️  User exists: {user_data['username']}")
            
            # Create categories
            categories_data = [
                {'name': 'Main Dishes', 'icon': '🍽️', 'color': '#FF6B35'},
                {'name': 'Appetizers', 'icon': '🥗', 'color': '#2EC4B6'},
                {'name': 'Desserts', 'icon': '🍰', 'color': '#FFE66D'},
                {'name': 'Beverages', 'icon': '🥤', 'color': '#4ECDC4'},
                {'name': 'Breakfast', 'icon': '🥞', 'color': '#45B7D1'},
                {'name': 'Snacks', 'icon': '🍿', 'color': '#96CEB4'}
            ]
            
            for cat_data in categories_data:
                existing_cat = Category.query.filter_by(name=cat_data['name']).first()
                if not existing_cat:
                    category = Category(
                        name=cat_data['name'],
                        slug=cat_data['name'].lower().replace(' ', '-'),
                        icon=cat_data['icon'],
                        color=cat_data['color'],
                        description=f"Delicious {cat_data['name'].lower()} recipes",
                        is_active=True
                    )
                    db.session.add(category)
                    print(f"   ✅ Created category: {cat_data['name']}")
                else:
                    print(f"   ⚠️  Category exists: {cat_data['name']}")
            
            # Create basic ingredients
            ingredients_data = [
                {'name': 'Salt', 'unit': 'tsp', 'category': 'seasoning'},
                {'name': 'Pepper', 'unit': 'tsp', 'category': 'seasoning'},
                {'name': 'Garlic', 'unit': 'clove', 'category': 'vegetable'},
                {'name': 'Onion', 'unit': 'piece', 'category': 'vegetable'},
                {'name': 'Rice', 'unit': 'cup', 'category': 'grain'},
                {'name': 'Oil', 'unit': 'ml', 'category': 'oil'}
            ]
            
            for ing_data in ingredients_data:
                existing_ing = Ingredient.query.filter_by(name=ing_data['name']).first()
                if not existing_ing:
                    ingredient = Ingredient(
                        name=ing_data['name'],
                        unit=ing_data['unit'],
                        category=ing_data['category']
                    )
                    db.session.add(ingredient)
                    print(f"   ✅ Created ingredient: {ing_data['name']}")
                else:
                    print(f"   ⚠️  Ingredient exists: {ing_data['name']}")
            
            # Commit all changes
            db.session.commit()
            
            # Verify data
            user_count = User.query.count()
            category_count = Category.query.count()
            ingredient_count = Ingredient.query.count()
            
            print(f"\n✅ Database setup completed successfully!")
            print(f"📊 Final count:")
            print(f"   - Users: {user_count}")
            print(f"   - Categories: {category_count}")
            print(f"   - Ingredients: {ingredient_count}")
            
            print(f"\n🔐 Test accounts:")
            print(f"   Admin: admin@cookeasy.com / admin123")
            print(f"   Chef: chef@cookeasy.com / chef123")
            print(f"   User: nowriafisda@cookeasy.com / nowria123")
            print(f"\n🌐 API Base URL: http://localhost:5000/api")
            print(f"📅 Setup completed: 2025-06-21 07:26:56 UTC")
            print(f"👤 Setup by: nowriafisda")
            
            return True
            
    except Exception as e:
        print(f"❌ Database setup failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = setup_database()
    sys.exit(0 if success else 1)