# Fichier : nutrition.py

from flask import Blueprint, request, jsonify, session, render_template

import google.generativeai as genai
import os
import json
import random
from ..models.user import User
from datetime import datetime,date
import re
import csv
from pathlib import Path

bp = Blueprint('nutrition', __name__)

# Menus prédéfinis avec informations nutritionnelles
menu_details = {
    'Poulet DG': {'calories': 500, 'protein': 40, 'carbs': 30, 'fat': 25},
    'Ndolé': {'calories': 650, 'protein': 30, 'carbs': 70, 'fat': 20},
    'Kondre': {'calories': 450, 'protein': 18, 'carbs': 55, 'fat': 15},
    'Taro': {'calories': 750, 'protein': 27, 'carbs': 88, 'fat': 23},
    'Poisson braisé': {'calories': 400, 'protein': 35, 'carbs': 10, 'fat': 15},
    'Spaghetti': {'calories': 550, 'protein': 30, 'carbs': 70, 'fat': 18},
    'Brochette de bœuf': {'calories': 550, 'protein': 32, 'carbs': 65, 'fat': 17},
    'Macabo rappé': {'calories': 350, 'protein': 15, 'carbs': 45, 'fat': 12},
    'Soupe de gombo': {'calories': 400, 'protein': 18, 'carbs': 50, 'fat': 12},
    'Eru et waterfufu': {'calories': 700, 'protein': 28, 'carbs': 85, 'fat': 22}
}

# --- Fonctions utilitaires ---
def interpret_imc(imc):
    """Interpréter l'IMC selon la classification complète de l'OMS"""
    if imc < 16:
        return "Anorexie ou dénutrition"
    elif imc < 16.5:
        return "Maigreur"
    elif imc < 18.5:
        return "Maigreur"
    elif imc < 25:
        return "Corpulence normale"
    elif imc < 30:
        return "Surpoids"
    elif imc < 35:
        return "Obésité modérée (Classe 1)"
    elif imc < 40:
        return "Obésité élevé (Classe 2)"
    else:
        return "Obésité morbide ou massive"

def calculer_imc(poids, taille):
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

# --- Chargement des modèles et des fichiers de prétraitement ---
def load_assets():
    try:
        model = joblib.load('ML_menu/best_mlp_model.pkl')
        scaler = joblib.load('ML_menu/scaler.pkl')
        le_y = joblib.load('ML_menu/label_encoder_y.pkl')
        df_base = pd.read_csv("ML_menu/fich_pretraitement_final.csv")
        print("[INFO] Modèles ML chargés avec succès")
        return model, scaler, le_y, df_base
    except FileNotFoundError as e:
        print(f"[ERROR] Erreur de chargement de fichier ML: {e}")
        return None, None, None, None
    except Exception as e:
        print(f"[ERROR] Erreur inattendue lors du chargement ML: {e}")
        return None, None, None, None

# Charger les assets au démarrage
model, scaler, le_y, df_base = load_assets()

# --- Route GET pour la page nutrition ---
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

# --- Endpoint de prédiction avec le modèle ML ---
@bp.route('/nutrition', methods=['POST'])
def predict_nutrition():
    if model is None or scaler is None or le_y is None or df_base is None:
        return jsonify({"error": "Modèles ou fichiers de données manquants."}), 500

    try:
        # Vérification JSON
        if not request.is_json:
            return jsonify({"error": "Requête attendue en JSON"}), 400
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "JSON manquant ou mal formé"}), 400

        # --- Récupération données utilisateur ---
        poids = float(data.get("poids", 0))
        taille = float(data.get("taille", 0))
        preferences = data.get("preferences", [])
        user_id = session.get("user_id") or data.get("user_id") or 1
        user_data = get_user_complete_data(user_id)

        poids_num = poids or float(user_data.get("poids", 0))
        taille_num = taille or float(user_data.get("taille", 0))
        imc_info = calculer_imc(poids_num, taille_num)

        # fallback si âge ou sexe manquants
        age = user_data.get("age") or 30
        sexe = user_data.get("sexe", "homme")

        # --- Préparation features ---
        dummy_row = pd.DataFrame(columns=df_base.columns)
        dummy_row.loc[0, :] = 0
        dummy_row.loc[0, "sexe"] = 1 if sexe.lower() == "femme" else 0
        dummy_row.loc[0, "taille"] = taille_num
        dummy_row.loc[0, "poids"] = poids_num
        dummy_row.loc[0, "age"] = age
        dummy_row.loc[0, "imc"] = imc_info["imc"]

        # Nettoyage colonnes inutiles
        X_predict = dummy_row.drop(columns=["sexe", "taille", "poids", "age", "imc"], errors="ignore")
        X_predict = X_predict.drop(columns=["menu_encoded"], errors="ignore")

        # --- Prédiction probabiliste ---
        X_scaled = scaler.transform(X_predict)
        proba = model.predict_proba(X_scaled)[0]

        # Associer chaque menu à sa proba
        menus_proba = list(zip(le_y.inverse_transform(range(len(proba))), proba))
        menus_proba.sort(key=lambda x: -x[1])  # tri décroissant
        jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
        # Générer 7 menus
        menus_choisis = []
        last_menu = None
        repetition_count = 0

        for i, jour in enumerate(jours): #tirage pondéré
            candidats, poids_proba = zip(*menus_proba)
            choisi = random.choices(candidats, weights=poids_proba, k=1)[0]

            # Vérifier règle de répétition
            if last_menu == choisi:
                if repetition_count >= 2:
                    # forcer un autre choix
                    autres = [m for m in candidats if m != last_menu]
                    choisi = random.choice(autres)
                    repetition_count = 1
                else:
                    repetition_count += 1
            else:
                repetition_count = 1
            last_menu = choisi

            info = menu_details.get(choisi, {"calories": 500, "protein": 20, "carbs": 50, "fat": 15})
            menus_choisis.append({
                "jour": jours[i],
                "name": choisi,
                "calories": info["calories"],
                "protein": info["protein"],
                "carbs": info["carbs"],
                "fat": info["fat"]
            })

        total_calories = sum(m["calories"] for m in menus_choisis)

        response_data = {
            "imc_info": imc_info,
            "user_data": {
                "sexe": sexe,
                "age": age,
                "poids": poids_num,
                "taille": taille_num
            },
            "nutrition": {"repas": menus_choisis},
            "total_calories": total_calories,
            "source_menu": "IA",
            "categorie": imc_info["interpretation"]
        }

        return jsonify(response_data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@bp.route('/paiement')
def paiement_page():
    plats = request.args.get('plats', '')
    return render_template('paiement.html', plats=plats)


