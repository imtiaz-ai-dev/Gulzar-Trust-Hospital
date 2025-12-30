from flask import Flask , render_template
from extensions import db, jwt, ma
from routes import register_routes
from config import Config
from flask_cors import CORS  # <-- Added for CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)

     # Enable CORS for all routes (allow frontend calls)
    CORS(app, resources={r"/*": {"origins": "*"}})  # <-- Added

    register_routes(app)


    with app.app_context():
        db.create_all()
    
    return app


app = create_app()

@app.route('/')
def home():
    return render_template('index.html')

# @app.route('/demo')
# def demo():
#     return render_template('demo.html')

# @app.route('/test')
# def test():
#     return render_template('test.html')

if __name__ == "__main__":
    app.run()
