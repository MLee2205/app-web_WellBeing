from flask import Blueprint, request, jsonify
import cohere
import os

bp = Blueprint('recettes', __name__)
co = cohere.Client(os.environ.get('COHERE_API_KEY'))

@bp.route('/recettes', methods=['POST'])
def generate_recettes():
    data = request.get_json()
    plats = data.get('plats', [])
    recettes = []

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
            response = co.generate(
                model='command-light',
                prompt=prompt,
                max_tokens=300
            )
            text = response.generations[0].text.strip()
            print(f"Réponse brute Cohere pour {plat}:", text)

            # Au lieu de parser, on renvoie directement le texte brut
            recettes.append({
                "name": plat,
                "raw_response": text
            })

        except Exception as e:
            print(f"Erreur pour le plat {plat} :", e)
            recettes.append({
                "name": plat,
                "raw_response": f"Erreur lors de la génération de la recette: {e}"
            })

    return jsonify({"recettes": recettes})

