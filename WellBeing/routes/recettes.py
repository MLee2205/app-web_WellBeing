from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
import json
import re

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

@bp.route('/recettes', methods=['POST'])
def generate_recettes():
    data = request.get_json(silent=True) or {}
    plats = data.get('plats', [])
    if not plats:
        return jsonify({"error": "Aucun plat fourni."}), 400

    recettes = []
    model = genai.GenerativeModel('gemini-1.5-flash-latest')

    for plat in plats:
        prompt = f"""
Tu es un chef cuisinier expert.
Donne-moi une recette simple et claire pour préparer : "{plat}".
IMPORTANT : Réponds STRICTEMENT avec un JSON :
{{"name":"Nom du plat","recette":"Texte"}}
"""
        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            print(f"[DEBUG] Réponse brute Gemini pour '{plat}': {text}")
            parsed = parse_ai_response(text)
            if parsed and 'recette' in parsed:
                recettes.append({
                    "name": parsed.get('name', plat),
                    "recette": parsed['recette']
                })
            else:
                recettes.append({
                    "name": plat,
                    "recette": "❌ Impossible de générer la recette (réponse invalide)"
                })
        except Exception as e:
            print(f"[ERROR] Erreur pour le plat '{plat}': {e}")
            recettes.append({
                "name": plat,
                "recette": f"❌ Erreur lors de la génération: {e}"
            })

    return jsonify({"recettes": recettes})

