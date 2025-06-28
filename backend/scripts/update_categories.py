import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import Category

def update_categories():
    app = create_app('development')
    
    with app.app_context():
        # Update existing categories to use consistent Indonesian slugs
        category_updates = [
            {'old_slug': 'main-course', 'new_slug': 'hidangan-utama', 'name': 'Hidangan Utama'},
            {'old_slug': 'appetizer', 'new_slug': 'pembuka', 'name': 'Pembuka'},
            {'old_slug': 'dessert', 'new_slug': 'penutup', 'name': 'Penutup'},
            {'old_slug': 'beverage', 'new_slug': 'minuman', 'name': 'Minuman'},
            {'old_slug': 'snack', 'new_slug': 'camilan', 'name': 'Camilan'},
            {'old_slug': 'traditional', 'new_slug': 'tradisional', 'name': 'Tradisional'},
        ]
        
        for update in category_updates:
            # Find category by old slug
            category = Category.query.filter_by(slug=update['old_slug']).first()
            if category:
                print(f"Updating category: {category.name} -> {update['name']}")
                category.slug = update['new_slug']
                category.name = update['name']
                
        # Remove duplicate or unwanted categories
        unwanted_categories = ['vegetarian', 'Makanan Tradisional']
        for unwanted in unwanted_categories:
            category = Category.query.filter_by(name=unwanted).first()
            if category:
                print(f"Removing category: {category.name}")
                db.session.delete(category)
        
        # Add new categories if they don't exist
        new_categories = [
            {
                'name': 'Hidangan Utama',
                'slug': 'hidangan-utama',
                'description': 'Makanan pokok untuk makan siang dan malam',
                'icon': '🍽️',
                'color': '#f97316',
                'is_active': True
            },
            {
                'name': 'Pembuka',
                'slug': 'pembuka', 
                'description': 'Makanan ringan untuk membuka selera',
                'icon': '🥗',
                'color': '#eab308',
                'is_active': True
            },
            {
                'name': 'Penutup',
                'slug': 'penutup',
                'description': 'Makanan manis untuk menutup hidangan',
                'icon': '🍰',
                'color': '#ec4899',
                'is_active': True
            },
            {
                'name': 'Minuman',
                'slug': 'minuman',
                'description': 'Minuman segar dan hangat',
                'icon': '🥤',
                'color': '#3b82f6',
                'is_active': True
            },
            {
                'name': 'Camilan',
                'slug': 'camilan',
                'description': 'Makanan ringan untuk menemani waktu santai',
                'icon': '🍿',
                'color': '#22c55e',
                'is_active': True
            },
            {
                'name': 'Tradisional',
                'slug': 'tradisional',
                'description': 'Resep masakan tradisional Nusantara',
                'icon': '🍲',
                'color': '#a855f7',
                'is_active': True
            }
        ]
        
        for cat_data in new_categories:
            existing_cat = Category.query.filter_by(slug=cat_data['slug']).first()
            if not existing_cat:
                print(f"Adding new category: {cat_data['name']}")
                category = Category(**cat_data)
                db.session.add(category)
        
        db.session.commit()
        print("Categories updated successfully!")
        
        # Show all categories
        categories = Category.query.all()
        print("\nCurrent categories:")
        for cat in categories:
            print(f"- {cat.name} ({cat.slug})")

if __name__ == '__main__':
    update_categories()
