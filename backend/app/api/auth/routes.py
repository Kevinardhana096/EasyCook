from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User, Recipe  # Add Recipe import
from app.utils.decorators import admin_required
from sqlalchemy.orm import joinedload  # Add joinedload import
import traceback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print(f"📝 Registration attempt with data: {data}")
        
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Username, email, and password are required'}), 400
        
        # Check if user exists
        existing_email = User.query.filter_by(email=data['email']).first()
        if existing_email:
            print(f"❌ Email {data['email']} already exists")
            return jsonify({'message': 'Email already registered'}), 400
        
        existing_username = User.query.filter_by(username=data['username']).first()
        if existing_username:
            print(f"❌ Username {data['username']} already exists")
            return jsonify({'message': 'Username already taken'}), 400
        
        print(f"✅ Creating new user: {data['username']}")
        
        # Validate role (allow user or chef for public registration)
        role = data.get('role', 'user')
        if role not in ['user', 'chef']:
            return jsonify({'message': 'Invalid role. Must be user or chef'}), 400
        
        # Create user
        user = User(
            username=data['username'],
            email=data['email'],
            full_name=data.get('full_name', data['username']),
            bio=data.get('bio', ''),
            role=role,
            is_active=True
        )
        user.set_password(data['password'])
        
        print(f"🔐 Password set for user {user.username}")
        
        db.session.add(user)
        print(f"📝 User added to session")
        
        db.session.commit()
        print(f"✅ User committed to database with ID: {user.id}")
        
        # Verify user was saved
        saved_user = User.query.get(user.id)
        if saved_user:
            print(f"✅ User verification successful: {saved_user.username}")
        else:
            print(f"❌ User verification failed!")
        
        # Generate token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': f'Welcome to CookEasy, {user.username}! 🎉',
            'access_token': access_token,
            'user': user.to_dict(include_private=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Registration error: {str(e)}")
        print(f"❌ Full traceback: {traceback.format_exc()}")
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'message': 'Account is deactivated'}), 401
        
        # Generate token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': f'Welcome back, {user.username}! 👋',
            'access_token': access_token,
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Reset password directly with email and new password"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('new_password'):
            return jsonify({'message': 'Email and new password are required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            return jsonify({'message': 'Email not found'}), 404
        
        if not user.is_active:
            return jsonify({'message': 'Account is deactivated'}), 401
        
        # Validate new password length
        if len(data['new_password']) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400
        
        # Reset password directly
        user.set_password(data['new_password'])
        db.session.commit()
        
        print(f"✅ Password reset successful for {user.email}")
        
        return jsonify({
            'message': 'Password has been reset successfully. You can now login with your new password.'
        }), 200
        
    except Exception as e:
        print(f"❌ Password reset error: {str(e)}")
        return jsonify({'message': 'Failed to reset password', 'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict(include_private=True)}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get profile', 'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Fields that can be updated by user
        updateable_fields = ['full_name', 'bio', 'profile_image']
        
        for field in updateable_fields:
            if field in data:
                setattr(user, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update profile', 'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'message': 'Current password and new password are required'}), 400
        
        # Verify current password
        if not user.check_password(data['current_password']):
            return jsonify({'message': 'Current password is incorrect'}), 401
        
        # Validate new password
        if len(data['new_password']) < 6:
            return jsonify({'message': 'New password must be at least 6 characters'}), 400
        
        # Update password
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to change password', 'error': str(e)}), 500

# Admin endpoints
@auth_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Get all users - admin only"""
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        
        return jsonify({
            'message': 'Users retrieved successfully',
            'users': [user.to_dict(include_private=True) for user in users],
            'total': len(users)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get users', 'error': str(e)}), 500

@auth_bp.route('/users/<int:user_id>/role', methods=['PATCH'])
@jwt_required()
@admin_required
def update_user_role(user_id):
    """Update user role - admin only"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        new_role = data.get('role')
        if new_role not in ['user', 'chef', 'admin']:
            return jsonify({'message': 'Invalid role. Must be: user, chef, or admin'}), 400
        
        old_role = user.role
        user.role = new_role
        db.session.commit()
        
        return jsonify({
            'message': f'User role updated from {old_role} to {new_role}',
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update user role', 'error': str(e)}), 500

@auth_bp.route('/users/<int:user_id>/status', methods=['PATCH'])
@jwt_required()
@admin_required
def update_user_status(user_id):
    """Activate/deactivate user - admin only"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if 'is_active' not in data:
            return jsonify({'message': 'is_active field is required'}), 400
        
        user.is_active = bool(data['is_active'])
        db.session.commit()
        
        status = 'activated' if user.is_active else 'deactivated'
        return jsonify({
            'message': f'User {status} successfully',
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update user status', 'error': str(e)}), 500

@auth_bp.route('/users/<int:user_id>/verify', methods=['PATCH'])
@jwt_required()
@admin_required
def verify_user(user_id):
    """Verify/unverify user - admin only"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if 'is_verified' not in data:
            return jsonify({'message': 'is_verified field is required'}), 400
        
        user.is_verified = bool(data['is_verified'])
        db.session.commit()
        
        status = 'verified' if user.is_verified else 'unverified'
        return jsonify({
            'message': f'User {status} successfully',
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update user verification', 'error': str(e)}), 500

@auth_bp.route('/register-admin', methods=['POST'])
@jwt_required()
@admin_required
def register_admin():
    """Admin endpoint to register users with specific roles"""
    try:
        data = request.get_json()
        print(f"📝 Admin registration attempt with data: {data}")
        
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Username, email, and password are required'}), 400
        
        # Check if user exists
        existing_email = User.query.filter_by(email=data['email']).first()
        if existing_email:
            return jsonify({'message': 'Email already registered'}), 400
        
        existing_username = User.query.filter_by(username=data['username']).first()
        if existing_username:
            return jsonify({'message': 'Username already taken'}), 400
        
        # Validate role
        role = data.get('role', 'user')
        if role not in ['user', 'chef', 'admin']:
            return jsonify({'message': 'Invalid role. Must be user, chef, or admin'}), 400
        
        # Create user
        user = User(
            username=data['username'],
            email=data['email'],
            full_name=data.get('full_name', data['username']),
            bio=data.get('bio', ''),
            role=role,
            is_active=data.get('is_active', True),
            is_verified=data.get('is_verified', False)
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': f'User created successfully with role: {role}',
            'user': user.to_dict(include_private=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'User creation failed', 'error': str(e)}), 500

@auth_bp.route('/debug/users-count', methods=['GET'])
def debug_users_count():
    """Debug endpoint to check user count in database"""
    try:
        count = User.query.count()
        all_users = User.query.all()
        
        return jsonify({
            'total_users': count,
            'users': [
                {
                    'id': u.id,
                    'username': u.username,
                    'email': u.email,
                    'role': u.role,
                    'created_at': u.created_at.isoformat() if u.created_at else None
                } for u in all_users
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/debug/test-login', methods=['POST'])
def test_login():
    """Test login endpoint with sample credentials"""
    try:
        data = request.get_json()
        role = data.get('role', 'admin')
        
        # Sample credentials for testing
        credentials = {
            'admin': {'email': 'admin@cookeasy.com', 'password': 'admin123'},
            'chef': {'email': 'chef@cookeasy.com', 'password': 'chef123'},
            'user': {'email': 'sari@example.com', 'password': 'sari123'}
        }
        
        if role not in credentials:
            return jsonify({'message': 'Invalid role. Use admin, chef, or user'}), 400
        
        cred = credentials[role]
        user = User.query.filter_by(email=cred['email']).first()
        
        if not user or not user.check_password(cred['password']):
            return jsonify({'message': 'Test user not found or password mismatch'}), 401
        
        # Generate token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': f'Test login successful as {role}',
            'access_token': access_token,
            'user': user.to_dict(include_private=True),
            'credentials_used': {
                'email': cred['email'],
                'password': cred['password']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Test login failed', 'error': str(e)}), 500

# User profile and recipes endpoints
@auth_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Get user profile by ID"""
    try:
        user = User.query.get_or_404(user_id)
        return jsonify({
            'message': 'User profile retrieved successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get user profile', 'error': str(e)}), 500

@auth_bp.route('/users/me/recipes', methods=['GET'])
@jwt_required()
def get_my_recipes():
    """Get current user's recipes (including drafts)"""
    try:
        current_user_id = get_jwt_identity()
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 12))
        status = request.args.get('status', 'all')  # all, published, draft
        
        print(f"📝 get_my_recipes called by user {current_user_id}, status={status}, page={page}")
        
        # Use joinedload to include user and category data
        recipes_query = Recipe.query.options(
            joinedload(Recipe.user),
            joinedload(Recipe.category)
        ).filter_by(user_id=current_user_id)
        
        # Apply status filter
        if status == 'published':
            recipes_query = recipes_query.filter_by(is_published=True)
        elif status == 'draft':
            recipes_query = recipes_query.filter_by(is_published=False)
        # If status == 'all', show both published and draft recipes
        
        # Order by creation date (newest first)
        recipes_query = recipes_query.order_by(Recipe.created_at.desc())
        
        # Get paginated results
        paginated_recipes = recipes_query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        print(f"📊 Found {paginated_recipes.total} total recipes for user {current_user_id}")
        print(f"📄 Page {page}: {len(paginated_recipes.items)} recipes")
        
        recipes_data = [recipe.to_dict(include_details=False, current_user_id=int(current_user_id) if current_user_id else None) for recipe in paginated_recipes.items]
        for recipe in recipes_data:
            print(f"  - Recipe ID {recipe['id']}: {recipe['title']} (published: {recipe['is_published']})")
        
        return jsonify({
            'message': 'User recipes retrieved successfully',
            'recipes': recipes_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated_recipes.total,
                'pages': paginated_recipes.pages
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error in get_my_recipes: {str(e)}")
        return jsonify({'message': 'Failed to get user recipes', 'error': str(e)}), 500

@auth_bp.route('/users/<int:user_id>/recipes', methods=['GET'])
def get_user_recipes_by_id(user_id):
    """Get recipes by specific user ID"""
    try:
        user = User.query.get_or_404(user_id)
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 12))
        
        # Check if current user is viewing their own profile
        current_user_id = None
        is_own_profile = False
        
        try:
            # Try to get current user if authenticated
            from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
            verify_jwt_in_request(optional=True)
            current_user_id = get_jwt_identity()
            if current_user_id:
                current_user_id = int(current_user_id)
                is_own_profile = current_user_id == user_id
        except:
            # Not authenticated, continue with public view
            pass
        
        # Use joinedload to include user and category data
        recipes_query = Recipe.query.options(
            joinedload(Recipe.user),
            joinedload(Recipe.category)
        ).filter_by(user_id=user_id)
        
        # If viewing own profile, show all recipes (published + draft)
        # If viewing others' profile, show only published recipes
        if not is_own_profile:
            recipes_query = recipes_query.filter_by(is_published=True)
        
        # Order by creation date (newest first)
        recipes_query = recipes_query.order_by(Recipe.created_at.desc())
        
        # Get paginated results
        paginated_recipes = recipes_query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'message': 'User recipes retrieved successfully',
            'recipes': [recipe.to_dict(include_details=False, current_user_id=current_user_id) for recipe in paginated_recipes.items],
            'user': user.to_dict(),
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated_recipes.total,
                'pages': paginated_recipes.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get user recipes', 'error': str(e)}), 500