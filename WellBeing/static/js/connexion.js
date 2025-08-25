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
                line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.2, width: 1 },
                move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" } },
                modes: { grab: { distance: 140, line_linked: { opacity: 0.5 } }, push: { particles_nb: 4 } }
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

    // ✅ Fonction pour afficher une belle modal
    function showModalAlert(title, message, type = "success") {
        const existing = document.querySelector(".custom-modal");
        if (existing) existing.remove();

        const modal = document.createElement("div");
        modal.className = "custom-modal";
        modal.innerHTML = `
            <div class="modal-content ${type}">
                <div class="modal-icon">
                    <i class="fas ${type === "error" ? "fa-times-circle" : "fa-check-circle"}"></i>
                </div>
                <h2>${title}</h2>
                <p>${message}</p>
                <button id="modal-ok">OK</button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector("#modal-ok").addEventListener("click", () => modal.remove());
        modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
    }

    // ✅ Login form functionality (une seule version)
    document.getElementById('btn-login').addEventListener('click', function() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const btn = this;

        if (!email || !password) {
            showModalAlert("Champs requis ❗", "Merci de remplir votre email et mot de passe avant de vous connecter.", "error");
            return;
        }

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion en cours...';
        btn.disabled = true;

        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showModalAlert("Connexion réussie ✅", "Bienvenue sur WellBeing ! Redirection en cours...", "success");
                setTimeout(() => {
                    window.location.href = '/nutrition';  // <-- Changer vers nutrition
                }, 1500);
            } else {
                showModalAlert("Erreur ❌", "Email ou mot de passe incorrect. Veuillez réessayer.", "error");
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
                btn.disabled = false;
            }
        })
        .catch(error => {
            showModalAlert("Erreur ⚠️", "Une erreur est survenue : " + error, "error");
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
            btn.disabled = false;
        });
    });

});

// Vérifier si l'utilisateur est déjà connecté au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
});

function checkSession() {
    fetch('/api/check_session')
    .then(response => response.json())
    .then(data => {
        if (data.logged_in) {
            // Utilisateur déjà connecté, rediriger vers nutrition
            window.location.href = '/nutrition';
        }
    })
    .catch(error => {
        console.log('Session non vérifiée:', error);
    });
}

