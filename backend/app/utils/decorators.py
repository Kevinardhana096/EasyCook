from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models import User

def role_required(*allowed_roles):
    """
    Decorator to check if user has required role
    Usage: @role_required('admin', 'chef')
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                user_id = int(get_jwt_identity())
                user = User.query.get(user_id)
                
                if not user:
                    return jsonify({'message': 'User not found'}), 401
                
                if not user.is_active:
                    return jsonify({'message': 'Account is deactivated'}), 401
                
                if user.role not in allowed_roles:
                    return jsonify({
                        'message': 'Insufficient permissions',
                        'required_roles': list(allowed_roles),
                        'user_role': user.role
                    }), 403
                
                return f(*args, **kwargs)
            except Exception as e:
                return jsonify({'message': 'Authorization failed', 'error': str(e)}), 401
        
        return decorated_function
    return decorator

def admin_required(f):
    """Decorator for admin-only endpoints"""
    return role_required('admin')(f)

def chef_or_admin_required(f):
    """Decorator for chef and admin endpoints"""
    return role_required('chef', 'admin')(f)

def verified_user_required(f):
    """Decorator to check if user is verified"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            user_id = int(get_jwt_identity())
            user = User.query.get(user_id)
            
            if not user:
                return jsonify({'message': 'User not found'}), 401
            
            if not user.is_verified:
                return jsonify({'message': 'Account verification required'}), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': 'Authorization failed', 'error': str(e)}), 401
    
    return decorated_function
