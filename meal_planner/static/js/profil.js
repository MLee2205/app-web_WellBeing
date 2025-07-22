const urlParams = new URLSearchParams(window.location.search);
let userId = urlParams.get('user_id') || 1;

// Charger le profil
fetch(`/api/profile/${userId}`)
.then(res => res.json())
.then(data => {
    document.getElementById('email').value = data.email || '';
    document.getElementById('name').value = data.name || '';
    document.getElementById('renom').value = data.renom || '';
    document.getElementById('annee_naissance').value = data.annee_naissance || '';
    document.getElementById('sexe').value = data.sexe || '';
    document.getElementById('poids').value = data.poids || '';
    document.getElementById('taille').value = data.taille || '';
})
.catch(err => alert('Erreur chargement: ' + err));

// Sauvegarder
document.getElementById('profileForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = {
        email: document.getElementById('email').value,
        name: document.getElementById('name').value,
        renom: document.getElementById('renom').value,
        annee_naissance: parseInt(document.getElementById('annee_naissance').value),
        sexe: document.getElementById('sexe').value,
        poids: parseFloat(document.getElementById('poids').value),
        taille: parseFloat(document.getElementById('taille').value)
    };
    fetch(`/api/profile/${userId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => alert(result.message || 'Profil mis à jour !'))
    .catch(err => alert('Erreur : ' + err));
});

// Aller vers nutrition
document.getElementById('goToNutritionBtn').addEventListener('click', () => {
    window.location.href = '/nutrition';
});

