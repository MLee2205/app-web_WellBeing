// Variables globales
let generatedPdfs = JSON.parse(localStorage.getItem('wellbeing_pdfs')) || [];
let recettesData = [];

// Fonction pour sauvegarder un PDF dans l'historique
function savePdfToHistory(pdfData, pdfBlob) {
    const timestamp = new Date().toISOString();
    const pdfId = `pdf_${Date.now()}`;
    
    const pdfItem = {
        id: pdfId,
        name: `Recettes_${new Date().toLocaleDateString('fr-FR')}`,
        timestamp: timestamp,
        date: new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        plats: recettesData.map(r => r.name),
        blobUrl: URL.createObjectURL(pdfBlob),
        data: pdfData // Stocker les données pour régénération
    };

    generatedPdfs.unshift(pdfItem); // Ajouter au début
    generatedPdfs = generatedPdfs.slice(0, 20); // Garder seulement les 20 derniers
    
    localStorage.setItem('wellbeing_pdfs', JSON.stringify(generatedPdfs));
    updatePdfHistoryDisplay();
    
    return pdfItem;
}

// Fonction pour afficher l'historique
function updatePdfHistoryDisplay() {
    const historyContainer = document.getElementById('pdfHistory');
    
    if (generatedPdfs.length === 0) {
        historyContainer.innerHTML = '<p class="no-pdfs">Aucun PDF généré pour le moment</p>';
        return;
    }

    historyContainer.innerHTML = generatedPdfs.map(pdf => `
        <div class="pdf-item" data-pdf-id="${pdf.id}">
            <div class="pdf-item-header">
                <span class="pdf-item-name">${pdf.name}</span>
                <span class="pdf-item-date">${pdf.date}</span>
            </div>
            <div class="pdf-item-content">
                <strong>Plats inclus:</strong><br>
                ${pdf.plats.slice(0, 3).map(plat => `• ${plat}`).join('<br>')}
                ${pdf.plats.length > 3 ? `<br>• ... et ${pdf.plats.length - 3} de plus` : ''}
            </div>
            <div class="pdf-item-actions">
                <button class="pdf-action-btn pdf-download-btn" onclick="downloadPdf('${pdf.id}')">
                    <i class="fas fa-download"></i> Télécharger
                </button>
                <button class="pdf-action-btn pdf-delete-btn" onclick="deletePdf('${pdf.id}')">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        </div>
    `).join('');
}

// Fonction pour télécharger un PDF existant
function downloadPdf(pdfId) {
    const pdf = generatedPdfs.find(p => p.id === pdfId);
    if (!pdf) return;

    const link = document.createElement('a');
    link.href = pdf.blobUrl;
    link.download = `${pdf.name}.pdf`;
    link.click();
}

// Fonction pour supprimer un PDF
function deletePdf(pdfId) {
    const pdfIndex = generatedPdfs.findIndex(p => p.id === pdfId);
    if (pdfIndex === -1) return;

    // Libérer l'URL de l'objet blob
    URL.revokeObjectURL(generatedPdfs[pdfIndex].blobUrl);
    
    generatedPdfs.splice(pdfIndex, 1);
    localStorage.setItem('wellbeing_pdfs', JSON.stringify(generatedPdfs));
    updatePdfHistoryDisplay();
}

// Fonction pour régénérer un PDF
function regeneratePdf(pdfId) {
    const pdf = generatedPdfs.find(p => p.id === pdfId);
    if (!pdf || !pdf.data) return;

    recettesData = pdf.data.recettes;
    generateAndSavePdf(pdf.data);
}

// Nouvelle fonction pour générer et sauvegarder le PDF
function generateAndSavePdf(pdfData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    let y = 20;

    // Titre principal
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243);
    doc.text("WellBeing", 105, y, { align: "center" });
    y += 12;

    // Sous-titre
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Recettes adaptées", 105, y, { align: "center" });
    y += 10;

    // Date de génération
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, y, { align: "center" });
    y += 15;

    pdfData.recettes.forEach(r => {
        if (y > 260) { doc.addPage(); y = 20; }

        // Nom du plat
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(46, 125, 50);
        doc.text(r.name, 20, y);
        y += 8;

        // Recette
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

    // Signature
    if (y > 280) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("Réalisé par Meffo Lea - WellBeing", 105, y, { align: "center" });

    // Générer le blob et sauvegarder
    const pdfBlob = doc.output('blob');
    savePdfToHistory(pdfData, pdfBlob);

    // Télécharger automatiquement
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = `recettes_wellbeing_${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();

    // Nettoyer après téléchargement
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
}

// Fonction pour nettoyer les URLs obsolètes
function cleanupOldBlobUrls() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    generatedPdfs = generatedPdfs.filter(pdf => {
        const pdfDate = new Date(pdf.timestamp).getTime();
        if (pdfDate < oneWeekAgo) {
            URL.revokeObjectURL(pdf.blobUrl);
            return false;
        }
        return true;
    });
    
    localStorage.setItem('wellbeing_pdfs', JSON.stringify(generatedPdfs));
}

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
                        <h3 class="recette-title">${r.name}</h3>
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

    // Modifiez l'écouteur d'événement pour le bouton d'export
    document.getElementById('exportBtn').addEventListener('click', () => {
        if (!recettesData || recettesData.length === 0) {
            alert("Aucune recette à exporter.");
            return;
        }

        generateAndSavePdf({
            plats: plats,
            recettes: recettesData,
            timestamp: new Date().toISOString()
        });
    });

    // Initialiser l'affichage de l'historique
    updatePdfHistoryDisplay();
    
    // Nettoyer les anciens PDFs au chargement
    cleanupOldBlobUrls();
});
