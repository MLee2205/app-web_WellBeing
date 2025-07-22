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

