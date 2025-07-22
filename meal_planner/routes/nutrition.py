from flask import Blueprint, request, jsonify, session
import cohere
import os
import json
from models.user import User
from datetime import datetime
import re

bp = Blueprint('nutrition', __name__)
co = cohere.Client(os.environ.get('COHERE_API_KEY'))

def interpret_imc(imc):
    if imc < 18.5:
        return "Insuffisance pondérale"
    elif imc < 25:
        return "Poids normal"
    elif imc < 30:
        return "Surpoids"
    else:
        return "Obésité"

@bp.route('/nutrition', methods=['POST'])
def nutrition_analysis():
    try:
        data = request.get_json(silent=True) or {}
        print("[INFO] Données reçues:", data)

        preferences = data.get('preferences', [])
        menu_original = data.get('menu_original', ["Poulet DG", "Ndolé", "Cheeseburger", "Hot dog"])

        historique_imc = [
            {"date": "2025-06-01", "imc": 21.5},
            {"date": "2025-06-15", "imc": 22.0},
            {"date": "2025-07-01", "imc": 21.8}
        ]

        user_id = session.get('user_id') or data.get('user_id') or 1
        user = User.query.get(user_id)

        imc = None
        user_age = None
        imc_info = {}

        if user and user.poids and user.taille and user.taille > 0:
            taille_m = user.taille / 100
            imc = user.poids / (taille_m ** 2)
            imc_info = {
                "poids": user.poids,
                "taille": user.taille,
                "imc": round(imc, 2),
                "interpretation": interpret_imc(imc)
            }

        if user and user.annee_naissance:
            current_year = datetime.now().year
            user_age = current_year - user.annee_naissance

        prompt = f"""
Tu es un nutritionniste IA.
Profil utilisateur :
- Sexe : {user.sexe if user else "Non renseigné"}
- Âge : {user_age if user_age else "Non renseigné"}
- Taille : {user.taille if user else "Non renseigné"} cm
- Poids : {user.poids if user else "Non renseigné"} kg
- IMC : {round(imc, 2) if imc else "Non calculé"}

Préférences alimentaires : {preferences}

Menu original : {menu_original}

IMPORTANT : répond STRICTEMENT et UNIQUEMENT avec un bloc JSON complet et valide correspondant à la structure :
{{
  "menu": [
    {{"name": "Nom du plat", "calories": 300, "protein": 20, "carbs": 40, "fat": 10}}
  ],
  "total_calories": 1234
}}
"""

        print("[INFO] Prompt envoyé à Cohere:\n", prompt)

        response = co.generate(
            model='command-light',
            prompt=prompt,
            max_tokens=400
        )

        text = response.generations[0].text.strip()
        print("[INFO] Réponse brute Cohere:\n", text)

        # Essayer de parser directement
        parsed = None
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            print("[WARN] JSON direct invalide, tentative d'extraction via regex...")
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                try:
                    parsed = json.loads(match.group())
                    print("[INFO] JSON extrait via regex:", parsed)
                except json.JSONDecodeError as je_inner:
                    print("[ERROR] Impossible de parser même après extraction:", je_inner)
            else:
                print("[ERROR] Aucune structure JSON trouvée.")

        if parsed:
            # Succès partiel : on a un JSON
            return jsonify({
                "imc_info": imc_info,
                "imc_history": historique_imc,
                "nutrition": parsed.get("menu", []),
                "total_calories": parsed.get("total_calories"),
                "raw_response": text   # on envoie aussi le texte brut au frontend
            })
        else:
            # Échec total du parsing, on envoie quand même le texte brut
            return jsonify({
                "imc_info": imc_info,
                "imc_history": historique_imc,
                "nutrition": [],
                "total_calories": None,
                "raw_response": text,
                "error": "Réponse impossible à parser, mais voici ce qui a été généré"
            }), 200

    except Exception as e:
        print("[ERROR] Exception générale:", e)
        return jsonify({'error': str(e)}), 500
