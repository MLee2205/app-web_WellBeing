from flask import Blueprint, request, jsonify
from models.user import db, User

bp = Blueprint('user', __name__)

@bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email et mot de passe requis'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Utilisateur déjà existant'}), 400

    user = User(
        email=data['email'],
        name=data.get('name'),
        renom=data.get('renom'),
        annee_naissance=data.get('annee_naissance'),
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
        'annee_naissance': user.annee_naissance,
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
    user.annee_naissance = data.get('annee_naissance', user.annee_naissance)
    user.sexe = data.get('sexe', user.sexe)
    user.poids = data.get('poids', user.poids)    
    user.masse = data.get('taille', user.taille) 
    db.session.commit()
    return jsonify({'message': 'Profil mis à jour avec succès'})

