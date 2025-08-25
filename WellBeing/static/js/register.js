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
                line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.3, width: 1 },
                move: { enable: true, speed: 3, direction: "none", random: true, straight: false, out_mode: "out" }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" } },
                modes: { grab: { distance: 200, line_linked: { opacity: 0.8 } }, push: { particles_nb: 4 } }
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

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
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

        // Fermer le menu si clic sur un lien
        document.querySelectorAll('.nav-links a').forEach(link => {
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

        // Fermer le menu si clic extérieur
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

    // ✅ Fonction de boîte de dialogue réutilisable
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

    // ✅ Formulaire d'inscription
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
            if (result.user_id) {
                showModalAlert("Inscription réussie ✅", result.message || "Votre compte a été créé avec succès.", "success");
                setTimeout(() => {
                    window.location.href = `/nutrition`;
                }, 1500);
            } else {
                showModalAlert("Erreur ❌", result.message || "Impossible de créer le compte.", "error");
            }
        })
        .catch(error => showModalAlert("Erreur ⚠️", "Une erreur est survenue : " + error, "error"));
    });
});

