from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
import json
import re
from datetime import datetime

bp = Blueprint('recettes', __name__)
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

def parse_ai_response(text):
    """Parse la réponse IA (JSON)"""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return None

@bp.route('/recettes', methods=['POST'])  # Changé pour correspondre à l'appel JS
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
    model = genai.GenerativeModel('gemini-1.5-flash-latest')

    for plat in plats:
        prompt = f"""
Tu es un chef cuisinier expert.
Donne-moi une recette simple et claire pour préparer : "{plat}".

INSTRUCTIONS IMPORTANTES :
1. La recette doit être détaillée avec des étapes claires
2. Inclure les ingrédients avec leurs quantités
3. Donner le temps de préparation et de cuisson
4. Mentionner le niveau de difficulté
5. Ajouter des conseils de préparation si nécessaire

IMPORTANT : Réponds STRICTEMENT avec un JSON :
{{
  "name": "Nom du plat",
  "recette": "Texte détaillé de la recette avec ingrédients et étapes",
  "temps_preparation": "XX minutes",
  "temps_cuisson": "XX minutes", 
  "difficulte": "Facile/Intermédiaire/Difficile",
  "conseils": "Conseils optionnels"
}}
"""
        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            print(f"[DEBUG] Réponse brute Gemini pour '{plat}': {text}")
            
            parsed = parse_ai_response(text)
            if parsed and 'recette' in parsed:
                recettes.append({
                    "name": parsed.get('name', plat),
                    "recette": parsed['recette'],
                    "temps_preparation": parsed.get('temps_preparation', 'Non spécifié'),
                    "temps_cuisson": parsed.get('temps_cuisson', 'Non spécifié'),
                    "difficulte": parsed.get('difficulte', 'Non spécifié'),
                    "conseils": parsed.get('conseils', '')
                })
            else:
                # Fallback si la réponse n'est pas au format JSON
                recettes.append({
                    "name": plat,
                    "recette": f"🍳 **{plat}**\n\n📝 Recette générée par WellBeing:\n\n{text}\n\n*Note: Cette recette a été générée automatiquement par notre IA culinaire.*",
                    "temps_preparation": "À déterminer",
                    "temps_cuisson": "À déterminer",
                    "difficulte": "Variable",
                    "conseils": "Ajustez les assaisonnements selon vos préférences."
                })
                
        except Exception as e:
            print(f"[ERROR] Erreur pour le plat '{plat}': {e}")
            recettes.append({
                "name": plat,
                "recette": f"❌ **Erreur de génération**\n\nImpossible de générer la recette pour '{plat}'. Veuillez réessayer.\n\nErreur technique: {str(e)}",
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
