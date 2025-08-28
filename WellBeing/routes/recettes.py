from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
import json
import re
from datetime import datetime

bp = Blueprint('recettes', __name__)

# Charger les recettes en mémoire au démarrage
BASE_DIR = Path(__file__).resolve().parent.parent
RECETTES_FILE = BASE_DIR / "recette.csv"

recettes_data = {}

try:
    if RECETTES_FILE.exists():
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
        print(f"[INFO] {len(recettes_data)} recettes chargées depuis {RECETTES_FILE}")
    else:
        print(f"[WARNING] Fichier recette.csv introuvable à: {RECETTES_FILE}")
        # Données de fallback pour éviter les erreurs
        recettes_data = {
            "poulet dg": {
                "name": "Poulet DG",
                "recette": "Recette de Poulet DG non disponible pour le moment",
                "temps_preparation": "N/A",
                "temps_cuisson": "N/A",
                "difficulte": "N/A",
                "conseils": ""
            }
        }
        
except Exception as e:
    print(f"[ERROR] Erreur chargement recettes CSV: {e}")
    # Fallback minimal pour éviter la panne de l'application
    recettes_data = {
        "ndolé et plantains": {
            "name": "Ndolé et plantains",
            "recette": "Recette temporairement indisponible",
            "temps_preparation": "N/A",
            "temps_cuisson": "N/A",
            "difficulte": "N/A",
            "conseils": ""
        }
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


