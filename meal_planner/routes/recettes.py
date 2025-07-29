from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os

bp = Blueprint('recettes', __name__)

# Configurer Gemini avec la clé d'API depuis les variables d'environnement
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

@bp.route('/recettes', methods=['POST'])
def generate_recettes():
    """
    Génère des recettes pour une liste de plats donnée.
    Renvoie un JSON contenant la recette générée pour chaque plat.
    """
    try:
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

IMPORTANT :
- Répond STRICTEMENT et UNIQUEMENT avec un bloc JSON complet et valide.
- N'écris absolument aucun texte avant ou après, aucune explication.
- Utilise exactement les clés suivantes, en français : "name" et "recette".

Le JSON doit commencer directement par {{ et finir par }}.

Exemple attendu :
{{
  "name": "{plat}",
  "recette": "Texte de la recette étape par étape"
}}
"""
            try:
                # Appel à Gemini
                response = model.generate_content(prompt)
                text = response.text.strip()

                print(f"[DEBUG] Réponse brute Gemini pour '{plat}': {text}")

                recettes.append({
                    "name": plat,
                    "raw_response": text
                })

            except Exception as e:
                print(f"[ERROR] Erreur pour le plat '{plat}': {e}")
                recettes.append({
                    "name": plat,
                    "raw_response": f"Erreur lors de la génération de la recette: {e}"
                })

        return jsonify({"recettes": recettes})

    except Exception as e:
        print(f"[ERROR] Erreur générale dans /recettes: {e}")
        return jsonify({"error": str(e)}), 500

