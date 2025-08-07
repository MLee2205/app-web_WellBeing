from flask import Blueprint, render_template, redirect, request, session, url_for
from models.user import db, User

bp = Blueprint('logout', __name__)

@bp.route('/logout', methods=['GET', 'POST'])
def delete_account():
    if request.method == 'POST':
        if request.form['confirm'] == 'yes':
            user_id = session.get('user_id')
            if user_id:
                delete_user(user_id)
                session.clear()
                #return jsonify({"message": "Compte supprimé, déconnexion réussie", "success": True})
                return redirect(url_for('home'))  # redirige vers accueil
        #return jsonify({"message": "Suppression annulée", "success": False})
        return redirect('/register')  # s’il a cliqué sur "Non"
    return render_template('logout.html')

def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()


