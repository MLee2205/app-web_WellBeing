from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import date
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"  # <-- nom changé
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100))
    renom = db.Column(db.String(100))
    date_naissance = db.Column(db.Date)
    sexe = db.Column(db.String(200))
    poids = db.Column(db.Float)
    taille = db.Column(db.Float)
    pdfs = db.relationship('UserPDF', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class UserPDF(db.Model):
    __tablename__ = "user_pdf"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # <-- ici
    filename = db.Column(db.String(255), nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    recette_data = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'original_name': self.original_name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'recette_data': json.loads(self.recette_data) if self.recette_data else None
        }

