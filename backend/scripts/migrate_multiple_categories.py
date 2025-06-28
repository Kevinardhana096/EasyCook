import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.recipe import Recipe
from app.models.category import Category
from sqlalchemy import text

def migrate_to_multiple_categories():
    app = create_app('development')
    
    with app.app_context():
        # Create recipe_categories table
        try:
            with db.engine.connect() as conn:
                conn.execute(text('''
                    CREATE TABLE IF NOT EXISTS recipe_categories (
                        recipe_id INTEGER NOT NULL,
                        category_id INTEGER NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (recipe_id, category_id),
                        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
                        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
                    )
                '''))
                conn.commit()
            print("✅ Created recipe_categories table")
        except Exception as e:
            print(f"❌ Error creating recipe_categories table: {e}")
            return
        
        # Migrate existing single category relationships to many-to-many
        try:
            with db.engine.connect() as conn:
                # Get all recipes with category_id
                result = conn.execute(text('''
                    SELECT id, category_id FROM recipes 
                    WHERE category_id IS NOT NULL
                '''))
                
                migrated_count = 0
                for row in result:
                    recipe_id, category_id = row[0], row[1]
                    
                    # Check if relationship already exists
                    existing = conn.execute(text('''
                        SELECT 1 FROM recipe_categories 
                        WHERE recipe_id = :recipe_id AND category_id = :category_id
                    '''), {'recipe_id': recipe_id, 'category_id': category_id}).fetchone()
                    
                    if not existing:
                        # Insert into recipe_categories table
                        conn.execute(text('''
                            INSERT INTO recipe_categories (recipe_id, category_id)
                            VALUES (:recipe_id, :category_id)
                        '''), {'recipe_id': recipe_id, 'category_id': category_id})
                        migrated_count += 1
                
                conn.commit()
                print(f"✅ Migrated {migrated_count} recipe-category relationships")
        except Exception as e:
            print(f"❌ Error migrating data: {e}")
            return
        
        # Add some example multiple categories for demonstration
        try:
            with db.engine.connect() as conn:
                # Get category IDs
                hidangan_utama = conn.execute(text("SELECT id FROM categories WHERE slug = 'hidangan-utama'")).fetchone()
                tradisional = conn.execute(text("SELECT id FROM categories WHERE slug = 'tradisional'")).fetchone()
                pembuka = conn.execute(text("SELECT id FROM categories WHERE slug = 'pembuka'")).fetchone()
                
                if hidangan_utama and tradisional:
                    # Find some recipes to add multiple categories
                    recipes = conn.execute(text('''
                        SELECT id, title FROM recipes 
                        WHERE title LIKE '%Nasi Goreng%' OR title LIKE '%Rendang%' OR title LIKE '%Sate%'
                        LIMIT 3
                    ''')).fetchall()
                    
                    added_count = 0
                    for recipe in recipes:
                        recipe_id = recipe[0]
                        recipe_title = recipe[1]
                        
                        # Add "Tradisional" category to traditional Indonesian dishes
                        if any(word in recipe_title.lower() for word in ['rendang', 'sate', 'nasi goreng']):
                            existing = conn.execute(text('''
                                SELECT 1 FROM recipe_categories 
                                WHERE recipe_id = :recipe_id AND category_id = :category_id
                            '''), {'recipe_id': recipe_id, 'category_id': tradisional[0]}).fetchone()
                            
                            if not existing:
                                conn.execute(text('''
                                    INSERT INTO recipe_categories (recipe_id, category_id)
                                    VALUES (:recipe_id, :category_id)
                                '''), {'recipe_id': recipe_id, 'category_id': tradisional[0]})
                                added_count += 1
                                print(f"   Added 'Tradisional' category to '{recipe_title}'")
                    
                    conn.commit()
                    print(f"✅ Added {added_count} additional category relationships")
        except Exception as e:
            print(f"⚠️  Warning adding example categories: {e}")
        
        # Show final statistics
        try:
            with db.engine.connect() as conn:
                total_relationships = conn.execute(text("SELECT COUNT(*) FROM recipe_categories")).fetchone()[0]
                recipes_with_multiple = conn.execute(text('''
                    SELECT COUNT(DISTINCT recipe_id) FROM recipe_categories 
                    WHERE recipe_id IN (
                        SELECT recipe_id FROM recipe_categories 
                        GROUP BY recipe_id HAVING COUNT(*) > 1
                    )
                ''')).fetchone()[0]
                
                print(f"\n📊 Final Statistics:")
                print(f"   Total recipe-category relationships: {total_relationships}")
                print(f"   Recipes with multiple categories: {recipes_with_multiple}")
                
                # Show some examples
                examples = conn.execute(text('''
                    SELECT r.title, GROUP_CONCAT(c.name) as categories
                    FROM recipes r
                    JOIN recipe_categories rc ON r.id = rc.recipe_id
                    JOIN categories c ON rc.category_id = c.id
                    GROUP BY r.id, r.title
                    HAVING COUNT(c.id) > 1
                    LIMIT 3
                ''')).fetchall()
                
                if examples:
                    print(f"\n🍳 Examples of recipes with multiple categories:")
                    for example in examples:
                        print(f"   '{example[0]}' → {example[1]}")
        except Exception as e:
            print(f"❌ Error showing statistics: {e}")

if __name__ == '__main__':
    migrate_to_multiple_categories()
