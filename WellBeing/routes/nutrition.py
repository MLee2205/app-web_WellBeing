from flask import Blueprint, request, jsonify, session, render_template

import google.generativeai as genai
import os
import json
import random
from ..models.user import User
from datetime import datetime,date
import re

try:
    import joblib
    import pandas as pd
    from sklearn.preprocessing import StandardScaler
    from sklearn.ensemble import RandomForestClassifier
    ML_AVAILABLE = True
except ImportError as e:
    print(f"[WARNING] ML dependencies not available: {e}")
    ML_AVAILABLE = False
    joblib = None
    pd = None
    
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
        print("[ERROR] Modèles ML non disponibles")
        return jsonify({"error": "Modèles ou fichiers de données manquants."}), 500

    try:
        # Vérifier que la requête est bien JSON
        if not request.is_json:
            print("[ERROR] Requête non JSON. Headers:", dict(request.headers))
            return jsonify({"error": "Requête attendue en JSON (Content-Type: application/json)"}), 400

        data = request.get_json(silent=True)
        if data is None:
            print("[ERROR] request.get_json() a renvoyé None")
            return jsonify({"error": "JSON manquant ou mal formé"}), 400

        print("[DEBUG] Données reçues:", data)
        
        # Récupération des données utilisateur
        poids = data.get('poids')
        taille = data.get('taille')
        fasting_data = data.get('fasting') or {}
        fasting_type = fasting_data.get('type', '') if fasting_data else ''
        fasting_start = fasting_data.get('start', '') if fasting_data else ''
        fasting_end = fasting_data.get('end', '') if fasting_data else ''
        preferences = data.get('preferences', [])
        user_id = session.get('user_id') or data.get('user_id') or 1

        # Récupérer les données utilisateur complètes
        user_data = get_user_complete_data(user_id)

        # Calcul de l'IMC — priorité aux valeurs envoyées
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

        # Récupérer l'âge et le sexe depuis les données utilisateur ou fallback
        age = user_data.get('age')
        sexe = user_data.get('sexe', 'Non renseigné')
        
        # Convertir âge en nombre si c'est une chaîne
        if isinstance(age, str) and age != 'Non renseigné':
            try:
                age = int(age)
            except ValueError:
                age = 30  # Fallback
        elif age == 'Non renseigné' or age is None:
            age = 30  # Fallback
        
        # Convertir sexe pour le modèle
        if sexe == 'Non renseigné':
            sexe = 'homme'  # Fallback
        
        print(f"[INFO] Données pour ML - Age: {age}, Sexe: {sexe}")

        # Préparation des données pour le modèle
        # Créer une ligne avec des valeurs par défaut
        dummy_row = pd.DataFrame(columns=df_base.columns)
        dummy_row.loc[0, :] = 0
        
        # Remplir les données de base
        dummy_row.loc[0, 'sexe'] = 1 if sexe.lower() == 'femme' else 0
        dummy_row.loc[0, 'taille'] = taille_num
        dummy_row.loc[0, 'poids'] = poids_num
        dummy_row.loc[0, 'age'] = age
        dummy_row.loc[0, 'imc'] = imc_info['imc']
        
        # Encodage de l'interprétation IMC
        interpretation_imc = imc_info['interpretation'].replace(" ", "_").replace("(", "").replace(")", "")
        imc_col = f'interpretation_imc_{interpretation_imc}'
        if imc_col in dummy_row.columns:
            dummy_row.loc[0, imc_col] = 1

        # Encodage du type de jeûne
        if fasting_type:
            fasting_col = f'type_jeun_{fasting_type}'
            if fasting_col in dummy_row.columns:
                dummy_row.loc[0, fasting_col] = 1

        # Encodage de l'horaire de jeûne
        def get_fasting_hours(start, end):
            if not start or not end:
                return "Aucun"
            try:
                start_hour = int(start.split(':')[0])
                end_hour = int(end.split(':')[0])
                
                if start_hour == 20 and end_hour == 8: return '20h_8h'
                if start_hour == 19 and end_hour == 7: return '19h_7h'
                if start_hour == 18 and end_hour == 8: return '18h_8h'
                
                return "Aucun"
            except:
                return "Aucun"

        horaire_jeun = get_fasting_hours(fasting_start, fasting_end)
        horaire_col = f'horaire_jeun_{horaire_jeun}'
        if horaire_col in dummy_row.columns:
            dummy_row.loc[0, horaire_col] = 1

        # Encodage des préférences
        for pref in preferences:
            pref_col = f'preferences_alimentaires_{pref.replace(" ", "_")}'
            if pref_col in dummy_row.columns:
                dummy_row.loc[0, pref_col] = 1
        
        # --- DÉBUT DU CORRECTIF ---
        # Le modèle et le scaler ont été entraînés sur un DataFrame qui ne contient pas les colonnes brutes
        # comme 'sexe', 'taille', 'poids', etc., mais seulement les colonnes encodées.
        # Il faut donc les retirer avant de faire la prédiction.
        features_to_drop = ['sexe', 'taille', 'poids', 'age', 'imc']
        X_predict = dummy_row.drop(columns=features_to_drop, errors='ignore')

        # Il faut aussi enlever la colonne cible 'menu_encoded' si elle existe
        X_predict = X_predict.drop(columns=['menu_encoded'], errors='ignore')
        # --- FIN DU CORRECTIF ---

        # Scaling et prédiction
        X_predict_scaled = scaler.transform(X_predict)
        predicted_menu_encoded = model.predict(X_predict_scaled)
        predicted_menu_name = le_y.inverse_transform(predicted_menu_encoded)[0]

        print(f"[INFO] Menu prédit par ML: {predicted_menu_name}")

        # Récupération des informations nutritionnelles
        menu_info = menu_details.get(predicted_menu_name, {'calories': 500, 'protein': 20, 'carbs': 50, 'fat': 15})

        # Structure de menu complète (compatible avec l'ancien format)
        menu_structure = {
           "repas": [{
                   "name": predicted_menu_name,
                   "calories": menu_info['calories'],
                   "protein": menu_info['protein'],
                   "carbs": menu_info['carbs'],
                   "fat": menu_info['fat']
    }]
}


        # Calculer total calories
        total_calories = sum(item["calories"] for repas in menu_structure.values() for item in repas)

        # Historique IMC simulé
        historique_imc = [
            {"date": "2025-06-01", "imc": 21.5},
            {"date": "2025-06-15", "imc": 22.0},
            {"date": "2025-07-01", "imc": 21.8}
        ]

        # Structure de réponse compatible avec le JavaScript
        response_data = {
            "imc_info": imc_info,
            "user_data": {
                "sexe": sexe,
                "age": age,
                "poids": poids_num,
                "taille": taille_num
            },
            "imc_history": historique_imc,
            "nutrition": menu_structure,
            "total_calories": total_calories,
            "source_menu": "IA",
            "raw_response": f"Menu prédit par modèle ML: {predicted_menu_name}",
            "categorie": imc_info['interpretation']
        }
        
        print("[SUCCESS] Réponse ML générée avec succès")
        return jsonify(response_data)
        
    except Exception as e:
        import traceback
        print(f"[ERROR] Exception dans predict_nutrition: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Erreur interne: {str(e)}'}), 500


@bp.route('/paiement')
def paiement_page():
    plats = request.args.get('plats', '')
    return render_template('paiement.html', plats=plats)


