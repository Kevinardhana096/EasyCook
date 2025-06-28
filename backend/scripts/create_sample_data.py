import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import Category, Recipe, User, Ingredient, Rating
from datetime import datetime
from werkzeug.security import generate_password_hash

def create_sample_data():
    app = create_app('development')
    
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
        
        # Create categories (konsisten bahasa Indonesia)
        categories_data = [
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
        
        # Add categories
        for cat_data in categories_data:
            existing_cat = Category.query.filter_by(slug=cat_data['slug']).first()
            if not existing_cat:
                category = Category(**cat_data)
                db.session.add(category)
        
        db.session.commit()
        
        # Create sample user
        sample_user = User.query.filter_by(email='chef@cookeasy.com').first()
        if not sample_user:
            sample_user = User(
                name='Chef Sample',
                email='chef@cookeasy.com',
                password_hash=generate_password_hash('password123'),
                role='chef',
                is_verified=True,
                is_active=True
            )
            db.session.add(sample_user)
            db.session.commit()
        
        # Create sample ingredients
        ingredients_data = [
            {'name': 'Beras', 'unit': 'cup', 'category': 'grains'},
            {'name': 'Ayam', 'unit': 'gram', 'category': 'protein'},
            {'name': 'Bawang Merah', 'unit': 'siung', 'category': 'spice'},
            {'name': 'Bawang Putih', 'unit': 'siung', 'category': 'spice'},
            {'name': 'Kecap Manis', 'unit': 'sendok makan', 'category': 'sauce'},
            {'name': 'Garam', 'unit': 'sendok teh', 'category': 'spice'},
            {'name': 'Minyak Goreng', 'unit': 'sendok makan', 'category': 'oil'},
        ]
        
        for ing_data in ingredients_data:
            existing_ing = Ingredient.query.filter_by(name=ing_data['name']).first()
            if not existing_ing:
                ingredient = Ingredient(**ing_data, is_active=True)
                db.session.add(ingredient)
        
        db.session.commit()
        
        # Create sample recipes
        hidangan_utama_cat = Category.query.filter_by(slug='hidangan-utama').first()
        penutup_cat = Category.query.filter_by(slug='penutup').first()
        pembuka_cat = Category.query.filter_by(slug='pembuka').first()
        
        recipes_data = [
            {
                'title': 'Nasi Goreng Spesial',
                'slug': 'nasi-goreng-spesial',
                'description': 'Nasi goreng dengan bumbu rahasia yang menggugah selera',
                'instructions': 'Panaskan minyak, tumis bumbu, masukkan nasi, aduk rata.',
                'prep_time': 15,
                'cook_time': 20,
                'total_time': 35,
                'servings': 4,
                'difficulty': 'Easy',
                'image_url': 'https://picsum.photos/400/300?random=1',
                'is_published': True,
                'is_featured': True,
                'user_id': sample_user.id,
                'category_id': hidangan_utama_cat.id if hidangan_utama_cat else 1,
                'view_count': 245
            },
            {
                'title': 'Rendang Daging Sapi',
                'slug': 'rendang-daging-sapi', 
                'description': 'Rendang autentik dengan rempah-rempah pilihan',
                'instructions': 'Rebus daging dengan bumbu halus hingga empuk dan bumbu meresap.',
                'prep_time': 30,
                'cook_time': 180,
                'total_time': 210,
                'servings': 6,
                'difficulty': 'Hard',
                'image_url': 'https://picsum.photos/400/300?random=2',
                'is_published': True,
                'is_featured': True,
                'user_id': sample_user.id,
                'category_id': hidangan_utama_cat.id if hidangan_utama_cat else 1,
                'view_count': 389
            },
            {
                'title': 'Gado-Gado Jakarta',
                'slug': 'gado-gado-jakarta',
                'description': 'Salad sayuran segar dengan bumbu kacang yang nikmat',
                'instructions': 'Rebus sayuran, buat bumbu kacang, campur dan sajikan.',
                'prep_time': 20,
                'cook_time': 15,
                'total_time': 35,
                'servings': 4,
                'difficulty': 'Medium',
                'image_url': 'https://picsum.photos/400/300?random=3',
                'is_published': True,
                'is_featured': True,
                'user_id': sample_user.id,
                'category_id': pembuka_cat.id if pembuka_cat else 2,
                'view_count': 156
            },
            {
                'title': 'Es Cendol',
                'slug': 'es-cendol',
                'description': 'Minuman tradisional yang menyegarkan',
                'instructions': 'Buat cendol, siapkan santan dan gula merah, sajikan dengan es.',
                'prep_time': 30,
                'cook_time': 20,
                'total_time': 50,
                'servings': 4,
                'difficulty': 'Medium',
                'image_url': 'https://picsum.photos/400/300?random=4',
                'is_published': True,
                'is_featured': False,
                'user_id': sample_user.id,
                'category_id': penutup_cat.id if penutup_cat else 3,
                'view_count': 120
            },
            {
                'title': 'Ayam Bakar Taliwang',
                'slug': 'ayam-bakar-taliwang',
                'description': 'Ayam bakar pedas khas Lombok yang menggugah selera',
                'instructions': 'Marinasi ayam dengan bumbu, bakar hingga matang dan berkulit keemasan.',
                'prep_time': 45,
                'cook_time': 30,
                'total_time': 75,
                'servings': 4,
                'difficulty': 'Medium',
                'image_url': 'https://picsum.photos/400/300?random=5',
                'is_published': True,
                'is_featured': True,
                'user_id': sample_user.id,
                'category_id': hidangan_utama_cat.id if hidangan_utama_cat else 1,
                'view_count': 298
            },
            {
                'title': 'Sate Ayam Madura',
                'slug': 'sate-ayam-madura',
                'description': 'Sate ayam dengan bumbu kacang khas Madura yang autentik',
                'instructions': 'Potong ayam, tusuk, bakar sambil olesi bumbu, sajikan dengan bumbu kacang.',
                'prep_time': 60,
                'cook_time': 20,
                'total_time': 80,
                'servings': 6,
                'difficulty': 'Medium',
                'image_url': 'https://picsum.photos/400/300?random=6',
                'is_published': True,
                'is_featured': True,
                'user_id': sample_user.id,
                'category_id': hidangan_utama_cat.id if hidangan_utama_cat else 1,
                'view_count': 425
            }
        ]
        
        for recipe_data in recipes_data:
            existing_recipe = Recipe.query.filter_by(slug=recipe_data['slug']).first()
            if not existing_recipe:
                recipe = Recipe(**recipe_data)
                db.session.add(recipe)
        
        db.session.commit()
        
        # Add sample ratings
        recipes = Recipe.query.all()
        for recipe in recipes:
            existing_rating = Rating.query.filter_by(user_id=sample_user.id, recipe_id=recipe.id).first()
            if not existing_rating:
                rating = Rating(
                    user_id=sample_user.id,
                    recipe_id=recipe.id,
                    rating=5,
                    review='Resep yang sangat lezat!',
                    is_verified=True
                )
                db.session.add(rating)
        
        db.session.commit()
        print("Sample data created successfully!")

if __name__ == '__main__':
    create_sample_data()
