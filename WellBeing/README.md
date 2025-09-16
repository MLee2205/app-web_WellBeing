## Commande de test en local
python3 app.py


#  WellBeing – API Documentation

> Application Flask pour nutrition personnalisée, calcul IMC et génération de menus et recettes grâce à l'IA.

Toutes les routes API sont sous le préfixe :  
**http://127.0.0.1:5000/api**



##  Authentification et profil

###  POST `/api/register`  
Créer un utilisateur

#### requete
curl -X POST http://127.0.0.1:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lea2@example.com",
    "password": "123456",
    "name": "Lea",
    "renom": "Meffo",
    "annee_naissance": 2000,
    "sexe": "F",
    "poids": 65,
    "taille": 170
  }'


**Body JSON :**
```json
{
  "email": "lea2@example.com",
  "password": "123456",
  "name": "Lea",
  "renom": "Meffo",
  "annee_naissance": 2000,
  "sexe": "F",
  "poids": 65,
  "taille": 170
}

{
  "message": "Utilisateur créé avec succès",
  "user_id": 42
}
```

### /api/profile/<user_id> (GET) → récupérer le profil
#### requete
curl http://127.0.0.1:5000/api/profile/42


### /api/profile/<user_id> (PUT) → modifier le profil
#### requete
curl -X PUT http://127.0.0.1:5000/api/profile/42 \
  -H "Content-Type: application/json" \
  -d '{
    "poids": 68,
    "taille": 172
  }'
  
  
 
###   /api/nutrition (POST) → calculer IMC et menu
   
#### requete  
   curl -X POST http://127.0.0.1:5000/api/nutrition \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 42,
    "preferences": ["végétarien", "sans gluten"],
    "menu_original": ["Ndolé", "Poisson braisé", "Pizza", "Spaghetti"],
    "poids": 68,
    "taille": 172
  }'


### /api/nutrition (GET) → charger la page nutrition
 
#### requete
 
 curl http://127.0.0.1:5000/api/nutrition?user_id=42


/api/recettes (POST) → générer recettes

curl -X POST http://127.0.0.1:5000/api/recettes \
  -H "Content-Type: application/json" \
  -d '{
    "plats": ["Ndolé", "Poisson braisé", "Pizza", "Spaghetti"]
  }' 
 
### /api/menus (GET) → menus variés
  
  
#### requete
  curl http://127.0.0.1:5000/api/menus
  
  	    Par défaut c’est « mixed », mais nous pouvons ajouter ?diet=vegetarian ou ?diet=low-carb :

curl http://127.0.0.1:5000/api/menus?diet=vegetarian


### /api/menus/preferences (GET) → options régime

####requete
curl http://127.0.0.1:5000/api/menus/preferences




### /api/menus/random (GET) → random menu
#### requete

curl http://127.0.0.1:5000/api/menus/random

### //api/login (POST) : connexion du user ayant deja un code 
####requete
curl -X POST http://127.0.0.1:5000/api/login   -H "Content-Type: application/json"   -d '{"email":"cc@gmail.com", "password":"cc"}'
{
  "message": "Connexion r\u00e9ussie",
  "success": true,
  "user_id": 43
}



### /api/logout (POST) → suppression du compte et déconnexion
###Description
Supprime le compte de l’utilisateur connecté et vide la session.
La requête doit contenir confirm=yes dans le body.

#Requête login (pour récupérer le cookie de session)


#### requete on recupere d avoir le user sous forme de cookie dans .txt avant de taper curl pour supprimer
curl -X POST http://127.0.0.1:5000/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"paul@gmail.com", "password":"paul"}'
  
  
{
  "message": "Connexion r\u00e9ussie",
  "success": true,
  "user_id": 4
}

#Requête logout (utiliser le cookie de session obtenu)

curl -b cookies.txt -L http://127.0.0.1:5000/api/logout



------------------------------------------------------------------------------------------
# MACHINE LEARNING

----------------------------------------------------------------------------------------











##Nouvelles routes avec utilisation du machine learning

### EXPLIcation
📖 Documentation des Routes API WellBeing

Ce document fournit un aperçu des points d'entrée (endpoints) de l'API Flask de l'application WellBeing, regroupés par fonctionnalité.

##1. Gestion des Recettes

