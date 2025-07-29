from flask import Blueprint, jsonify, request
import os
import google.generativeai as genai
import json
import re
import logging
from datetime import datetime
import random

bp = Blueprint('menu', __name__)

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Récupérer la clé Gemini
api_key = os.environ.get('GEMINI_API_KEY')
if not api_key:
    logger.warning("GEMINI_API_KEY non définie, utilisation du mode fallback")
    model = None
else:
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-2.5-pro')
        logger.info("Client Gemini initialisé avec succès")
    except Exception as e:
        logger.error(f"Erreur lors de l'initialisation de Gemini: {e}")
        model = None

def get_fallback_menus():
    """Fallback avec plusieurs menus camerounais uniquement"""
    menus_variés = [
        {
            "Petit déjeuner": [
                {"name": "Beignets haricots + Bouillie de maïs", "type": "camerounais"}
            ],
            "Déjeuner": [
                {"name": "Ndolé aux crevettes + Plantain bouilli", "type": "camerounais"}
            ],
            "Dîner": [
                {"name": "Poulet DG + Riz parfumé", "type": "camerounais"}
            ]
        },
        {
            "Petit déjeuner": [
                {"name": "Akassa + Poisson fumé", "type": "camerounais"}
            ],
            "Déjeuner": [
                {"name": "Eru + Igname pilée", "type": "camerounais"}
            ],
            "Dîner": [
                {"name": "Koki beans + Plantain frit", "type": "camerounais"}
            ]
        },
        {
            "Petit déjeuner": [
                {"name": "Pap de maïs + Œufs brouillés", "type": "camerounais"}
            ],
            "Déjeuner": [
                {"name": "Mbongo tchobi + Bâton de manioc", "type": "camerounais"}
            ],
            "Dîner": [
                {"name": "Poisson braisé + Riz au gras", "type": "camerounais"}
            ]
        },
        {
            "Petit déjeuner": [
                {"name": "Gateau de maïs + Lait caillé", "type": "camerounais"}
            ],
            "Déjeuner": [
                {"name": "Okok + Baton de manioc", "type": "camerounais"}
            ],
            "Dîner": [
                {"name": "Sauce jaune + Couscous de maïs", "type": "camerounais"}
            ]
        },
        {
            "Petit déjeuner": [
                {"name": "Bouillie de mil + Arachides", "type": "camerounais"}
            ],
            "Déjeuner": [
                {"name": "Sanga + Riz nature", "type": "camerounais"}
            ],
            "Dîner": [
                {"name": "Brochettes de boeuf + Légumes sautés", "type": "camerounais"}
            ]
        }
    ]
    return menus_variés

@bp.route('/menus', methods=['GET'])
def generate_menus():
    dietary_preference = request.args.get('diet', 'mixed')
    
    if not model:
        logger.info("Utilisation du fallback (Gemini indisponible)")
        menus = get_fallback_menus()
        return jsonify({
            'menus': menus,
            'source': 'fallback',
            'preferences': {'diet': dietary_preference, 'cuisine': 'camerounais'}
        })

    diet_instruction = {
        'vegetarian': 'Tous les plats doivent être végétariens',
        'low-carb': 'Privilégie les plats pauvres en glucides',
        'mixed': 'Équilibre protéines, légumes et glucides'
    }.get(dietary_preference, 'Équilibre protéines, légumes et glucides')

    prompt = f"""
Génère 5 menus camerounais équilibrés sous forme JSON strictement structuré comme suit :
[
  {{
    "Petit déjeuner": [{{"name": "Nom du plat", "type": "camerounais"}}],
    "Déjeuner": [{{"name": "Nom du plat", "type": "camerounais"}}],
    "Dîner": [{{"name": "Nom du plat", "type": "camerounais"}}]
  }},
  ...
]

Instructions:
- {diet_instruction}
- Ne mets RIEN d'autre que ce JSON valide
- Chaque menu doit être différent et équilibré
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        text = re.sub(r'^[^\[]*', '', text)
        text = re.sub(r'\][^\]]*$', ']', text)

        menus = json.loads(text)
        if not isinstance(menus, list) or not all(isinstance(menu, dict) for menu in menus):
            raise ValueError("Structure invalide")

        return jsonify({
            'menus': menus,
            'source': 'ai_generated',
            'preferences': {'diet': dietary_preference, 'cuisine': 'camerounais'},
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.warning(f"Erreur génération ou parsing, fallback : {e}")
        menus = get_fallback_menus()
        return jsonify({
            'menus': menus,
            'source': 'fallback_after_error',
            'error': str(e),
            'preferences': {'diet': dietary_preference, 'cuisine': 'camerounais'}
        }), 200

@bp.route('/menus/preferences', methods=['GET'])
def get_menu_preferences():
    return jsonify({
        'dietary_options': [
            {'value': 'mixed', 'label': 'Équilibré (recommandé)'},
            {'value': 'vegetarian', 'label': 'Végétarien'},
            {'value': 'low-carb', 'label': 'Faible en glucides'}
        ]
    })

@bp.route('/menus/random', methods=['GET'])
def get_random_menu():
    menus = get_fallback_menus()
    return jsonify({
        'menus': menus,
        'source': 'random_fallback',
        'timestamp': datetime.now().isoformat()
    })

