"""
Simple database creation script that works on Windows
"""
import os
import sqlite3
from app import create_app, db
from app.models import User, Category, Ingredient

def create_database_manually():
    """Create database manually using sqlite3"""
    
    # Create in current directory
    db_path = os.path.join(os.getcwd(), 'cookeasy.db')
    
    print(f"🗂️  Database will be created at: {db_path}")
    
    # Remove existing database
    if os.path.exists(db_path):
        os.remove(db_path)
        print("🗑️  Removed existing database")
    
    try:
        # Create database file manually
        conn = sqlite3.connect(db_path)
        conn.close()
        print("✅ Database file created successfully")
        
        # Now use Flask-SQLAlchemy to create tables
        app = create_app()
        
        # Manually set the database URI to our created file
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
        
        with app.app_context():
            print("🏗️  Creating tables with Flask-SQLAlchemy...")
            db.create_all()
            
            # Verify tables were created
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"✅ Created tables: {tables}")
            
            if not tables:
                print("❌ No tables created!")
                return False
            
            print("🌱 Adding initial data...")
            
            # Add users
            users_data = [
                ('admin', 'admin@cookeasy.com', 'admin123', 'admin'),
                ('chef_budi', 'chef@cookeasy.com', 'chef123', 'chef'),
                ('nowriafisda', 'nowriafisda@cookeasy.com', 'nowria123', 'user')
            ]
            
            for username, email, password, role in users_data:
                user = User(
                    username=username,
                    email=email,
                    full_name=username.replace('_', ' ').title(),
                    role=role,
                    bio=f'{role.title()} of CookEasy',
                    is_active=True,
                    is_verified=True
                )
                user.set_password(password)
                db.session.add(user)
                print(f"   ✅ Added user: {username}")
            
            # Add categories
            categories_data = [
                ('Main Dishes', '🍽️', '#FF6B35'),
                ('Appetizers', '🥗', '#2EC4B6'),
                ('Desserts', '🍰', '#FFE66D'),
                ('Beverages', '🥤', '#4ECDC4'),
                ('Breakfast', '🥞', '#45B7D1'),
                ('Snacks', '🍿', '#96CEB4')
            ]
            
            for name, icon, color in categories_data:
                category = Category(
                    name=name,
                    slug=name.lower().replace(' ', '-'),
                    icon=icon,
                    color=color,
                    description=f"Delicious {name.lower()} recipes",
                    is_active=True
                )
                db.session.add(category)
                print(f"   ✅ Added category: {name}")
            
            # Add basic ingredients
            ingredients_data = [
                ('Salt', 'tsp', 'seasoning'),
                ('Pepper', 'tsp', 'seasoning'),
                ('Garlic', 'clove', 'vegetable'),
                ('Onion', 'piece', 'vegetable'),
                ('Rice', 'cup', 'grain'),
                ('Oil', 'ml', 'oil')
            ]
            
            for name, unit, category in ingredients_data:
                ingredient = Ingredient(
                    name=name,
                    unit=unit,
                    category=category
                )
                db.session.add(ingredient)
                print(f"   ✅ Added ingredient: {name}")
            
            # Commit all data
            db.session.commit()
            
            # Verify data was inserted
            user_count = User.query.count()
            category_count = Category.query.count()
            ingredient_count = Ingredient.query.count()
            
            print(f"\n✅ Database setup completed successfully!")
            print(f"📊 Data created:")
            print(f"   - Users: {user_count}")
            print(f"   - Categories: {category_count}")
            print(f"   - Ingredients: {ingredient_count}")
            
            print(f"\n🔐 Test accounts:")
            print(f"   Admin: admin@cookeasy.com / admin123")
            print(f"   Chef: chef@cookeasy.com / chef123")
            print(f"   User: nowriafisda@cookeasy.com / nowria123")
            
            print(f"\n🗂️  Database location: {db_path}")
            print(f"📅 Created: 2025-06-21 07:34:36 UTC")
            print(f"👤 Created by: nowriafisda")
            
            return True
            
    except Exception as e:
        print(f"❌ Error creating database: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("🔥 CookEasy Database Setup (Windows Compatible)")
    print("=" * 60)
    success = create_database_manually()
    if success:
        print("\n🚀 Database ready! You can now run: python run.py")
    else:
        print("\n❌ Database setup failed!")