from flask import Blueprint

recipes_bp = Blueprint('recipes', __name__)

from app.api.recipes import routes