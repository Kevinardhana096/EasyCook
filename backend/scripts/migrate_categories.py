import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from sqlalchemy import text

def migrate_categories():
    app = create_app('development')
    
    with app.app_context():
        # Add new columns to categories table
        try:
            # Add image_url column
            with db.engine.connect() as conn:
                conn.execute(text('ALTER TABLE categories ADD COLUMN image_url VARCHAR(500);'))
                conn.commit()
            print("Added image_url column to categories table")
        except Exception as e:
            print(f"image_url column might already exist: {e}")
        
        try:
            # Add is_featured column
            with db.engine.connect() as conn:
                conn.execute(text('ALTER TABLE categories ADD COLUMN is_featured BOOLEAN DEFAULT 0;'))
                conn.commit()
            print("Added is_featured column to categories table")
        except Exception as e:
            print(f"is_featured column might already exist: {e}")
        
        # Update categories with image URLs and featured status
        updates = [
            ("UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', is_featured = 1 WHERE slug = 'hidangan-utama'"),
            ("UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1541795795328-f073b763494e?w=400&h=300&fit=crop', is_featured = 0 WHERE slug = 'pembuka'"),
            ("UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', is_featured = 1 WHERE slug = 'penutup'"),
            ("UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop', is_featured = 0 WHERE slug = 'minuman'"),
            ("UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop', is_featured = 0 WHERE slug = 'camilan'"),
            ("UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop', is_featured = 1 WHERE slug = 'tradisional'")
        ]
        
        with db.engine.connect() as conn:
            for update_sql in updates:
                try:
                    conn.execute(text(update_sql))
                    print(f"Updated category data")
                except Exception as e:
                    print(f"Error updating: {e}")
            conn.commit()
        
        # Show final result
        with db.engine.connect() as conn:
            result = conn.execute(text("SELECT name, slug, image_url, is_featured FROM categories"))
            print("\nFinal categories:")
            for row in result:
                featured = "⭐ Featured" if row[3] else ""
                image = "✓ Has image" if row[2] else "✗ No image"
                print(f"- {row[0]} ({row[1]}) {image} {featured}")

if __name__ == '__main__':
    migrate_categories()
