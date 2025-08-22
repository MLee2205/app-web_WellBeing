
// Particles.js configuration
document.addEventListener('DOMContentLoaded', function() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 100, density: { enable: true, value_area: 1000 } },
                color: { value: ["#6366f1", "#22c55e", "#f59e0b", "#a855f7"] },
                shape: { type: "circle" },
                opacity: { value: 0.6, random: true, anim: { enable: true, speed: 1, opacity_min: 0.3 } },
                size: { value: 4, random: true, anim: { enable: true, speed: 2, size_min: 1 } },
                line_linked: { 
                    enable: true, 
                    distance: 150, 
                    color: "#ffffff", 
                    opacity: 0.3, 
                    width: 1 
                },
                move: { 
                    enable: true, 
                    speed: 3, 
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
                    grab: { distance: 200, line_linked: { opacity: 0.8 } },
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
    // Mobile menu toggle - Version corrigée
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const menuLines = document.querySelectorAll('.menu-line');
    let isMenuOpen = false;

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            isMenuOpen = !isMenuOpen;
            navLinks.classList.toggle('active');
            
            // Animation des lignes du menu hamburger
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

        // Fermer le menu en cliquant sur un lien
        const navLinkItems = document.querySelectorAll('.nav-links a');
        navLinkItems.forEach(link => {
            link.addEventListener('click', function() {
                if (isMenuOpen) {
                    isMenuOpen = false;
                    navLinks.classList.remove('active');
                    menuLines.forEach(line => {
                        line.style.transform = '';
                        line.style.opacity = '';
                    });
                }
            });
        });

        // Fermer le menu en cliquant à côté
        document.addEventListener('click', function(e) {
            if (isMenuOpen && !navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                isMenuOpen = false;
                navLinks.classList.remove('active');
                menuLines.forEach(line => {
                    line.style.transform = '';
                    line.style.opacity = '';
                });
            }
        });
    }
});




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



   
