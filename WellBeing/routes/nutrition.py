from flask import Blueprint, request, jsonify, session, render_template

import google.generativeai as genai
import os
import json
import random
from ..models.user import User
from datetime import datetime,date
import re

bp = Blueprint('nutrition', __name__)
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

# Menus prédéfinis par IMC
menus_par_imc = {
    "Insuffisance pondérale": [
        [
            {"name": "Poulet DG", "calories": 500, "protein": 35, "carbs": 50, "fat": 20},
            {"name": "Riz sauté aux légumes", "calories": 450, "protein": 15, "carbs": 65, "fat": 12},
            {"name": "Avocat et toasts", "calories": 350, "protein": 10, "carbs": 40, "fat": 18},
            {"name": "Smoothie banane lait d'amande", "calories": 300, "protein": 8, "carbs": 50, "fat": 6}
        ],
        [
            {"name": "Spaghetti bolognaise", "calories": 550, "protein": 30, "carbs": 70, "fat": 18},
            {"name": "Salade César", "calories": 400, "protein": 25, "carbs": 20, "fat": 15},
            {"name": "Yaourt aux fruits", "calories": 150, "protein": 6, "carbs": 20, "fat": 4},
            {"name": "Pain complet et fromage", "calories": 300, "protein": 15, "carbs": 40, "fat": 12}
        ]
    ],
    "Poids normal": [
        [
            {"name": "Poisson braisé", "calories": 400, "protein": 35, "carbs": 10, "fat": 15},
            {"name": "Salade composée", "calories": 250, "protein": 10, "carbs": 20, "fat": 10},
            {"name": "Spaghetti sauce tomate", "calories": 450, "protein": 20, "carbs": 65, "fat": 10},
            {"name": "Fruit frais", "calories": 80, "protein": 1, "carbs": 18, "fat": 0}
        ],
        [
            {"name": "Poulet grillé", "calories": 350, "protein": 40, "carbs": 5, "fat": 12},
            {"name": "Riz complet", "calories": 200, "protein": 5, "carbs": 45, "fat": 2},
            {"name": "Brocolis vapeur", "calories": 50, "protein": 3, "carbs": 10, "fat": 0},
            {"name": "Pomme sauté", "calories": 80, "protein": 0, "carbs": 20, "fat": 0}
        ]
    ],
    "Surpoids": [
        [
            {"name": "Filet de poulet grillé", "calories": 300, "protein": 40, "carbs": 0, "fat": 10},
            {"name": "Salade verte", "calories": 150, "protein": 5, "carbs": 10, "fat": 7},
            {"name": "Riz complet (petite portion)", "calories": 150, "protein": 4, "carbs": 30, "fat": 2},
            {"name": "Fruit frais", "calories": 80, "protein": 1, "carbs": 18, "fat": 0}
        ],
        [
            {"name": "Poisson vapeur", "calories": 250, "protein": 35, "carbs": 0, "fat": 8},
            {"name": "Légumes grillés", "calories": 100, "protein": 3, "carbs": 15, "fat": 4},
            {"name": "Quinoa (petite portion)", "calories": 180, "protein": 6, "carbs": 30, "fat": 3},
            {"name": "Yaourt nature", "calories": 80, "protein": 6, "carbs": 10, "fat": 2}
        ]
    ],
    "Obésité": [
        [
            {"name": "Poisson vapeur", "calories": 250, "protein": 35, "carbs": 0, "fat": 8},
            {"name": "Salade verte sans sauce grasse", "calories": 100, "protein": 3, "carbs": 10, "fat": 4},
            {"name": "Légumes vapeur", "calories": 80, "protein": 3, "carbs": 10, "fat": 2},
            {"name": "Fruit frais", "calories": 80, "protein": 1, "carbs": 18, "fat": 0}
        ],
        [
            {"name": "Blanc de dinde grillé", "calories": 200, "protein": 35, "carbs": 0, "fat": 6},
            {"name": "Brocolis vapeur", "calories": 50, "protein": 3, "carbs": 10, "fat": 0},
            {"name": "Carottes râpées", "calories": 80, "protein": 2, "carbs": 15, "fat": 1},
            {"name": "Pomme", "calories": 80, "protein": 0, "carbs": 20, "fat": 0}
        ]
    ]
}

