import os
from app import create_app

# Get config from environment or use default
config_name = os.getenv('FLASK_ENV', 'development')
app = create_app(config_name)

if __name__ == '__main__':
    # Run the app
    app.run(host='0.0.0.0', port=5000)