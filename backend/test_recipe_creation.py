#!/usr/bin/env python3
"""
Script to test creating a recipe with ingredients
"""

import requests
import json

# Test data
recipe_data = {
    "title": "Test Recipe with Ingredients",
    "description": "A test recipe to verify ingredients are saved properly",
    "instructions": "1. Mix ingredients\n2. Cook for 30 minutes\n3. Serve hot",
    "prep_time": 15,
    "cook_time": 30,
    "servings": 4,
    "difficulty": "Easy",
    "category_id": 1,
    "ingredients": [
        {
            "name": "Rice",
            "quantity": "2",
            "unit": "cup",
            "notes": "Basmati rice preferred"
        },
        {
            "name": "Salt",
            "quantity": "1",
            "unit": "teaspoon", 
            "notes": ""
        },
        {
            "name": "Water",
            "quantity": "4",
            "unit": "cup",
            "notes": "filtered water"
        }
    ],
    "nutrition": {
        "calories_per_serving": 250,
        "protein": 5,
        "carbs": 50,
        "fat": 2,
        "fiber": 1
    }
}

def test_create_recipe():
    """Test creating recipe with ingredients"""
    url = "http://localhost:5000/api/recipes/"
    
    # This would need a valid JWT token in real scenario
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
    }
    
    try:
        response = requests.post(url, json=recipe_data, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 201:
            print("✅ Recipe created successfully!")
            recipe_id = response.json().get('recipe', {}).get('id')
            if recipe_id:
                # Test getting the recipe back
                get_response = requests.get(f"http://localhost:5000/api/recipes/{recipe_id}")
                if get_response.status_code == 200:
                    recipe = get_response.json().get('recipe', {})
                    print(f"✅ Recipe retrieved successfully!")
                    print(f"📝 Ingredients count: {len(recipe.get('ingredients', []))}")
                    print(f"🍽️ Nutrition data: {recipe.get('nutrition', {})}")
                else:
                    print(f"❌ Failed to retrieve recipe: {get_response.json()}")
        else:
            print(f"❌ Failed to create recipe: {response.json()}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    print("🧪 Testing recipe creation with ingredients...")
    test_create_recipe()
