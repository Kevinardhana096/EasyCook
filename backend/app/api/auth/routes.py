from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User
from app.utils.decorators import admin_required
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
        
        # Create user
        user = User(
            username=data['username'],
            email=data['email'],
            full_name=data.get('full_name', data['username']),
            bio=data.get('bio', ''),
            role='user',
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