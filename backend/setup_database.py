"""
Database setup script for CookEasy
Creates database tables and seeds initial data
"""
from app import create_app, db
from app.models import User, Category, Ingredient
import os

def create_uploads_folder():
    """Create uploads folder if it doesn't exist"""
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        print(f"✅ Created uploads directory: {uploads_dir}")
    return uploads_dir

def setup_database():
    """Setup database with tables and initial data"""
    app = create_app()
    
    with app.app_context():
        try:
            # Create uploads folder
            create_uploads_folder()
            
            # Drop all tables and recreate (for clean setup)
            print("🗑️  Dropping existing tables...")
            db.drop_all()
            
            print("🏗️  Creating database tables...")
            db.create_all()
            
            print("🌱 Seeding initial data...")
            
            # Create admin user
            admin = User(
                username='admin',
                email='admin@cookeasy.com',
                full_name='CookEasy Admin',
                role='admin',
                bio='Administrator of CookEasy platform',
                is_verified=True
            )
            admin.set_password('admin123')
            db.session.add(admin)
            
            # Create chef user
            chef = User(
                username='chef_budi',
                email='chef@cookeasy.com',
                full_name='Chef Budi Santoso',
                role='chef',
                bio='Professional Indonesian chef with 15+ years experience',
                is_verified=True,
                location='Jakarta, Indonesia'
            )
            chef.set_password('chef123')
            db.session.add(chef)
            
            # Create regular user (nowriafisda)
            user = User(
                username='nowriafisda',
                email='nowriafisda@cookeasy.com',
                full_name='Nowria Fisda',
                role='user',
                bio='Food enthusiast and home cook who loves sharing recipes',
                location='Indonesia'
            )
            user.set_password('nowria123')
            db.session.add(user)
            
            # Create categories
            categories_data = [
                {
                    'name': 'Main Dishes',
                    'icon': '🍽️',
                    'color': '#FF6B35',
                    'description': 'Hearty main course recipes for lunch and dinner'
                },
                {
                    'name': 'Appetizers',
                    'icon': '🥗',
                    'color': '#2EC4B6',
                    'description': 'Light starters to begin your meal'
                },
                {
                    'name': 'Desserts',
                    'icon': '🍰',
                    'color': '#FFE66D',
                    'description': 'Sweet treats and desserts'
                },
                {
                    'name': 'Beverages',
                    'icon': '🥤',
                    'color': '#4ECDC4',
                    'description': 'Refreshing drinks and beverages'
                },
                {
                    'name': 'Breakfast',
                    'icon': '🥞',
                    'color': '#45B7D1',
                    'description': 'Start your day with these breakfast recipes'
                },
                {
                    'name': 'Snacks',
                    'icon': '🍿',
                    'color': '#96CEB4',
                    'description': 'Quick and easy snack recipes'
                },
                {
                    'name': 'Indonesian Cuisine',
                    'icon': '🇮🇩',
                    'color': '#E74C3C',
                    'description': 'Authentic Indonesian recipes'
                },
                {
                    'name': 'Healthy',
                    'icon': '🥬',
                    'color': '#27AE60',
                    'description': 'Nutritious and healthy meal options'
                }
            ]
            
            for cat_data in categories_data:
                category = Category(
                    name=cat_data['name'],
                    slug=Category.create_slug(cat_data['name']),
                    icon=cat_data['icon'],
                    color=cat_data['color'],
                    description=cat_data['description']
                )
                db.session.add(category)
            
            # Create common ingredients
            ingredients_data = [
                # Spices & Seasonings
                {'name': 'Salt', 'unit': 'tsp', 'category': 'seasoning'},
                {'name': 'Black Pepper', 'unit': 'tsp', 'category': 'seasoning'},
                {'name': 'Garlic', 'unit': 'clove', 'category': 'vegetable'},
                {'name': 'Onion', 'unit': 'piece', 'category': 'vegetable'},
                {'name': 'Ginger', 'unit': 'gram', 'category': 'spice'},
                {'name': 'Chili', 'unit': 'piece', 'category': 'spice'},
                
                # Basic Ingredients
                {'name': 'Rice', 'unit': 'cup', 'category': 'grain'},
                {'name': 'Flour', 'unit': 'cup', 'category': 'grain'},
                {'name': 'Sugar', 'unit': 'tbsp', 'category': 'sweetener'},
                {'name': 'Cooking Oil', 'unit': 'ml', 'category': 'oil'},
                {'name': 'Butter', 'unit': 'gram', 'category': 'dairy'},
                {'name': 'Eggs', 'unit': 'piece', 'category': 'protein'},
                
                # Proteins
                {'name': 'Chicken Breast', 'unit': 'gram', 'category': 'protein'},
                {'name': 'Beef', 'unit': 'gram', 'category': 'protein'},
                {'name': 'Fish', 'unit': 'gram', 'category': 'protein'},
                {'name': 'Tofu', 'unit': 'piece', 'category': 'protein'},
                
                # Vegetables
                {'name': 'Tomato', 'unit': 'piece', 'category': 'vegetable'},
                {'name': 'Carrot', 'unit': 'piece', 'category': 'vegetable'},
                {'name': 'Potato', 'unit': 'piece', 'category': 'vegetable'},
                {'name': 'Cabbage', 'unit': 'gram', 'category': 'vegetable'},
                {'name': 'Bean Sprouts', 'unit': 'gram', 'category': 'vegetable'},
                
                # Indonesian Spices
                {'name': 'Shallot', 'unit': 'piece', 'category': 'spice'},
                {'name': 'Candlenut', 'unit': 'piece', 'category': 'spice'},
                {'name': 'Galangal', 'unit': 'gram', 'category': 'spice'},
                {'name': 'Lemongrass', 'unit': 'stalk', 'category': 'spice'},
                {'name': 'Kaffir Lime Leaves', 'unit': 'piece', 'category': 'spice'},
                {'name': 'Tamarind', 'unit': 'gram', 'category': 'spice'},
                {'name': 'Palm Sugar', 'unit': 'gram', 'category': 'sweetener'},
                {'name': 'Coconut Milk', 'unit': 'ml', 'category': 'liquid'},
                {'name': 'Soy Sauce', 'unit': 'tbsp', 'category': 'seasoning'},
                {'name': 'Sweet Soy Sauce', 'unit': 'tbsp', 'category': 'seasoning'},
            ]
            
            for ing_data in ingredients_data:
                ingredient = Ingredient(
                    name=ing_data['name'],
                    unit=ing_data['unit'],
                    category=ing_data['category']
                )
                db.session.add(ingredient)
            
            # Commit all data
            db.session.commit()
            
            print("✅ Database setup completed successfully!")
            print(f"📊 Created:")
            print(f"   - {User.query.count()} users")
            print(f"   - {Category.query.count()} categories")
            print(f"   - {Ingredient.query.count()} ingredients")
            print("\n🔐 Test accounts created:")
            print("   Admin: admin@cookeasy.com / admin123")
            print("   Chef: chef@cookeasy.com / chef123")
            print("   User: nowriafisda@cookeasy.com / nowria123")
            print(f"\n🚀 Backend ready at: http://localhost:5000")
            print(f"👤 Setup completed by: nowriafisda")
            print(f"📅 Setup time: 2025-06-21 07:21:28 UTC")
            
        except Exception as e:
            print(f"❌ Database setup failed: {str(e)}")
            db.session.rollback()
            raise e

if __name__ == '__main__':
    setup_database()