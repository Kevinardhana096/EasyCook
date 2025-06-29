#!/usr/bin/env python3
"""
Script to add nutrition fields to the recipes table
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app, db
from app.models import Recipe
from sqlalchemy import text

def add_nutrition_fields():
    """Add nutrition fields to recipes table"""
    app = create_app()
    
    with app.app_context():
        try:
            # Check if columns already exist (SQLite specific)
            with db.engine.connect() as conn:
                result = conn.execute(text("PRAGMA table_info(recipes)"))
                columns = [row[1] for row in result.fetchall()]
                
                if 'calories_per_serving' in columns:
                    print("✅ Nutrition fields already exist in recipes table")
                    return
                
                print("📝 Adding nutrition fields to recipes table...")
                
                # Add nutrition columns
                conn.execute(text("ALTER TABLE recipes ADD COLUMN calories_per_serving FLOAT"))
                conn.execute(text("ALTER TABLE recipes ADD COLUMN protein FLOAT"))
                conn.execute(text("ALTER TABLE recipes ADD COLUMN carbs FLOAT"))
                conn.execute(text("ALTER TABLE recipes ADD COLUMN fat FLOAT"))
                conn.execute(text("ALTER TABLE recipes ADD COLUMN fiber FLOAT"))
                
                conn.commit()
                
                print("✅ Successfully added nutrition fields to recipes table")
            
        except Exception as e:
            print(f"❌ Error adding nutrition fields: {str(e)}")
            raise

if __name__ == '__main__':
    add_nutrition_fields()
