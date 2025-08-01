document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const data = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        name: document.getElementById('name').value,
        renom: document.getElementById('renom').value,
        annee_naissance: parseInt(document.getElementById('annee_naissance').value),
        sexe: document.getElementById('sexe').value,
        poids: parseFloat(document.getElementById('poids').value),
        taille: parseFloat(document.getElementById('taille').value)
    };

    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message || 'Compte créé !');
        if (result.user_id) {
            window.location.href = `/profil?user_id=${result.user_id}`;
        } else {
            window.location.href = '/profil';
        }
    })
    .catch(error => alert('Erreur : ' + error));
});


document.getElementById('btn-login').addEventListener('click', function() {
    // On récupère email et password
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        alert('Merci de remplir votre email et mot de passe avant de vous connecter.');
        return;
    }

    // Ici tu peux faire la logique de "connexion"
    // Pour l’exemple, imaginons qu’on envoie une requête POST /api/login
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Connexion réussie !');
            // Redirige vers le profil ou la page d’accueil
            window.location.href = `/profil?user_id=${result.user_id}`;
        } else {
            alert(result.error || 'Erreur lors de la connexion');
        }
    })
    .catch(error => alert('Erreur: ' + error));
});