Ces routes gèrent la récupération et la génération de recettes de cuisine. Elles utilisent un fichier CSV comme base de données pour les recettes.

    Route : /recettes

    Méthode : POST

    Description : Génère une liste de recettes à partir des noms de plats fournis dans la requête.

    Corps de la requête (JSON) :

        plats (tableau de chaînes de caractères) : Noms des plats pour lesquels l'utilisateur souhaite obtenir les recettes.

    Réponse (JSON) :

        success (booléen) : True si l'opération est réussie.

        recettes (tableau d'objets) : Contient les détails des recettes trouvées, incluant le nom, la préparation, et les informations nutritionnelles simulées.

        error (chaîne de caractères) : Présent en cas d'erreur.
      
     exemple de requetes
     	curl -X POST http://127.0.0.1:5000/recettes \
		  -H "Content-Type: application/json" \
		  -d '{"plats": ["Poulet DG", "Ndolé"]}'

##2. Gestion de la Nutrition

Ces routes gèrent le calcul de l'IMC et la prédiction de menus personnalisés basés sur des modèles d'apprentissage automatique.

    Route : /nutrition

    Méthode : GET

    Description : Charge et affiche la page web de nutrition. Cette route récupère les données de l'utilisateur (poids, taille, âge, sexe) à partir de sa session ou de la base de données.

    Paramètres de requête (Query parameters) :

        user_id (facultatif) : L'identifiant de l'utilisateur.

    Route : /nutrition

    Méthode : POST

    Description : Prédit un menu personnalisé en se basant sur les données utilisateur et des modèles ML. Cette route calcule également l'IMC et renvoie les informations nutritionnelles.

    Corps de la requête (JSON) :

        poids (nombre) : Poids de l'utilisateur en kg.

        taille (nombre) : Taille de l'utilisateur en cm.

        fasting (objet, facultatif) : Informations sur le jeûne intermittent (type, start, end).

        preferences (tableau de chaînes de caractères, facultatif) : Préférences alimentaires (ex. ["vegetarian", "low-carb"]).

    Réponse (JSON) :

        imc_info (objet) : Détails sur l'IMC calculé.

        nutrition (objet) : Menus personnalisés et informations nutritionnelles.

        total_calories (nombre) : Nombre total de calories.

        source_menu (chaîne de caractères) : Indique la source du menu ("IA").

##3. Gestion des Menus

Ces routes permettent de récupérer des menus prédéfinis et des options de préférence alimentaire.

    Route : /menus/preferences

    Méthode : GET

    Description : Renvoie une liste d'options de préférences alimentaires disponibles pour l'application.

    Réponse (JSON) :

        dietary_options (tableau d'objets) : Chaque objet contient une value et un label pour les préférences (ex. mixed, vegetarian).

		---------------------------------------------------------
    Route : /menus/random

    Méthode : GET

    Description : Fournit des exemples de menus prédéfinis (menus de secours) en cas de défaillance des modèles ML.

    Réponse (JSON) :

        menus (tableau d'objets) : Liste de menus de secours.

        source (chaîne de caractères) : Indique la source ("random_fallback").

##4. Gestion des Paiements

Ces routes simulent le processus de paiement pour un abonnement et sa vérification.

    Route : /paiement

    Méthode : GET

    Description : Affiche la page HTML de paiement.

    Paramètres de requête (Query parameters) :

        plats (chaîne de caractères, facultatif) : Liste de plats pour le contexte du paiement.

        user_id (chaîne de caractères, facultatif) : L'identifiant de l'utilisateur.

    Route : /process-payment

    Méthode : POST

    Description : Simule le traitement d'un paiement pour un abonnement. Effectue des validations sur les données reçues.

    Corps de la requête (JSON) :

        duration (nombre) : Durée de l'abonnement en mois (1, 3, ou 12).

        price (nombre) : Prix de l'abonnement.

        phone (chaîne de caractères) : Numéro de téléphone pour la transaction.

        user_id (chaîne de caractères) : Identifiant de l'utilisateur.

    Réponse (JSON) :

        success (booléen) : True ou False selon le résultat de la simulation.

        message (chaîne de caractères) : Message d'état de la transaction.

        transaction_id (chaîne de caractères) : ID unique de la transaction.
        
     exemple de requete:
     	curl -X POST http://127.0.0.1:5000/process-payment \
		  -H "Content-Type: application/json" \
		  -d '{
		    "duration": 3,
		    "price": 2500,
		    "phone": "699000000",
		    "user_id": 1
		}'

    Route : /verify-payment

    Méthode : POST

    Description : Simule la vérification du statut d'une transaction de paiement.

    Corps de la requête (JSON) :

        transaction_id (chaîne de caractères) : ID de la transaction à vérifier.

    Réponse (JSON) :

        success (booléen) : True si la vérification réussit.

        status (chaîne de caractères) : Statut de la transaction (ex. "completed").

##5. Gestion des Utilisateurs

Ces routes gèrent les opérations d'authentification et de gestion de profil utilisateur, telles que l'inscription, la connexion, et la déconnexion.
		------------------------------------------------------------------

    Route : /check_session

    Méthode : GET

    Description : Vérifie si l'utilisateur est actuellement connecté en consultant sa session.

    Réponse (JSON) :

        logged_in (booléen) : True si l'utilisateur est connecté, sinon False.

		----------------------------------------------------------------

    Route : /register

    Méthode : POST

    Description : Crée un nouvel utilisateur dans la base de données. L'utilisateur est automatiquement connecté après une inscription réussie.

    Corps de la requête (JSON) :

        email (chaîne de caractères) : L'adresse email de l'utilisateur (requise).

        password (chaîne de caractères) : Le mot de passe (requis).

        Autres champs (facultatifs) : name, renom, date_naissance, sexe, poids, taille.

    Réponse (JSON) :

        message (chaîne de caractères) : Message de succès.

        user_id (nombre) : L'identifiant du nouvel utilisateur.

        redirect (chaîne de caractères) : Chemin de redirection après l'inscription.

     Exemple de requete
     		curl -X POST http://127.0.0.1:5000/register \
			  -H "Content-Type: application/json" \
			  -d '{
			    "email": "user@example.com",
			    "password": "strongpassword",
			    "name": "Jean",
			    "date_naissance": "1990-01-01",
			    "sexe": "homme",
			    "poids": 75,
			    "taille": 175
		}'		
		----------------------------------------------------------

    Route : /profile/<int:user_id>

    Méthode : GET

    Description : Récupère les informations de profil d'un utilisateur. Requiert une connexion. L'utilisateur ne peut accéder qu'à son propre profil.

    Réponse (JSON) :

        Contient les détails du profil utilisateur.*
        
     exemple de requete
     	curl http://127.0.0.1:5000/api/profile/42
		---------------------------------------------------
    Route : /profile/<int:user_id>
		
    Méthode : PUT

    Description : Met à jour les informations de profil d'un utilisateur. Requiert une connexion. L'utilisateur ne peut modifier que son propre profil.

    Corps de la requête (JSON) :

        Contient les champs à mettre à jour.

    Réponse (JSON) :

        message (chaîne de caractères) : Message de succès.
        
      exemple de requete
      		curl -X PUT http://127.0.0.1:5000/profile/1 \
			  -H "Content-Type: application/json" \
			  -b cookies.txt \
			  -d '{
			    "poids": 73,
			    "taille": 175
			}'  
      
		------------------------------------------------------
		
    Route : /login

    Méthode : POST

    Description : Authentifie un utilisateur et initialise sa session.

    Corps de la requête (JSON) :

        email (chaîne de caractères) : Email de l'utilisateur.

        password (chaîne de caractères) : Mot de passe.

    Réponse (JSON) :

        success (booléen) : True en cas de succès.

        user_id (nombre) : L'identifiant de l'utilisateur.

        error (chaîne de caractères) : Message d'erreur en cas d'échec.
	 Exemple de requete:
	 	curl -X POST http://127.0.0.1:5000/login \
			  -H "Content-Type: application/json" \
			  -c cookies.txt \
			  -d '{"email":"user@example.com", "password":"strongpassword"}'
    
    		---------------------------------------------
    
    Route : /logout
		
    Méthode : GET

    Description : Déconnecte l'utilisateur en supprimant ses informations de la session et le redirige vers la page d'accueil.

    Réponse :

        Redirection HTTP.

     exemple de requete
     		curl -X GET http://127.0.0.1:5000/logout \
  			-b cookies.txt





## Nouvelles URL

/api/check_session ( GET) Vérifier si l'utilisateur est déjà connecté
/api/profile/<int:user_id>  (GET) :ajout du decorateur pour les routes protegées lorsue l utilisateur n est pas conectées
/api/pdfs (GET) :recuperer toutles pdfs de l utilisateur connectées
/api/pdf/<int:pdf_id> (GET) telecharger un pdf specifique de l utilisteur
/api/pdf (POST) :telecharger un pdf specifique de l uilisateur


##Notes techniques

    Toutes les requêtes POST utilisent Content-Type: application/json

    Toutes les réponses sont en JSON sauf /api/nutrition (GET) qui rend une page HTML pour le front

    Projet basé sur Flask, Gemini API et fallback local
 lancé d abprd le serveur sur le port 5000 avant de tester les requetes
 
## Auteurs

    Meffo Lea
