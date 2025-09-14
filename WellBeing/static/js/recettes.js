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

    // Votre code JavaScript pour les recettes
    const params = new URLSearchParams(window.location.search);
    const plats = params.get('plats') ? params.get('plats').split(',') : [];
    const div = document.getElementById('recettes');
    let recettesData = []; // pour PDF

    if (plats.length === 0) {
        div.innerHTML = `
            <div class="recette">
                <h3 class="recette-title">Aucun plat fourni</h3>
                <div class="recette-content">
                    <p>Veuillez sélectionner des plats depuis la page Menus pour afficher les recettes correspondantes.</p>
                </div>
            </div>
        `;
    } else {
        // Afficher l'état de chargement
        div.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-circle-notch fa-spin"></i>
            </div>
            <p>Chargement des recettes pour: ${plats.join(', ')}...</p>
        `;

        fetch('/api/recettes', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ plats })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Données reçues:", data);
            div.innerHTML = "";
            if (!data.recettes || data.recettes.length === 0) {
                div.innerHTML = `
                    <div class="recette">
                        <h3 class="recette-title">Aucune recette trouvée</h3>
                        <div class="recette-content">
                            <p>Aucune recette trouvée pour ces plats.</p>
                        </div>
                    </div>
                `;
                return;
            }

            recettesData = data.recettes;
            
            data.recettes.forEach(r => {
                const recetteHTML = `
                    <div class="recette">
                        <h3 class="recette-title">${r.jour} ${r.date} – ${r.name}</h3>
                        <div class="recette-content">
                            ${r.recette.replace(/\n/g, "<br>")}
                        </div>
                    </div>
                `;
                div.innerHTML += recetteHTML;
            });
            

            // Animer l'apparition des recettes
            const recipes = div.querySelectorAll('.recette');
            recipes.forEach((recipe, index) => {
                recipe.style.opacity = '0';
                recipe.style.transform = 'translateY(20px)';
                recipe.style.transition = `all 0.5s ease ${index * 0.2}s`;
                
                setTimeout(() => {
                    recipe.style.opacity = '1';
                    recipe.style.transform = 'translateY(0)';
                }, 100);
            });
        })
        .catch(err => {
            console.error(err);
            div.innerHTML = `
                <div class="recette">
                    <h3 class="recette-title">Erreur</h3>
                    <div class="recette-content">
                        <p>Une erreur est survenue lors du chargement des recettes.</p>
                    </div>
                </div>
            `;
        });
    }
// Fonction pour afficher une belle modal (identique à connexion.js)
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

    // Export PDF
    document.getElementById('exportBtn').addEventListener('click', () => {
        if (!recettesData || recettesData.length === 0) {
            showModalAlert("Aucune recette à exporter.");
            return;
        }
    
        // Afficher la bulle de remerciement
        showModalAlert(
            "Merci à vous !",
            "Revenez dans une semaine pour vos nouveaux repas. Entre temps, bonne dégustation 😋.",
            "success"
        );
    
        // Attendre que l'utilisateur clique sur OK avant de générer le PDF
        const modalOkBtn = document.querySelector(".custom-modal #modal-ok");
        modalOkBtn.addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    
            let y = 20;
            const logo = new Image();
            logo.src = "/static/images/w10.jpeg";
    
            logo.onload = function () {
                const logoWidth = 25;
                const logoHeight = 25;
                const pageWidth = doc.internal.pageSize.getWidth();
                const logoX = pageWidth / 2 - 40;
                const logoY = 10;
    
                doc.addImage(logo, "PNG", logoX, logoY, logoWidth, logoHeight);
    
                doc.setFont("helvetica", "bold");
                doc.setFontSize(22);
                doc.setTextColor(33, 150, 243);
                doc.text("WellBeing", logoX + logoWidth + 10, logoY + 12);
    
                y = logoY + logoHeight + 10;
    
                doc.setFont("helvetica", "bold");
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.text(" Recueil de Recettes", 105, y, { align: "center" });
                y += 10;
    
                recettesData.forEach(r => {
                    if (y > 260) { doc.addPage(); y = 20; }
    
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(14);
                    doc.setTextColor(46, 125, 50);
                    doc.text(`${r.jour} ${r.date} – ${r.name}`, 20, y);
                    y += 8;
    
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(12);
                    doc.setTextColor(0, 0, 0);
                    const lines = doc.splitTextToSize(r.recette || "Pas de recette disponible.", 170);
                    lines.forEach(line => {
                        if (y > 280) { doc.addPage(); y = 20; }
                        doc.text(line, 20, y);
                        y += 7;
                    });
    
                    y += 5;
                });
    
                if (y > 280) { doc.addPage(); y = 20; }
                doc.setFont("helvetica", "italic");
                doc.setFontSize(11);
                doc.setTextColor(100, 100, 100);
                doc.text("Réalisé par Meffo Lea - WellBeing", pageWidth / 2, y, { align: "center" });
    
                doc.save("recettes-wellbeing.pdf");
            };
        });
    });
     
    
});
