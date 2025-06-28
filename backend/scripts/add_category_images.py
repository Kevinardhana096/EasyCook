import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import Category

def add_category_images():
    app = create_app('development')
    
    with app.app_context():
        # Add image URLs and featured status to categories
        category_updates = {
            'hidangan-utama': {
                'image_url': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
                'is_featured': True
            },
            'pembuka': {
                'image_url': 'https://images.unsplash.com/photo-1541795795328-f073b763494e?w=400&h=300&fit=crop',
                'is_featured': False
            },
            'penutup': {
                'image_url': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
                'is_featured': True
            },
            'minuman': {
                'image_url': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
                'is_featured': False
            },
            'camilan': {
                'image_url': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop',
                'is_featured': False
            },
            'tradisional': {
                'image_url': 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop',
                'is_featured': True
            }
        }
        
        for slug, updates in category_updates.items():
            category = Category.query.filter_by(slug=slug).first()
            if category:
                print(f"Updating category: {category.name}")
                # Check if image_url column exists, if not it will be added automatically by SQLAlchemy migration
                try:
                    category.image_url = updates['image_url']
                    category.is_featured = updates['is_featured']
                except Exception as e:
                    print(f"Error updating {category.name}: {e}")
                    # Column might not exist yet, skip for now
                    continue
        
        try:
            db.session.commit()
            print("Categories updated with images successfully!")
        except Exception as e:
            print(f"Error committing changes: {e}")
            db.session.rollback()
        
        # Show updated categories
        categories = Category.query.all()
        print(f"\nCategories with images:")
        for cat in categories:
            image_status = "✓ Has image" if hasattr(cat, 'image_url') and cat.image_url else "✗ No image"
            featured_status = "⭐ Featured" if hasattr(cat, 'is_featured') and cat.is_featured else ""
            print(f"- {cat.name} ({cat.slug}) {image_status} {featured_status}")

if __name__ == '__main__':
    add_category_images()
