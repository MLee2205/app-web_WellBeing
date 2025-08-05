from flask import Blueprint, request, jsonify
from models.user import db, User
from datetime import datetime

bp = Blueprint('user', __name__)

@bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email et mot de passe requis'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Utilisateur déjà existant'}), 400
    date_naissance=datetime.strptime(data.get('date_naissance'), '%Y-%m-%d').date() if data.get('date_naissance') else None

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
    #db.session.add(user)
    #db.session.commit()
    #return jsonify({'message': 'Utilisateur créé avec succès'}), 201
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Utilisateur créé avec succès', 'user_id': user.id}), 201


@bp.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
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
def update_profile(user_id):
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
        return jsonify({'success': True, 'message': 'Connexion réussie', 'user_id': user.id})
    else:
        return jsonify({'success': False, 'error': 'Email ou mot de passe incorrect'}), 401

