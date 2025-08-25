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

    // ✅ CORRECTION PRINCIPALE : Récupérer le bon user_id
    loadUserProfile();
});

// ✅ Fonction pour charger le profil avec le bon user_id
function loadUserProfile() {
    // D'abord vérifier la session pour obtenir le bon user_id
    fetch('/api/check_session')
    .then(response => response.json())
    .then(sessionData => {
        let userId = null;
        
        if (sessionData.logged_in && sessionData.user_id) {
            // Utilisateur connecté - utiliser son ID de session
            userId = sessionData.user_id;
            console.log(`[INFO] Utilisateur connecté, ID session: ${userId}`);
        } else {
            // Pas connecté - essayer l'URL ou valeur par défaut
            const urlParams = new URLSearchParams(window.location.search);
            userId = urlParams.get('user_id') || 1;
            console.log(`[WARNING] Pas de session, utilisation ID: ${userId}`);
        }
        
        // Charger le profil avec le bon ID
        return loadProfileData(userId);
    })
    .catch(error => {
        console.error('Erreur vérification session:', error);
        // En cas d'erreur, essayer avec l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user_id') || 1;
        loadProfileData(userId);
    });
}

// ✅ Fonction séparée pour charger les données du profil
function loadProfileData(userId) {
    console.log(`[INFO] Chargement du profil pour l'utilisateur ${userId}`);
    
    fetch(`/api/profile/${userId}`)
    .then(res => {
        if (!res.ok) {
            if (res.status === 401) {
                throw new Error('Non autorisé - veuillez vous connecter');
            } else if (res.status === 403) {
                throw new Error('Accès refusé à ce profil');
            } else {
                throw new Error(`Erreur ${res.status}: ${res.statusText}`);
            }
        }
        return res.json();
    })
    .then(data => {
        console.log('[SUCCESS] Données profil chargées:', data);
        
        // Remplir les champs avec les données
        document.getElementById('email').value = data.email || '';
        document.getElementById('name').value = data.name || '';
        document.getElementById('renom').value = data.renom || '';
        document.getElementById('date_naissance').value = data.date_naissance || '';
        document.getElementById('sexe').value = data.sexe || '';
        document.getElementById('poids').value = data.poids || '';
        document.getElementById('taille').value = data.taille || '';
        
        // Stocker l'userId pour les autres fonctions
        window.currentUserId = userId;
        
        // Ajouter les event listeners maintenant que les données sont chargées
        setupFormHandlers(userId);
    })
    .catch(err => {
        console.error('[ERROR] Chargement profil:', err);
        alert('Erreur de chargement: ' + err.message);
        
        // Rediriger vers la connexion si non autorisé
        if (err.message.includes('Non autorisé') || err.message.includes('Accès refusé')) {
            window.location.href = '/login';
        }
    });
}

// ✅ Configuration des gestionnaires d'événements
function setupFormHandlers(userId) {
    // Gestionnaire de soumission du formulaire
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        // Supprimer les anciens listeners pour éviter les doublons
        profileForm.replaceWith(profileForm.cloneNode(true));
        const newForm = document.getElementById('profileForm');
        
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfile(userId);
        });
    }
    
    // Bouton Nutrition
    const goToNutritionBtn = document.getElementById('goToNutritionBtn');
    if (goToNutritionBtn) {
        goToNutritionBtn.replaceWith(goToNutritionBtn.cloneNode(true));
        const newNutritionBtn = document.getElementById('goToNutritionBtn');
        
        newNutritionBtn.addEventListener('click', () => {
            window.location.href = `/nutrition?user_id=${userId}`;
        });
    }
    
    // Bouton Déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.replaceWith(logoutBtn.cloneNode(true));
        const newLogoutBtn = document.getElementById('logoutBtn');
        
        newLogoutBtn.addEventListener('click', () => {
            window.location.href = '/api/logout';
        });
    }
}

// ✅ Fonction pour sauvegarder le profil
function saveProfile(userId) {
    const data = {
        email: document.getElementById('email').value,
        name: document.getElementById('name').value,
        renom: document.getElementById('renom').value,
        date_naissance: document.getElementById('date_naissance').value,
        sexe: document.getElementById('sexe').value,
        poids: parseFloat(document.getElementById('poids').value) || null,
        taille: parseFloat(document.getElementById('taille').value) || null
    };
    
    console.log('[INFO] Sauvegarde profil utilisateur:', userId, data);
    
    fetch(`/api/profile/${userId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) {
            if (res.status === 401) {
                throw new Error('Non autorisé - veuillez vous reconnecter');
            } else if (res.status === 403) {
                throw new Error('Accès refusé pour modifier ce profil');
            }
            throw new Error(`Erreur ${res.status}`);
        }
        return res.json();
    })
    .then(result => {
        console.log('[SUCCESS] Profil sauvegardé:', result);
        alert(result.message || 'Profil mis à jour avec succès !');
    })
    .catch(err => {
        console.error('[ERROR] Sauvegarde:', err);
        alert('Erreur sauvegarde: ' + err.message);
        
        if (err.message.includes('Non autorisé')) {
            window.location.href = '/login';
        }
    });
}
// Aller vers nutrition
document.getElementById('goToNutritionBtn').addEventListener('click', () => {
    window.location.href = '/nutrition';
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = '/api/logout';

});