def interpret_imc(imc):
    """Interpréter l'IMC selon la classification complète de l'OMS"""
    if imc < 16:
        return "Anorexie ou dénutrition"
    elif imc < 16.5:
        return "Maigreur"
    elif imc < 18.5:
        return "Maigreur"  # Entre 16.5 et 18.5
    elif imc < 25:
        return "Corpulence normale"
    elif imc < 30:
        return "Surpoids"
    elif imc < 35:
        return "Obésité modérée (Classe 1)"
    elif imc < 40:
        return "Obésité élevé (Classe 2)"
    else:  # imc >= 40
        return "Obésité morbide ou massive"

def calculer_imc(poids, taille):
    """Calculer l'IMC - Fonction pure indépendante de l'IA"""
    if not poids or not taille or taille <= 0 or poids <= 0:
        return None
    
    imc = poids / ((taille/100) ** 2)
    return {
        "poids": poids,
        "taille": taille, 
        "imc": round(imc, 2),
        "interpretation": interpret_imc(imc)
    }

def calculer_age(date_naissance):
    """Calculer l'âge de façon robuste"""
    if not date_naissance:
        return None
    try:
        # si c'est déjà un date/datetime SQLAlchemy
        if hasattr(date_naissance, 'year'):
            today = datetime.now().date()
            dob = date_naissance if isinstance(date_naissance, date) else date_naissance.date()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            return age
        # si c'est une chaîne ISO
        if isinstance(date_naissance, str):
            try:
                dob = datetime.fromisoformat(date_naissance).date()
                today = datetime.now().date()
                return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            except Exception:
                return None
    except Exception as e:
        print(f"[WARNING] Erreur calcul âge: {e}")
    return None

def get_user_complete_data(user_id):
    """Récupérer toutes les données utilisateur nécessaires"""
    user_data = {
        'poids': '',
        'taille': '',
        'age': 'Non renseigné',
        'sexe': 'Non renseigné',
        'date_naissance': None
    }
    
    try:
        user = User.query.get(user_id)
        if user:
            user_data['poids'] = getattr(user, 'poids', '') or ''
            user_data['taille'] = getattr(user, 'taille', '') or ''
            user_data['sexe'] = getattr(user, 'sexe', 'Non renseigné') or 'Non renseigné'
            user_data['date_naissance'] = getattr(user, 'date_naissance', None)
            
            # Calcul de l'âge
            age_calcule = calculer_age(user_data['date_naissance'])
            if age_calcule:
                user_data['age'] = age_calcule
                
        print(f"[INFO] Données utilisateur récupérées: {user_data}")
        return user_data
    except Exception as e:
        print(f"[WARNING] Erreur récupération données utilisateur {user_id}: {e}")
        return user_data

def get_menu_fallback(categorie_imc):
    """Obtenir un menu de fallback basé sur la catégorie IMC"""
    menu_choisi = random.choice(menus_par_imc.get(categorie_imc, menus_par_imc["Poids normal"]))
    total_calories = sum(item["calories"] for item in menu_choisi)
    return menu_choisi, total_calories

def parse_ai_response(text):
    """Parser la réponse de l'IA pour extraire le JSON"""
    try:
        # Essayer de parser directement
        return json.loads(text)
    except json.JSONDecodeError:
        try:
            # Chercher un JSON dans le texte
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return None

@bp.route('/nutrition', methods=['GET'])
def nutrition_page():
    try:
        user_id = session.get('user_id') or request.args.get('user_id') or 1
        user_data = get_user_complete_data(user_id)
        
        return render_template('nutrition.html', 
                             poids=user_data['poids'], 
                             taille=user_data['taille'],
                             age=user_data['age'],
                             sexe=user_data['sexe'])
    except Exception as e:
        print("[ERROR] Exception nutrition_page:", e)
        return "Erreur chargement page nutrition", 500

