# CookEasy API Testing Guide

## 🚀 **Quick Start**

1. **Start Backend Server:**
   ```bash
   cd backend
   python run.py
   ```

2. **Database will be created automatically at:** `backend/cookeasy.db`

3. **Base URL:** `http://localhost:5000/api`

---

## 👥 **Default Users for Testing**

| Role  | Email              | Password | Username   |
|-------|-------------------|----------|------------|
| Admin | admin@cookeasy.com | admin123 | admin      |
| Chef  | chef@cookeasy.com  | chef123  | chef_budi  |
| User  | sari@example.com   | sari123  | user_sari  |

---

## 🔐 **Authentication Endpoints**

### 1. **Register New User**
- **URL:** `POST /api/auth/register`
- **Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "full_name": "New User"
}
```

### 2. **Login**
- **URL:** `POST /api/auth/login`
- **Body:**
```json
{
  "email": "chef@cookeasy.com",
  "password": "chef123"
}
```
**Response:** Save the `access_token` for authenticated requests.

### 3. **Get Profile**
- **URL:** `GET /api/auth/profile`
- **Headers:** `Authorization: Bearer <access_token>`

### 4. **Update Profile**
- **URL:** `PUT /api/auth/profile`
- **Headers:** `Authorization: Bearer <access_token>`
- **Body:**
```json
{
  "full_name": "Updated Name",
  "bio": "Updated bio"
}
```

### 5. **Change Password**
- **URL:** `POST /api/auth/change-password`
- **Headers:** `Authorization: Bearer <access_token>`
- **Body:**
```json
{
  "current_password": "chef123",
  "new_password": "newpassword123"
}
```

---

## 🍽️ **Recipe Endpoints**

### 1. **Get All Recipes**
- **URL:** `GET /api/recipes/`

### 2. **Get Recipe by ID**
- **URL:** `GET /api/recipes/1`

### 3. **Create Recipe** (Chef/Admin only)
- **URL:** `POST /api/recipes/`
- **Headers:** `Authorization: Bearer <chef_or_admin_token>`
- **Body:**
```json
{
  "title": "New Recipe",
  "description": "Delicious new recipe",
  "instructions": "1. Step one\n2. Step two\n3. Step three",
  "prep_time": 15,
  "cook_time": 20,
  "servings": 4,
  "difficulty": "Medium",
  "category_id": 1,
  "is_published": true
}
```

### 4. **Update Recipe** (Owner/Admin only)
- **URL:** `PUT /api/recipes/1`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same as create recipe

### 5. **Delete Recipe** (Owner/Admin only)
- **URL:** `DELETE /api/recipes/1`
- **Headers:** `Authorization: Bearer <token>`

### 6. **Search Recipes**
- **URL:** `GET /api/recipes/search?q=nasi&category_id=1&difficulty=Easy`

### 7. **Get User's Recipes**
- **URL:** `GET /api/recipes/user/2`

---

## ⭐ **Rating Endpoints**

### 1. **Get Recipe Ratings**
- **URL:** `GET /api/recipes/1/ratings`

### 2. **Rate Recipe**
- **URL:** `POST /api/recipes/1/ratings`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "rating": 5,
  "review": "Amazing recipe! Easy to follow.",
  "is_verified": true
}
```

---

## 📂 **Category Endpoints**

### 1. **Get All Categories**
- **URL:** `GET /api/recipes/categories`

---

## 👤 **Admin User Management** (Admin only)

### 1. **Get All Users**
- **URL:** `GET /api/auth/users`
- **Headers:** `Authorization: Bearer <admin_token>`

### 2. **Update User Role**
- **URL:** `PATCH /api/auth/users/3/role`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
```json
{
  "role": "chef"
}
```

### 3. **Activate/Deactivate User**
- **URL:** `PATCH /api/auth/users/3/status`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
```json
{
  "is_active": false
}
```

### 4. **Verify User**
- **URL:** `PATCH /api/auth/users/3/verify`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
```json
{
  "is_verified": true
}
```

---

## 🔍 **Testing Scenarios**

### **Basic User Flow:**
1. Register new user
2. Login to get token
3. View recipes
4. Rate a recipe
5. Update profile

### **Chef Flow:**
1. Login as chef
2. Create new recipe
3. Update own recipe
4. View own recipes

### **Admin Flow:**
1. Login as admin
2. View all users
3. Change user roles
4. Manage any recipe
5. Verify users

---

## 📊 **Database Tables Created**

1. **users** - User accounts and roles
2. **recipes** - Recipe data
3. **categories** - Recipe categories
4. **ratings** - Recipe ratings and reviews
5. **ingredients** - Ingredient master data
6. **recipe_ingredients** - Recipe-ingredient relationships (junction table)
7. **rating_helpful** - Rating helpfulness votes

---

## ✅ **Validation Checklist**

- [x] **Modular Programming** - Organized folder structure
- [x] **HTTP Methods** - GET, POST, PUT, DELETE implemented
- [x] **JWT Authentication** - Token-based auth with roles
- [x] **4+ Database Tables** - 7 tables created
- [x] **2+ User Roles** - user, chef, admin with different permissions
