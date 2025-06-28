import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import Category, Recipe

def clean_categories():
    app = create_app('development')
    
    with app.app_context():
        # Categories to remove (English versions)
        categories_to_remove = [
            'main-dishes',
            'appetizers', 
            'desserts',
            'beverages',
            'indonesian'
        ]
        
        for cat_slug in categories_to_remove:
            category = Category.query.filter_by(slug=cat_slug).first()
            if category:
                print(f"Removing category: {category.name} ({category.slug})")
                
                # Update any recipes that use this category to use the Indonesian equivalent
                mapping = {
                    'main-dishes': 'hidangan-utama',
                    'appetizers': 'pembuka',
                    'desserts': 'penutup', 
                    'beverages': 'minuman',
                    'indonesian': 'tradisional'
                }
                
                new_cat_slug = mapping.get(cat_slug)
                if new_cat_slug:
                    new_category = Category.query.filter_by(slug=new_cat_slug).first()
                    if new_category:
                        # Update recipes to use new category
                        recipes = Recipe.query.filter_by(category_id=category.id).all()
                        for recipe in recipes:
                            recipe.category_id = new_category.id
                            print(f"  Updated recipe '{recipe.title}' to use category '{new_category.name}'")
                
                # Delete the old category
                db.session.delete(category)
        
        db.session.commit()
        print("Categories cleaned successfully!")
        
        # Show remaining categories
        categories = Category.query.all()
        print(f"\nRemaining categories ({len(categories)}):")
        for cat in categories:
            recipe_count = Recipe.query.filter_by(category_id=cat.id).count()
            print(f"- {cat.name} ({cat.slug}) - {recipe_count} recipes")

if __name__ == '__main__':
    clean_categories()
