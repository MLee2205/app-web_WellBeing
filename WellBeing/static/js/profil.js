const urlParams = new URLSearchParams(window.location.search);
let userId = urlParams.get('user_id') || 1;

// Charger le profil
fetch(`/api/profile/${userId}`)
.then(res => res.json())
.then(data => {
    document.getElementById('email').value = data.email || '';
    document.getElementById('name').value = data.name || '';
    document.getElementById('renom').value = data.renom || '';
    document.getElementById('date_naissance').value = data.date_naissance || '';
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
        date_naissance: document.getElementById('date_naissance').value,
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

document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = '/api/logout';

});


 // Initialize particles.js
 document.addEventListener('DOMContentLoaded', function() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: ["#6366f1", "#22c55e", "#f59e0b", "#a855f7"] },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.3 } },
                size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 1 } },
                line_linked: { 
                    enable: true, 
                    distance: 150, 
                    color: "#ffffff", 
                    opacity: 0.2, 
                    width: 1 
                },
                move: { 
                    enable: true, 
                    speed: 2, 
                    direction: "none", 
                    random: true, 
                    straight: false, 
                    out_mode: "out" 
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" }
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 0.5 } },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }

    // Navigation scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const menuLines = document.querySelectorAll('.menu-line');
    let isMenuOpen = false;

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            isMenuOpen = !isMenuOpen;
            navLinks.classList.toggle('active');
            
            if (isMenuOpen) {
                menuLines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                menuLines[1].style.opacity = '0';
                menuLines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                menuLines.forEach(line => {
                    line.style.transform = '';
                    line.style.opacity = '';
                });
            }
        });
    }

});
