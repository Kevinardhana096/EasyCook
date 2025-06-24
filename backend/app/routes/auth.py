from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token
from app import db
from app.models import User
from datetime import datetime, timedelta
import traceback

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    """Register new user"""
    try:
        print("📝 Processing registration...")  # Debug log
        data = request.get_json()
        print(f"📝 Registration data: {data}")  # Debug log
        
        # Validation
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'message': f'{field.title()} is required'}), 400
        
        # Check if user already exists
        existing_email = User.query.filter_by(email=data['email']).first()
        if existing_email:
            print(f"📝 Email already exists: {data['email']}")
            return jsonify({'message': 'Email already registered'}), 400
        
        existing_username = User.query.filter_by(username=data['username']).first()
        if existing_username:
            print(f"📝 Username already exists: {data['username']}")
            return jsonify({'message': 'Username already taken'}), 400
        
        # Create new user
        print(f"📝 Creating new user: {data['username']}")
        user = User(
            username=data['username'],
            email=data['email'],
            full_name=data.get('full_name', data['username']),
            bio=data.get('bio', ''),
            role=data.get('role', 'user'),
            is_active=True
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        print(f"✅ User created successfully: {user.username}")
        
        # Generate tokens
        access_token = create_access_token(identity=user.id, expires_delta=timedelta(days=1))
        refresh_token = create_refresh_token(identity=user.id, expires_delta=timedelta(days=30))
        
        return jsonify({
            'message': f'Welcome to CookEasy, {user.username}! 🎉',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(include_private=True)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        error_msg = f"Registration error: {str(e)}"
        print(f"❌ {error_msg}")
        traceback.print_exc()
        current_app.logger.error(error_msg)
        return jsonify({'message': 'Registration failed. Please try again.', 'error': str(e)}), 500

@bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        print("📝 Processing login...")
        data = request.get_json()
        print(f"📝 Login attempt: {data.get('email', 'unknown')}")
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            print(f"📝 User not found: {data['email']}")
            return jsonify({'message': 'Invalid email or password'}), 401
        
        if not user.check_password(data['password']):
            print(f"📝 Wrong password for: {data['email']}")
            return jsonify({'message': 'Invalid email or password'}), 401
        
        if not user.is_active:
            print(f"📝 Inactive user: {data['email']}")
            return jsonify({'message': 'Account is deactivated'}), 401
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        user.update_last_seen()
        db.session.commit()
        
        print(f"✅ Login successful: {user.username}")
        
        # Generate tokens
        access_token = create_access_token(identity=user.id, expires_delta=timedelta(days=1))
        refresh_token = create_refresh_token(identity=user.id, expires_delta=timedelta(days=30))
        
        return jsonify({
            'message': f'Welcome back, {user.username}! 👋',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        error_msg = f"Login error: {str(e)}"
        print(f"❌ {error_msg}")
        traceback.print_exc()
        current_app.logger.error(error_msg)
        return jsonify({'message': 'Login failed. Please try again.', 'error': str(e)}), 500

# Add other routes with similar error handling...