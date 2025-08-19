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

    // Login form functionality
    document.getElementById('btn-login').addEventListener('click', function() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const btn = this;

        if (!email || !password) {
            showAlert('Merci de remplir votre email et mot de passe avant de vous connecter.', 'error');
            return;
        }

        // Show loading state
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion en cours...';
        btn.disabled = true;

        // Simulate API call (replace with actual fetch)
        setTimeout(() => {
            // This is just for demo - replace with actual fetch call
            const success = Math.random() > 0.2; // 80% chance of success for demo
            
            if (success) {
                showAlert('Connexion réussie ! Redirection en cours...', 'success');
                setTimeout(() => {
                    window.location.href = '/profil';
                }, 1500);
            } else {
                showAlert('Email ou mot de passe incorrect. Veuillez réessayer.', 'error');
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
                btn.disabled = false;
            }
        }, 1500);
    });

    function showAlert(message, type) {
        // Remove any existing alerts
        const existingAlert = document.querySelector('.alert-message');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alert = document.createElement('div');
        alert.className = `alert-message ${type}`;
        alert.innerHTML = `
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(alert);
        
        // Position the alert
        const form = document.querySelector('.form-container');
        const formRect = form.getBoundingClientRect();
        
        alert.style.position = 'fixed';
        alert.style.top = `${formRect.top - 60}px`;
        alert.style.left = '50%';
        alert.style.transform = 'translateX(-50%)';
        alert.style.padding = '1rem 2rem';
        alert.style.borderRadius = '8px';
        alert.style.backgroundColor = type === 'error' ? 'rgba(220, 38, 38, 0.9)' : 'rgba(22, 163, 74, 0.9)';
        alert.style.color = 'white';
        alert.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
        alert.style.zIndex = '1000';
        alert.style.animation = 'slideDown 0.3s ease-out';
        alert.style.display = 'flex';
        alert.style.alignItems = 'center';
        alert.style.gap = '0.5rem';
        
        // Remove after 5 seconds
        setTimeout(() => {
            alert.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    }
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

