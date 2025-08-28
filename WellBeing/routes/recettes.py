from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
import json
import re
from datetime import datetime

bp = Blueprint('recettes', __name__)

# Charger les recettes en mémoire au démarrage
RECETTES_FILE = os.path.join(os.path.dirname(__file__), "/home/mlee/Musique/projet/WellBeing/recette.csv")
recettes_data = {}

with open(RECETTES_FILE, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        menu = row["menu"].strip()
        preparation = row["preparation"].strip()
        recettes_data[menu.lower()] = {
            "name": menu,
            "recette": preparation,
            "temps_preparation": "À préciser",
            "temps_cuisson": "À préciser",
            "difficulte": "Non spécifié",
            "conseils": ""
        }

@bp.route('/recettes', methods=['POST'])
def generate_recettes():
    data = request.get_json(silent=True) or {}
    plats = data.get('plats', [])

    if not plats:
        return jsonify({
            "success": False,
            "error": "Aucun plat fourni.",
            "timestamp": datetime.now().isoformat()
        }), 400

    recettes = []
    for plat in plats:
        plat_lower = plat.lower()
        if plat_lower in recettes_data:
            recettes.append(recettes_data[plat_lower])
        else:
            recettes.append({
                "name": plat,
                "recette": f"❌ Aucune recette trouvée pour « {plat} » dans la base.",
                "temps_preparation": "N/A",
                "temps_cuisson": "N/A",
                "difficulte": "N/A",
                "conseils": ""
            })

    return jsonify({
        "success": True,
        "recettes": recettes,
        "timestamp": datetime.now().isoformat(),
        "total_recettes": len(recettes),
        "plats_demandes": plats
    })


