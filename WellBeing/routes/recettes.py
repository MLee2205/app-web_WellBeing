from flask import Blueprint, request, jsonify
import csv
import os
from datetime import datetime, timedelta


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
    start_date = datetime.today()  # point de départ

    for i, plat in enumerate(plats):
        plat_lower = plat.lower()
        jour_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=i)
        jour_str = jour_date.strftime("%A")  # Jour de la semaine (Lundi, Mardi, …)
        date_str = jour_date.strftime("%d/%m/%Y")

        if plat_lower in recettes_data:
            recette_info = recettes_data[plat_lower]
        else:
            recette_info = {
                "name": plat,
                "recette": f"❌ Aucune recette trouvée pour « {plat} » dans la base.",
                "temps_preparation": "N/A",
                "temps_cuisson": "N/A",
                "difficulte": "N/A",
                "conseils": ""
            }

        recette_info = dict(recette_info)  # copie pour ajouter nos champs
        recette_info["jour"] = jour_str
        recette_info["date"] = date_str
        recettes.append(recette_info)

    return jsonify({
        "success": True,
        "recettes": recettes,
        "timestamp": datetime.now().isoformat(),
        "total_recettes": len(recettes),
        "plats_demandes": plats
    })


