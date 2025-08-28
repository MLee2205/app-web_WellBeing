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


