from flask import Blueprint, jsonify
from datetime import datetime

bp = Blueprint('main', __name__, url_prefix='/api')

@bp.route('/')
def home():
    """API home endpoint"""
    return jsonify({
        'message': 'Welcome to CookEasy API! 🍳',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat(),
        'status': 'healthy',
        'endpoints': {
            'auth': '/api/auth/*',
            'recipes': '/api/recipes/*',
            'users': '/api/users/*',
            'health': '/health'
        },
        'developer': 'nowriafisda',
        'project': 'CookEasy - Recipe Platform'
    })

@bp.route('/status')
def status():
    """API status check"""
    return jsonify({
        'status': 'online',
        'message': 'CookEasy API is running smoothly',
        'timestamp': datetime.utcnow().isoformat(),
        'server_time': '2025-06-21 07:15:57 UTC',
        'uptime': 'Active'
    })

@bp.route('/info')
def info():
    """API information"""
    return jsonify({
        'name': 'CookEasy API',
        'description': 'Backend API for CookEasy recipe sharing platform',
        'version': '1.0.0',
        'developer': 'nowriafisda',
        'contact': 'nowriafisda@cookeasy.com',
        'documentation': 'https://api.cookeasy.com/docs',
        'features': [
            'User Authentication',
            'Recipe Management',
            'Rating & Reviews',
            'Favorites & Bookmarks',
            'Search & Filter',
            'Category Management'
        ]
    })