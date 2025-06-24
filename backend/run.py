from app import create_app, db

# Import models dari lokasi yang benar
from app.models import User, Recipe, Ingredient, Category, Rating

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # Create database tables if they don't exist
        try:
            db.create_all()
            print("✅ Database tables created/verified successfully!")
        except Exception as e:
            print(f"❌ Database error: {e}")
    
    print("🚀 Starting CookEasy Backend Server...")
    print(f"📅 Server started at: 2025-06-21 07:12:38 UTC")
    print(f"👤 Started by: nowriafisda")
    print("🌐 Server running on: http://localhost:5000")
    print("📖 API Documentation: http://localhost:5000/api")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)