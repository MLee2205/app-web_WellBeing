from flask import Blueprint, jsonify, request
import cohere
import os
import json
import re
import logging
from datetime import datetime

bp = Blueprint('menu', __name__)

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Récupérer la clé depuis la variable d'environnement
api_key = os.environ.get('COHERE_API_KEY')
if not api_key:
    logger.warning("COHERE_API_KEY non définie, utilisation du mode fallback")
    co = None
else:
    try:
        co = cohere.Client(api_key)
        logger.info("Client Cohere initialisé avec succès")
    except Exception as e:
        logger.error(f"Erreur lors de l'initialisation de Cohere: {e}")
        co = None

def get_fallback_menu():
    """Menu de fallback avec plus de variété"""
    menus_variés = [
        {
            "Petit déjeuner": [
                {"name": "Beignets haricots + Bouillie de maïs", "type": "camerounais"},
                {"name": "Pancakes aux myrtilles + Sirop d'érable", "type": "américain"}
            ],
            "Déjeuner": [
                {"name": "Ndolé aux crevettes + Plantain bouilli", "type": "camerounais"},
                {"name": "Caesar Salad + Pain grillé à l'ail", "type": "américain"}
            ],
            "Dîner": [
                {"name": "Poulet DG + Riz parfumé", "type": "camerounais"},
                {"name": "BBQ Ribs + Purée de pommes de terre", "type": "américain"}
            ]
        },
        {
            "Petit déjeuner": [
                {"name": "Akassa + Poisson fumé", "type": "camerounais"},
                {"name": "French Toast + Bacon croustillant", "type": "américain"}
            ],
            "Déjeuner": [
                {"name": "Eru + Igname pilée", "type": "camerounais"},
                {"name": "Cheeseburger + Frites maison", "type": "américain"}
            ],
            "Dîner": [
                {"name": "Koki beans + Plantain frit", "type": "camerounais"},
                {"name": "Grilled Salmon + Légumes vapeur", "type": "américain"}
            ]
        },
        {
            "Petit déjeuner": [
                {"name": "Pap de maïs + Œufs brouillés", "type": "camerounais"},
                {"name": "Bagel + Cream cheese + Saumon", "type": "américain"}
            ],
            "Déjeuner": [
                {"name": "Mbongo tchobi + Bâton de manioc", "type": "camerounais"},
                {"name": "Buffalo Wings + Coleslaw", "type": "américain"}
            ],
            "Dîner": [
                {"name": "Poisson braisé + Riz au gras", "type": "camerounais"},
                {"name": "Mac and Cheese + Salade verte", "type": "américain"}
            ]
        }
    ]
    
    # Sélectionner un menu aléatoire basé sur l'heure
    import random
    random.seed(datetime.now().hour)
    return random.choice(menus_variés)

@bp.route('/menus', methods=['GET'])
def generate_menus():
    """
    Génère un menu équilibré avec des options personnalisées
    """
    # Récupérer les préférences depuis les paramètres de requête
    dietary_preference = request.args.get('diet', 'mixed')  # mixed, vegetarian, low-carb
    cuisine_preference = request.args.get('cuisine', 'both')  # camerounais, américain, both
    
    if not co:
        logger.info("Utilisation du menu de fallback (Cohere indisponible)")
        menu = get_fallback_menu()
        return jsonify({
            'menu': menu,
            'source': 'fallback',
            'preferences': {
                'diet': dietary_preference,
                'cuisine': cuisine_preference
            }
        })

    # Construire le prompt basé sur les préférences
    cuisine_instruction = {
        'camerounais': 'Inclue uniquement des plats camerounais traditionnels',
        'américain': 'Inclue uniquement des plats américains',
        'both': 'Inclue des plats camerounais et américains variés'
    }.get(cuisine_preference, 'Inclue des plats camerounais et américains variés')

    diet_instruction = {
        'vegetarian': 'Tous les plats doivent être végétariens',
        'low-carb': 'Privilégie les plats pauvres en glucides',
        'mixed': 'Équilibre protéines, légumes et glucides'
    }.get(dietary_preference, 'Équilibre protéines, légumes et glucides')

    prompt = f"""
Génère un menu équilibré sous forme JSON strictement structuré comme suit :
{{
  "Petit déjeuner": [ {{"name": "Nom du plat", "type": "camerounais ou américain"}}, {{"name": "Nom du plat", "type": "camerounais ou américain"}} ],
  "Déjeuner": [ {{"name": "Nom du plat", "type": "camerounais ou américain"}}, {{"name": "Nom du plat", "type": "camerounais ou américain"}} ],
  "Dîner": [ {{"name": "Nom du plat", "type": "camerounais ou américain"}}, {{"name": "Nom du plat", "type": "camerounais ou américain"}} ]
}}

Instructions:
- {cuisine_instruction}
- {diet_instruction}
- Ne mets RIEN d'autre que ce JSON valide
- Assure-toi que chaque plat a un nom et un type
- Varie les plats pour un menu équilibré
"""

    try:
        response = co.generate(
            model='command-light',
            prompt=prompt,
            max_tokens=400,
            temperature=0.8,
            stop_sequences=['}']  # S'arrêter après le JSON
        )

        text = response.generations[0].text.strip() + '}'  # Rajouter la } finale
        logger.info("Réponse brute de Cohere reçue")

        # Nettoyer le texte avant parsing
        text = re.sub(r'^[^{]*', '', text)  # Enlever tout ce qui précède le {
        text = re.sub(r'}[^}]*$', '}', text)  # Enlever tout ce qui suit le }

        try:
            menu = json.loads(text)
            
            # Valider la structure du menu
            required_keys = ["Petit déjeuner", "Déjeuner", "Dîner"]
            if not all(key in menu for key in required_keys):
                raise ValueError("Structure de menu invalide")
                
            # Valider que chaque catégorie a des plats
            for category in required_keys:
                if not isinstance(menu[category], list) or len(menu[category]) == 0:
                    raise ValueError(f"Catégorie {category} invalide")
                    
            logger.info("Menu généré avec succès par Cohere")
            return jsonify({
                'menu': menu,
                'source': 'ai_generated',
                'preferences': {
                    'diet': dietary_preference,
                    'cuisine': cuisine_preference
                },
                'timestamp': datetime.now().isoformat()
            })
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Erreur parsing JSON: {e}, utilisation du fallback")
            raise e

    except Exception as e:
        logger.error(f"Erreur lors de la génération: {e}")
        menu = get_fallback_menu()
        return jsonify({
            'menu': menu,
            'source': 'fallback_after_error',
            'error': str(e),
            'preferences': {
                'diet': dietary_preference,
                'cuisine': cuisine_preference
            }
        }), 200

@bp.route('/menus/preferences', methods=['GET'])
def get_menu_preferences():
    """Retourne les options de préférences disponibles"""
    return jsonify({
        'dietary_options': [
            {'value': 'mixed', 'label': 'Équilibré (recommandé)'},
            {'value': 'vegetarian', 'label': 'Végétarien'},
            {'value': 'low-carb', 'label': 'Faible en glucides'}
        ],
        'cuisine_options': [
            {'value': 'both', 'label': 'Camerounais et Américain'},
            {'value': 'camerounais', 'label': 'Camerounais uniquement'},
            {'value': 'américain', 'label': 'Américain uniquement'}
        ]
    })

@bp.route('/menus/random', methods=['GET'])
def get_random_menu():
    """Génère un menu aléatoire parmi les fallbacks"""
    menu = get_fallback_menu()
    return jsonify({
        'menu': menu,
        'source': 'random_fallback',
        'timestamp': datetime.now().isoformat()
    })
