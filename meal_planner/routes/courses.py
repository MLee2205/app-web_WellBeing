from flask import Blueprint, request, render_template

bp = Blueprint('courses', __name__)

@bp.route('/courses')
def courses_page():
    plats = request.args.get('plats', '')
    plats_list = plats.split(',') if plats else []

    recettes = []
    for p in plats_list:
        recettes.append({
            "name": p,
            "ingredients": [
                "Ingrédient 1 pour " + p,
                "Ingrédient 2 pour " + p
            ]
        })

    return render_template('courses.html', recettes=recettes)

