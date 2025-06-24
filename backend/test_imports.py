"""
Test script to verify all models can be imported correctly
"""

def test_model_imports():
    print("🧪 Testing model imports...")
    
    try:
        from app.models import User
        print("✅ User model imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import User: {e}")
        return False
    
    try:
        from app.models import Recipe, Bookmark
        print("✅ Recipe and Bookmark models imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import Recipe/Bookmark: {e}")
        return False
    
    try:
        from app.models import Ingredient, RecipeIngredient
        print("✅ Ingredient and RecipeIngredient models imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import Ingredient/RecipeIngredient: {e}")
        return False
    
    try:
        from app.models import Category
        print("✅ Category model imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import Category: {e}")
        return False
    
    try:
        from app.models import Rating, RatingHelpful
        print("✅ Rating and RatingHelpful models imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import Rating/RatingHelpful: {e}")
        return False
    
    print("🎉 All models imported successfully!")
    return True

def test_app_creation():
    print("\n🧪 Testing app creation...")
    
    try:
        from app import create_app, db
        app = create_app()
        print("✅ App created successfully")
        
        with app.app_context():
            # Test database connection
            db.create_all()
            print("✅ Database tables created successfully")
            
    except Exception as e:
        print(f"❌ Failed to create app or database: {e}")
        return False
    
    print("🎉 App creation test passed!")
    return True

if __name__ == '__main__':
    print("=" * 50)
    print("🔍 CookEasy Backend Import Test")
    print(f"📅 Test started at: 2025-06-21 07:12:38 UTC")
    print(f"👤 Test run by: nowriafisda")
    print("=" * 50)
    
    success = test_model_imports()
    if success:
        success = test_app_creation()
    
    if success:
        print("\n🚀 All tests passed! Backend is ready to run.")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")