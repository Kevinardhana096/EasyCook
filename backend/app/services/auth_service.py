from typing import Dict, Optional
from flask_jwt_extended import create_access_token, create_refresh_token
from app.models.user import User
from app.utils.validators import validate_email, validate_password

class AuthService:
    
    @staticmethod
    def register(data: Dict) -> Dict:
        """Register new user"""
        # Validate input
        if not validate_email(data.get('email', '')):
            raise ValueError("Invalid email format")
        
        if not validate_password(data.get('password', '')):
            raise ValueError("Password must be at least 6 characters")
        
        # Check if user exists
        if User.email_exists(data['email']):
            raise ValueError("Email already registered")
        
        if User.username_exists(data['username']):
            raise ValueError("Username already taken")
        
        # Create user
        user_data = User.create(data)
        
        # Generate tokens
        access_token = create_access_token(identity=user_data['id'])
        refresh_token = create_refresh_token(identity=user_data['id'])
        
        return {
            'user': user_data,
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    @staticmethod
    def login(email: str, password: str) -> Dict:
        """Login user"""
        # Find user
        user = User.get_by_email(email)
        if not user or not user.check_password(password):
            raise ValueError("Invalid email or password")
        
        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return {
            'user': user.to_dict_safe(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    @staticmethod
    def get_user_profile(user_id: int) -> Optional[Dict]:
        """Get user profile"""
        return User.get_by_id(user_id)