@bp.route('/nutrition', methods=['POST'])
def nutrition_analysis():
    try:
        # Vérifier que la requête est bien JSON
        if not request.is_json:
            print("[ERROR] Requête non JSON. Headers:", dict(request.headers))
            print("[ERROR] Body brut:", request.get_data(as_text=True))
            return jsonify({"error": "Requête attendue en JSON (Content-Type: application/json)"}), 400

        data = request.get_json(silent=True)
        if data is None:
            print("[ERROR] request.get_json() a renvoyé None. Body brut:", request.get_data(as_text=True))
            return jsonify({"error": "JSON manquant ou mal formé"}), 400

        # Extraire en sécurité
        preferences = data.get('preferences') or []
        menu_original = data.get('menu_original') or []
        poids = data.get('poids')
        taille = data.get('taille')
        fasting = data.get('fasting') or {}
        fasting_type = fasting.get('type', "")
        fasting_start = fasting.get('start', "")
        fasting_end = fasting.get('end', "")
        user_id = session.get('user_id') or data.get('user_id') or 1

        # Récupérer TOUTES les données utilisateur
        user_data = get_user_complete_data(user_id)

        # Calcul IMC — priorité aux valeurs envoyées, sinon celles de l'utilisateur
        def to_number(x):
            try:
                return float(x) if x is not None else None
            except Exception:
                return None

        poids_num = to_number(poids) or to_number(user_data['poids'])
        taille_num = to_number(taille) or to_number(user_data['taille'])

        if not poids_num or not taille_num:
            return jsonify({'error': 'Poids et taille invalides ou manquants, impossible de calculer l\'IMC'}), 400

        imc_info = calculer_imc(poids_num, taille_num)
        if not imc_info:
            return jsonify({'error': 'Impossible de calculer l\'IMC avec les données fournies'}), 400

        print(f"[INFO] IMC calculé: {imc_info}")
        print(f"[INFO] Données utilisateur complètes: {user_data}")

        # Préparer prompt amélioré pour l'IA avec TOUTES les données
        prompt = f"""Tu es un nutritionniste IA spécialisé dans l'adaptation de menus personnalisés.

PROFIL UTILISATEUR COMPLET :
- Sexe : {user_data['sexe']}
- Âge : {user_data['age']} ans
- Taille : {imc_info['taille']} cm
- Poids : {imc_info['poids']} kg
- IMC : {imc_info['imc']} ({imc_info['interpretation']})

PRÉFÉRENCES ALIMENTAIRES : {preferences if preferences else "Aucune restriction particulière"}

MENU ORIGINAL CHOISI PAR L'UTILISATEUR : {menu_original}

PARAMÈTRES DE JEÛNE :
- Type de jeûne : {fasting_type if fasting_type else "Aucun jeûne"}
- Horaires : de {fasting_start} à {fasting_end}

INSTRUCTIONS IMPORTANTES :
1. Adapte le menu selon le profil utilisateur (âge, sexe, IMC)
2. Respecte strictement les préférences alimentaires
3. Si un jeûne est programmé, adapte les portions et le timing
4. Assure-toi que les apports nutritionnels correspondent aux besoins selon l'âge et le sexe

FORMAT DE RÉPONSE OBLIGATOIRE (JSON uniquement) :
{{"menu":[{{"name":"Nom du plat", "calories":300,"protein":20,"carbs":40,"fat":10}}], "total_calories":1234}}

Réponds STRICTEMENT avec ce format JSON, rien d'autre.
"""

        # Appel IA (avec fallback)
        menu_final = None
        total_calories = 0
        raw_response = ""
        source_menu = "fallback"

        try:
            print("[INFO] Envoi prompt personnalisé à Gemini...")
            model = genai.GenerativeModel('gemini-1.5-flash-latest')
            response = model.generate_content(prompt)
            raw_response = getattr(response, 'text', str(response)).strip()
            print(f"[DEBUG] Réponse IA brute: {raw_response}")

            parsed_response = parse_ai_response(raw_response)
            if parsed_response and isinstance(parsed_response, dict) and "menu" in parsed_response:
                menu_final = parsed_response["menu"]
                total_calories = parsed_response.get("total_calories", sum(item.get("calories", 0) for item in menu_final))
                source_menu = "IA"
                print("[SUCCESS] Menu généré par l'IA avec succès")
            else:
                raise ValueError("Réponse IA invalide ou incomplète")
        except Exception as e:
            print(f"[WARNING] Erreur IA: {e}, utilisation du menu de fallback")
            menu_final, total_calories = get_menu_fallback(imc_info['interpretation'])
            raw_response = f"Erreur IA ({str(e)}), menu de fallback utilisé"
            source_menu = "fallback"

        # Historique IMC simulé (à remplacer par vraies données)
        historique_imc = [
            {"date": "2025-06-01", "imc": 21.5},
            {"date": "2025-06-15", "imc": 22.0},
            {"date": "2025-07-01", "imc": 21.8}
        ]

        return jsonify({
            "imc_info": imc_info,
            "user_data": user_data,  # Inclure les données utilisateur dans la réponse
            "imc_history": historique_imc,
            "nutrition": menu_final,
            "total_calories": total_calories,
            "raw_response": raw_response,
            "categorie": imc_info['interpretation'],
            "source_menu": source_menu
        })

    except Exception as e:
        import traceback
        print(f"[ERROR] Exception générale: {e}", flush=True)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
