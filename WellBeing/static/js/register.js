document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const data = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        name: document.getElementById('name').value,
        renom: document.getElementById('renom').value,
        date_naissance: document.getElementById('date_naissance').value,
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

// Initialisation des particules
document.addEventListener('DOMContentLoaded', function() {
    particlesJS('particles-js', {
        "particles": {
            "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#ffffff" },
            "shape": { "type": "circle", "stroke": { "width": 0, "color": "#000000" } },
            "opacity": { "value": 0.5, "random": true, "anim": { "enable": false } },
            "size": { "value": 3, "random": true, "anim": { "enable": false } },
            "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.2, "width": 1 },
            "move": { "enable": true, "speed": 2, "direction": "none", "random": true, "straight": false, "out_mode": "out" }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": { "enable": true, "mode": "grab" },
                "onclick": { "enable": true, "mode": "push" },
                "resize": true
            },
            "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } } }
        },
        "retina_detect": true
    });
    
    // Animation de la navbar au scroll
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});