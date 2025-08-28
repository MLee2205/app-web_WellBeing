from flask import Blueprint, request, jsonify, render_template
import random
import time

bp = Blueprint('paiement', __name__)

@bp.route('/paiement', methods=['GET'])
def paiement_page():
    plats = request.args.get('plats', '')
    user_id = request.args.get('user_id', 'guest')
    return render_template('paiement.html', plats=plats, user_id=user_id)

@bp.route('/process-payment', methods=['POST'])
def process_payment():
    """Traite le paiement pour un abonnement"""
    try:
        data = request.get_json()
        duration = data.get('duration', 1)
        price = data.get('price', 1000)
        phone = data.get('phone')
        user_id = data.get('user_id', 'guest')
        plats = data.get('plats', '')
        
        # Validation des données
        if not phone:
            return jsonify({
                "success": False,
                "message": "Numéro de téléphone requis"
            }), 400
        
        # Validation du numéro de téléphone
        if not phone.startswith('6') or len(phone) != 9:
            return jsonify({
                "success": False,
                "message": "Numéro de téléphone invalide"
            }), 400
        
        # Validation de la durée d'abonnement
        if duration not in [1, 3, 12]:
            return jsonify({
                "success": False,
                "message": "Durée d'abonnement non valide"
            }), 400
        
        print(f"[INFO] Traitement paiement abonnement: User {user_id}, {duration} mois - {phone} - {price} FCFA")
        
        # Simuler un traitement de paiement
        # Générer un ID de transaction simulé
        transaction_id = f"SUB_{user_id}_{duration}M_{int(time.time())}{random.randint(1000, 9999)}"
        
        # Simuler un délai de traitement réaliste
        time.sleep(2)
        
        # Simuler une réponse réussie (90% de succès pour la démo)
        success = random.random() > 0.1
        
        if success:
            print(f"[SUCCESS] Paiement réussi - User: {user_id}, Transaction ID: {transaction_id}")
            return jsonify({
                "success": True,
                "message": "Paiement traité avec succès",
                "transaction_id": transaction_id,
                "duration": duration,
                "price": price,
                "phone": phone,
                "user_id": user_id,
                "timestamp": time.time()
            })
        else:
            # Simuler différents types d'erreurs
            error_messages = [
                "Solde insuffisant sur votre compte",
                "Transaction refusée par l'opérateur",
                "Limite de transaction dépassée",
                "Numéro de compte inactif"
            ]
            error_message = random.choice(error_messages)
            
            print(f"[ERROR] Paiement échoué - User: {user_id}, Erreur: {error_message}")
            return jsonify({
                "success": False,
                "message": error_message,
                "error_code": "PAYMENT_FAILED",
                "transaction_id": transaction_id
            }), 400
            
    except Exception as e:
        print(f"[ERROR] Exception lors du traitement du paiement: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Erreur technique lors du traitement: {str(e)}",
            "error_code": "TECHNICAL_ERROR"
        }), 500   
        
@bp.route('/verify-payment', methods=['POST'])
def verify_payment():
    """Vérifie le statut d'un paiement"""
    try:
        data = request.get_json()
        transaction_id = data.get('transaction_id')
        
        if not transaction_id:
            return jsonify({
                "success": False,
                "message": "ID de transaction manquant"
            }), 400
        
        # En production, vous vérifieriez le statut auprès de l'API de l'opérateur
        # Ici on simule une vérification réussie
        return jsonify({
            "success": True,
            "status": "completed",
            "transaction_id": transaction_id,
            "verified_at": time.time()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Erreur lors de la vérification: {str(e)}"
        }), 500