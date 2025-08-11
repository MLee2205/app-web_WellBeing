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



##Notes techniques

    Toutes les requêtes POST utilisent Content-Type: application/json

    Toutes les réponses sont en JSON sauf /api/nutrition (GET) qui rend une page HTML pour le front

    Projet basé sur Flask, Gemini API et fallback local
 lancé d abprd le serveur sur le port 5000 avant de tester les requetes
 
## Auteurs

    Meffo Lea
