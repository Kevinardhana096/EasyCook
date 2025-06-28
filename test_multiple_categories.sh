#!/bin/bash

# Test script untuk menguji update recipe dengan multiple categories

echo "Testing multiple categories update for recipe..."

# Login sebagai user testchef untuk mendapatkan token
echo "1. Getting auth token..."
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"username": "testchef", "password": "password"}' \
  http://localhost:5000/api/auth/login)

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ]; then
    echo "❌ Failed to login. Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful"

# Update resep dengan multiple categories (ID 6: Hidangan Utama, ID 10: Camilan, ID 11: Tradisional)
echo "2. Updating recipe with multiple categories..."
UPDATE_RESPONSE=$(curl -s -X PUT -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Nasi Goreng Special by TestChef - Updated",
    "description": "Nasi goreng spesial dengan bumbu rahasia yang lezat dan menggugah selera - Updated with multiple categories",
    "category_ids": [6, 10, 11],
    "difficulty": "Medium",
    "prep_time": 15,
    "cook_time": 20,
    "servings": 4
  }' \
  http://localhost:5000/api/recipes/8)

echo "Update response: $UPDATE_RESPONSE"

# Verifikasi hasil update
echo "3. Verifying updated recipe..."
VERIFY_RESPONSE=$(curl -s -H "Content-Type: application/json" \
  http://localhost:5000/api/recipes/8)

echo "Updated recipe categories:"
echo $VERIFY_RESPONSE | jq '.recipe.categories'

echo "✅ Test completed!"
