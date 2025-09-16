from flask import Blueprint, request, jsonify, session, redirect, url_for
from ..models.user import db, User, UserPDF
from functools import wraps
from datetime import datetime,timedelta
import os
import json
import uuid
from flask import send_file



bp = Blueprint('user', __name__)

# Configuration du dossier de stockage des PDFs
PDF_STORAGE_PATH = os.path.join(os.path.dirname(__file__), 'user_pdfs')
if not os.path.exists(PDF_STORAGE_PATH):
    os.makedirs(PDF_STORAGE_PATH)
    
@bp.before_app_request
def make_session_permanent():
    session.permanent = True
    # La session expirera après 30 jours d'inactivité
    bp.permanent_session_lifetime = timedelta(days=30)

@bp.route('/check_session', methods=['GET'])
def check_session():
    """Vérifier si l'utilisateur est déjà connecté"""
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        if user:
            return jsonify({
                'logged_in': True, 
                'user_id': user_id,
                'email': user.email
            })
    
    return jsonify({'logged_in': False})

# Décorateur pour vérifier la connexion
def require_login(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Non autorisé, veuillez vous connecter'}), 401
        return f(*args, **kwargs)
    return decorated_function

@bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email et mot de passe requis'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Utilisateur déjà existant'}), 400
    
    date_naissance = datetime.strptime(data.get('date_naissance'), '%Y-%m-%d').date() if data.get('date_naissance') else None

    user = User(
        email=data['email'],
        name=data.get('name'),
        renom=data.get('renom'),
        date_naissance=date_naissance,
        sexe=data.get('sexe'),
        poids=data.get('poids'),    
        taille=data.get('taille') 
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # CONNEXION AUTOMATIQUE APRÈS INSCRIPTION
    session['user_id'] = user.id
    
    return jsonify({
        'message': 'Utilisateur créé avec succès', 
        'user_id': user.id,
        'redirect': '/nutrition'  # Indiquer la redirection
    }), 201
    
# Utiliser le décorateur sur les routes protégées
@bp.route('/profile/<int:user_id>', methods=['GET'])
@require_login  # <-- Ajouter le décorateur
def get_profile(user_id):
    # Vérifier que l'utilisateur accède à son propre profil
    if session.get('user_id') != user_id:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    user = User.query.get_or_404(user_id)
    return jsonify({
        'email': user.email,
        'name': user.name,
        'renom': user.renom,
        'date_naissance': user.date_naissance.isoformat() if user.date_naissance else None,
        'sexe': user.sexe,
        'poids': user.poids,   
        'taille': user.taille
    })

@bp.route('/profile/<int:user_id>', methods=['PUT'])
@require_login  # <-- Ajouter le décorateur
def update_profile(user_id):
    # Vérifier que l'utilisateur modifie son propre profil
    if session.get('user_id') != user_id:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    user = User.query.get_or_404(user_id)
    data = request.json
    user.email = data.get('email', user.email)
    user.name = data.get('name', user.name)
    user.renom = data.get('renom', user.renom)
    if data.get('date_naissance'):
        user.date_naissance = datetime.strptime(data['date_naissance'], '%Y-%m-%d').date()
    user.sexe = data.get('sexe', user.sexe)
    user.poids = data.get('poids', user.poids)    
    user.taille = data.get('taille', user.taille) 
    db.session.commit()
    return jsonify({'message': 'Profil mis à jour avec succès'})

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email et mot de passe requis'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        session['user_id'] = user.id  # <<< ici on stocke
        return jsonify({'success': True, 'message': 'Connexion réussie', 'user_id': user.id})
    else:
        return jsonify({'success': False, 'error': 'Email ou mot de passe incorrect'}), 401

@bp.route('/pdfs', methods=['GET'])
@require_login
def get_user_pdfs():
    """Récupérer tous les PDFs de l'utilisateur connecté"""
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    pdfs = [pdf.to_dict() for pdf in user.pdfs]
    return jsonify({'pdfs': pdfs})

@bp.route('/pdf/<int:pdf_id>', methods=['GET'])
@require_login
def get_pdf(pdf_id):
    """Télécharger un PDF spécifique de l'utilisateur"""
    user_id = session.get('user_id')
    pdf = UserPDF.query.filter_by(id=pdf_id, user_id=user_id).first_or_404()
    
    pdf_path = os.path.join(PDF_STORAGE_PATH, pdf.filename)
    if not os.path.exists(pdf_path):
        return jsonify({'error': 'Fichier PDF introuvable'}), 404
        
    return send_file(pdf_path, as_attachment=True, download_name=pdf.original_name)

@bp.route('/pdf', methods=['POST'])
@require_login
def save_pdf():
    """Sauvegarder un nouveau PDF pour l'utilisateur"""
    user_id = session.get('user_id')
    
    if 'pdf' not in request.files:
        return jsonify({'error': 'Aucun fichier PDF fourni'}), 400
        
    pdf_file = request.files['pdf']
    if pdf_file.filename == '':
        return jsonify({'error': 'Nom de fichier vide'}), 400
        
    if not pdf_file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Le fichier doit être un PDF'}), 400
        
    # Générer un nom de fichier unique
    unique_filename = f"{user_id}_{uuid.uuid4().hex}.pdf"
    pdf_path = os.path.join(PDF_STORAGE_PATH, unique_filename)
    pdf_file.save(pdf_path)
    
    # Récupérer les données de la recette si fournies
    recette_data = request.form.get('recette_data')
    
    # Enregistrer dans la base de données
    new_pdf = UserPDF(
        user_id=user_id,
        filename=unique_filename,
        original_name=pdf_file.filename,
        recette_data=recette_data
    )
    
    db.session.add(new_pdf)
    db.session.commit()
    
    return jsonify({'message': 'PDF sauvegardé avec succès', 'pdf_id': new_pdf.id})

@bp.route('/logout', methods=['GET'])
def logout():
    """Déconnexion avec suppression de tous les PDFs de l'utilisateur"""
    user_id = session.get('user_id')
    
    if user_id:
        # Récupérer tous les PDFs de l'utilisateur
        user_pdfs = UserPDF.query.filter_by(user_id=user_id).all()
        
        # Supprimer les fichiers physiques
        for pdf in user_pdfs:
            pdf_path = os.path.join(PDF_STORAGE_PATH, pdf.filename)
            if os.path.exists(pdf_path):
                try:
                    os.remove(pdf_path)
                except Exception as e:
                    print(f"Erreur suppression fichier {pdf.filename}: {e}")
        
        # Supprimer les entrées en base de données
        UserPDF.query.filter_by(user_id=user_id).delete()
        db.session.commit()
    
    # Vider la session
    session.pop('user_id', None)
    session.clear()
    
    return redirect('/')
