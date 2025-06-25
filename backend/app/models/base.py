from abc import ABC, abstractmethod
from typing import Dict, List, Optional
import json
from datetime import datetime

class BaseModel(ABC):
    """Base model class with common functionality"""
    
    def __init__(self):
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self) -> Dict:
        """Convert model to dictionary"""
        result = {}
        for key, value in self.__dict__.items():
            if isinstance(value, datetime):
                result[key] = value.isoformat()
            else:
                result[key] = value
        return result
    
    def update(self, data: Dict):
        """Update model with new data"""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.utcnow()