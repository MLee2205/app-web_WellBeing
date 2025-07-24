from flask import Blueprint, request, jsonify, session, render_template
import cohere
import os
import json
import random
from models.user import User
from datetime import datetime
import re

bp = Blueprint('nutrition', __name__)
co = cohere.Client(os.environ.get('COHERE_API_KEY'))

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
            {"name": "Pomme", "calories": 80, "protein": 0, "carbs": 20, "fat": 0}
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
    """Interpréter l'IMC - Fonction indépendante de l'IA"""
    if imc < 18.5:
        return "Insuffisance pondérale"
    elif imc < 25:
        return "Poids normal"
    elif imc < 30:
        return "Surpoids"
    else:
        return "Obésité"

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
        user = User.query.get(user_id)
        poids = user.poids if user and user.poids else ''
        taille = user.taille if user and user.taille else ''
        return render_template('nutrition.html', poids=poids, taille=taille)
    except Exception as e:
        print("[ERROR] Exception nutrition_page:", e)
        return "Erreur chargement page nutrition", 500

@bp.route('/nutrition', methods=['POST'])
def nutrition_analysis():
    try:
        data = request.get_json(silent=True) or {}
        preferences = data.get('preferences', [])
        menu_original = data.get('menu_original', [])
        poids = data.get('poids')
        taille = data.get('taille')

        user_id = session.get('user_id') or data.get('user_id') or 1
        user = User.query.get(user_id)

        # ===== CALCUL IMC INDÉPENDANT DE L'IA =====
        imc_info = None
        
        # Prioriser les valeurs du formulaire
        if poids and taille:
            imc_info = calculer_imc(poids, taille)
        # Sinon utiliser les données utilisateur
        elif user and user.poids and user.taille:
            imc_info = calculer_imc(user.poids, user.taille)
        
        if not imc_info:
            return jsonify({'error': 'Poids et taille invalides ou manquants, impossible de calculer l\'IMC'}), 400

        print(f"[INFO] IMC calculé: {imc_info}")

        # ===== TRAITEMENT IA POUR LE MENU =====
        user_age = datetime.now().year - user.annee_naissance if user and user.annee_naissance else "Non renseigné"

        # Prompt pour l'IA
        prompt = f"""Tu es un nutritionniste IA.
Profil utilisateur :
- Sexe : {user.sexe if user else "Non renseigné"}
- Âge : {user_age}
- Taille : {imc_info['taille']} cm
- Poids : {imc_info['poids']} kg
- IMC : {imc_info['imc']} ({imc_info['interpretation']})

Préférences alimentaires : {preferences}
Menu original choisi : {menu_original}

IMPORTANT : Réponds STRICTEMENT et UNIQUEMENT avec un JSON valide dans ce format exact :
{{"menu":[{{"name":"Nom du plat", "calories":300,"protein":20,"carbs":40,"fat":10}}], "total_calories":1234}}

Adapte le menu selon l'IMC et les préférences. Assure-toi que le JSON soit parfaitement formaté."""

        menu_final = None
        total_calories = 0
        raw_response = ""
        source_menu = "fallback"

        try:
            print("[INFO] Envoi prompt à Cohere...")
            response = co.generate(model='command-light', prompt=prompt, max_tokens=400)
            raw_response = response.generations[0].text.strip()
            print(f"[DEBUG] Réponse IA brute: {raw_response}")

            # Parser la réponse de l'IA
            parsed_response = parse_ai_response(raw_response)
            
            if parsed_response and "menu" in parsed_response:
                menu_final = parsed_response["menu"]
                total_calories = parsed_response.get("total_calories", sum(item.get("calories", 0) for item in menu_final))
                source_menu = "IA"
                print("[INFO] Menu généré par l'IA avec succès")
            else:
                raise ValueError("Réponse IA invalide ou incomplète")
                
        except Exception as e:
            print(f"[WARNING] Erreur IA: {e}, utilisation du menu de fallback")
            menu_final, total_calories = get_menu_fallback(imc_info['interpretation'])
            raw_response = f"Erreur IA ({str(e)}), menu de fallback utilisé"
            source_menu = "fallback"

        # Historique IMC fictif (pourrait venir de la base de données)
        historique_imc = [
            {"date": "2025-06-01", "imc": 21.5},
            {"date": "2025-06-15", "imc": 22.0},
            {"date": "2025-07-01", "imc": 21.8}
        ]

        return jsonify({
            "imc_info": imc_info,
            "imc_history": historique_imc,
            "nutrition": menu_final,
            "total_calories": total_calories,
            "raw_response": raw_response,
            "categorie": imc_info['interpretation'],
            "source_menu": source_menu  # Pour debug: savoir si c'est l'IA ou fallback
        })

    except Exception as e:
        print(f"[ERROR] Exception générale: {e}")
        return jsonify({'error': str(e)}), 500
