from flask import Flask, render_template
from config import Config
from models.user import db
from routes import user as user_routes
from routes import menus as menu_routes
from routes import nutrition as nutrition_routes
from routes import recettes as recettes_routes
from routes import courses as courses_routes

def create_app():
    """Factory pattern pour créer l'application Flask"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configuration de la base de données
    db.init_app(app)
    
    # Enregistrement des blueprints
    app.register_blueprint(user_routes.bp, url_prefix='/api')
    app.register_blueprint(menu_routes.bp, url_prefix='/api')
    app.register_blueprint(nutrition_routes.bp, url_prefix='/api')
    app.register_blueprint(recettes_routes.bp, url_prefix='/api')
    app.register_blueprint(courses_routes.bp)
    
    # Routes principales
    @app.route('/')
    def home():
        return render_template('index.html')
    
    @app.route('/menus')
    def menus_page():
        return render_template('menu.html')
    
    @app.route('/register')
    def register_page():
        return render_template('register.html')
    
    @app.route('/profil')
    def profil():
        return render_template('profil.html')
        
    @app.route('/nutrition')
    def nutrition_page():
        return render_template('nutrition.html')
        
    @app.route('/recettes')
    def recettes_page():
        return render_template('recettes.html')
    
    # Gestion d'erreurs
    @app.errorhandler(404)
    def page_not_found(error):
        return render_template('404.html'), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return render_template('500.html'), 500
    
    return app

# Point d'entrée
app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Création des tables si nécessaire
    app.run(debug=True, host='0.0.0.0', port=5000)
