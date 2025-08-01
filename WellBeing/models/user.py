from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100))
    renom = db.Column(db.String(100))             
    annee_naissance = db.Column(db.Integer)
    sexe = db.Column(db.String(200))
    poids = db.Column(db.Float)
    taille = db.Column(db.Float)

    def set_password(self, password):
    	self.password_hash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)


    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

