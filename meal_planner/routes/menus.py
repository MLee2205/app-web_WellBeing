from flask import Blueprint, jsonify, request
import cohere
import os
import json
import re
import logging
from datetime import datetime
import random

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
        },
        {
            "Petit déjeuner": [
                {"name": "Gateau de maïs + Lait caillé", "type": "camerounais"},
                {"name": "Omelette Denver + Toast", "type": "américain"}
            ],
            "Déjeuner": [
                {"name": "Okok + Baton de manioc", "type": "camerounais"},
                {"name": "Club Sandwich + Chips", "type": "américain"}
            ],
            "Dîner": [
                {"name": "Sauce jaune + Couscous de maïs", "type": "camerounais"},
                {"name": "Steak + Purée maison", "type": "américain"}
            ]
        },
        {
            "Petit déjeuner": [
                {"name": "Bouillie de mil + Arachides", "type": "camerounais"},
                {"name": "Cereal Bowl + Fruits frais", "type": "américain"}
            ],
            "Déjeuner": [
                {"name": "Sanga + Riz nature", "type": "camerounais"},
                {"name": "Chicken Wrap + Salade César", "type": "américain"}
            ],
            "Dîner": [
                {"name": "Brochettes de boeuf + Légumes sautés", "type": "camerounais"},
                {"name": "Pizza Pepperoni + Salade verte", "type": "américain"}
            ]
        },
        {
            "Petit déjeuner": [
                {"name": "Pain au lait + Thé gingembre", "type": "camerounais"},
                {"name": "Waffles + Sirop de fraise", "type": "américain"}
            ],
            "Déjeuner": [
                {"name": "Poisson fumé + Macabo", "type": "camerounais"},
                {"name": "Hot Dog + Frites", "type": "américain"}
            ],
            "Dîner": [
                {"name": "Bongo tchobi + Manioc vapeur", "type": "camerounais"},
                {"name": "Roast Chicken + Gratin dauphinois", "type": "américain"}
            ]
        }
    ]
    return random.choice(menus_variés)

@bp.route('/menus', methods=['GET'])
def generate_menus():
    dietary_preference = request.args.get('diet', 'mixed')
    cuisine_preference = request.args.get('cuisine', 'both')
    
    if not co:
        logger.info("Utilisation du menu de fallback (Cohere indisponible)")
        menu = get_fallback_menu()
        return jsonify({
            'menu': menu,
            'source': 'fallback',
            'preferences': {'diet': dietary_preference, 'cuisine': cuisine_preference}
        })

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
            stop_sequences=['}']
        )
        text = response.generations[0].text.strip() + '}'
        text = re.sub(r'^[^{]*', '', text)
        text = re.sub(r'}[^}]*$', '}', text)

        menu = json.loads(text)
        if not all(k in menu for k in ["Petit déjeuner", "Déjeuner", "Dîner"]):
            raise ValueError("Structure de menu invalide")

        return jsonify({
            'menu': menu,
            'source': 'ai_generated',
            'preferences': {'diet': dietary_preference, 'cuisine': cuisine_preference},
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.warning(f"Erreur génération ou parsing, fallback : {e}")
        menu = get_fallback_menu()
        return jsonify({
            'menu': menu,
            'source': 'fallback_after_error',
            'error': str(e),
            'preferences': {'diet': dietary_preference, 'cuisine': cuisine_preference}
        }), 200

@bp.route('/menus/preferences', methods=['GET'])
def get_menu_preferences():
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
    menu = get_fallback_menu()
    return jsonify({
        'menu': menu,
        'source': 'random_fallback',
        'timestamp': datetime.now().isoformat()
    })