from flask import Blueprint, request, jsonify, session
import cohere
import os
import json
from models.user import User
from datetime import datetime
import re

bp = Blueprint('nutrition', __name__)
co = cohere.Client(os.environ.get('COHERE_API_KEY'))

def interpret_imc(imc):
    if imc < 18.5:
        return "Insuffisance pondérale"
    elif imc < 25:
        return "Poids normal"
    elif imc < 30:
        return "Surpoids"
    else:
        return "Obésité"

@bp.route('/nutrition', methods=['POST'])
def nutrition_analysis():
    try:
        data = request.get_json(silent=True) or {}
        print("[INFO] Données reçues:", data)

        preferences = data.get('preferences', [])
        menu_original = data.get('menu_original', ["Poulet DG", "Ndolé", "Cheeseburger", "Hot dog"])

        historique_imc = [
            {"date": "2025-06-01", "imc": 21.5},
            {"date": "2025-06-15", "imc": 22.0},
            {"date": "2025-07-01", "imc": 21.8}
        ]

        user_id = session.get('user_id') or data.get('user_id') or 1
        user = User.query.get(user_id)

        imc = None
        user_age = None
        imc_info = {}

        if user and user.poids and user.taille and user.taille > 0:
            taille_m = user.taille / 100
            imc = user.poids / (taille_m ** 2)
            imc_info = {
                "poids": user.poids,
                "taille": user.taille,
                "imc": round(imc, 2),
                "interpretation": interpret_imc(imc)
            }

        if user and user.annee_naissance:
            current_year = datetime.now().year
            user_age = current_year - user.annee_naissance

        prompt = f"""
Tu es un nutritionniste IA.
Profil utilisateur :
- Sexe : {user.sexe if user else "Non renseigné"}
- Âge : {user_age if user_age else "Non renseigné"}
- Taille : {user.taille if user else "Non renseigné"} cm
- Poids : {user.poids if user else "Non renseigné"} kg
- IMC : {round(imc, 2) if imc else "Non calculé"}

Préférences alimentaires : {preferences}

Menu original : {menu_original}

IMPORTANT : répond STRICTEMENT et UNIQUEMENT avec un bloc JSON complet et valide correspondant à la structure :
{{
  "menu": [
    {{"name": "Nom du plat", "calories": 300, "protein": 20, "carbs": 40, "fat": 10}}
  ],
  "total_calories": 1234
}}
"""

        print("[INFO] Prompt envoyé à Cohere:\n", prompt)

        response = co.generate(
            model='command-light',
            prompt=prompt,
            max_tokens=400
        )

        text = response.generations[0].text.strip()
        print("[INFO] Réponse brute Cohere:\n", text)

        # Essayer de parser directement
        parsed = None
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            print("[WARN] JSON direct invalide, tentative d'extraction via regex...")
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                try:
                    parsed = json.loads(match.group())
                    print("[INFO] JSON extrait via regex:", parsed)
                except json.JSONDecodeError as je_inner:
                    print("[ERROR] Impossible de parser même après extraction:", je_inner)
            else:
                print("[ERROR] Aucune structure JSON trouvée.")

        if parsed:
            # Succès partiel : on a un JSON
            return jsonify({
                "imc_info": imc_info,
                "imc_history": historique_imc,
                "nutrition": parsed.get("menu", []),
                "total_calories": parsed.get("total_calories"),
                "raw_response": text   # on envoie aussi le texte brut au frontend
            })
        else:
            # Échec total du parsing, on envoie quand même le texte brut
            return jsonify({
                "imc_info": imc_info,
                "imc_history": historique_imc,
                "nutrition": [],
                "total_calories": None,
                "raw_response": text,
                "error": "Réponse impossible à parser, mais voici ce qui a été généré"
            }), 200

    except Exception as e:
        print("[ERROR] Exception générale:", e)
        return jsonify({'error': str(e)}), 500

