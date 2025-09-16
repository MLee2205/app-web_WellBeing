

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


// ✅ Fonction de boîte de dialogue réutilisable
function showModalAlert(title, message, type = "info") {
  const existing = document.querySelector(".custom-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.className = "custom-modal";
  modal.innerHTML = `
    <div class="modal-content ${type}">
      <div class="modal-icon">
        <i class="fas ${
          type === "error" ? "fa-times-circle" :
          type === "success" ? "fa-check-circle" :
          "fa-info-circle"
        }"></i>
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



let chartInstance = null;
const urlParams = new URLSearchParams(window.location.search);
let userId = urlParams.get('user_id') || 1;

function calculerEtAfficherIMC() {
  const poids = parseFloat(document.getElementById('inputPoids').value);
  const taille = parseFloat(document.getElementById('inputTaille').value);
  
  if (poids && taille && poids >= 20 && taille >= 100 && taille <= 300) {
    const imc = poids / ((taille/100) ** 2);
    let interpretation = "";
    
    if (imc < 16) {
      interpretation = "Anorexie ou dénutrition";
    } else if (imc < 16.5) {
      interpretation = "Maigreur";
    } else if (imc < 18.5) {
      interpretation = "Maigreur";
    } else if (imc < 25) {
      interpretation = "Corpulence normale";
    } else if (imc < 30) {
      interpretation = "Surpoids";
    } else if (imc < 35) {
      interpretation = "Obésité modérée (Classe 1)";
    } else if (imc < 40) {
      interpretation = "Obésité élevé (Classe 2)";
    } else {
      interpretation = "Obésité morbide ou massive";
    }
    
    document.getElementById('imcResult').innerHTML = `
      <strong>Votre IMC :</strong> ${imc.toFixed(2)} (${interpretation})
      <br><strong>Poids :</strong> ${poids} kg |
      <strong>Taille :</strong> ${(taille/100).toFixed(2)} m
    `;
    
    // Mettre à jour la position de l'indicateur sur la barre d'IMC
    updateImcIndicator(imc);
  } else if (poids || taille) {
    document.getElementById('imcResult').innerHTML = `
      <span style="color: red;">⚠️ Veuillez saisir un poids valide (≥20kg) et une taille valide (100-300cm)</span>
    `;
    // Cacher l'indicateur si les données sont invalides
    document.getElementById('imcIndicator').style.display = 'none';
  } else {
    document.getElementById('imcResult').textContent = "IMC non calculé pour l'instant...";
    // Cacher l'indicateur si aucune donnée
    document.getElementById('imcIndicator').style.display = 'none';
  }
}

// Fonction pour mettre à jour la position de l'indicateur d'IMC
function updateImcIndicator(imc) {
  const indicator = document.getElementById('imcIndicator');
  indicator.style.display = 'block';
  
  // Définir les plages d'IMC (16 à 40)
  const minImc = 16;
  const maxImc = 40;
  
  // Limiter l'IMC à la plage affichée
  const clampedImc = Math.max(minImc, Math.min(maxImc, imc));
  
  // Calculer la position en pourcentage (0% à 100%)
  const position = ((clampedImc - minImc) / (maxImc - minImc)) * 100;
  
  // Positionner l'indicateur
  indicator.style.left = `${position}%`;
  
  // Mettre à jour la valeur affichée
  const valueElement = indicator.querySelector('.indicator-value');
  valueElement.textContent = `IMC: ${imc.toFixed(1)}`;
  
  // Changer la couleur de l'indicateur en fonction de la catégorie d'IMC
  if (imc < 18.5) {
    valueElement.style.background = '#3498db';
    indicator.querySelector('.indicator-arrow').style.borderTopColor = '#3498db';
  } else if (imc < 25) {
    valueElement.style.background = '#2ecc71';
    indicator.querySelector('.indicator-arrow').style.borderTopColor = '#2ecc71';
  } else if (imc < 30) {
    valueElement.style.background = '#f1c40f';
    indicator.querySelector('.indicator-arrow').style.borderTopColor = '#f1c40f';
  } else if (imc < 35) {
    valueElement.style.background = '#e67e22';
    indicator.querySelector('.indicator-arrow').style.borderTopColor = '#e67e22';
  } else if (imc < 40) {
    valueElement.style.background = '#e74c3c';
    indicator.querySelector('.indicator-arrow').style.borderTopColor = '#e74c3c';
  } else {
    valueElement.style.background = '#c0392b';
    indicator.querySelector('.indicator-arrow').style.borderTopColor = '#c0392b';
  }
}

// Fonction pour gérer les données utilisateur
function gererDonneesUtilisateur() {
  const bodyElement = document.body;
  const poids = bodyElement.getAttribute('data-poids');
  const taille = bodyElement.getAttribute('data-taille');
  const age = bodyElement.getAttribute('data-age');
  const sexe = bodyElement.getAttribute('data-sexe');
  
  const inputPoids = document.getElementById('inputPoids');
  const inputTaille = document.getElementById('inputTaille');
  
  // Si les données existent, les afficher en lecture seule
  if (poids && poids !== '' && taille && taille !== '') {
    // Remplir et désactiver les champs
    inputPoids.value = poids;
    inputTaille.value = taille;
    inputPoids.readOnly = true;
    inputTaille.readOnly = true;
    
    // Styliser pour montrer qu'ils sont en lecture seule
    inputPoids.style.backgroundColor = '#f8f9fa';
    inputTaille.style.backgroundColor = '#f8f9fa';
    inputPoids.style.cursor = 'not-allowed';
    inputTaille.style.cursor = 'not-allowed';
    
    // Calculer l'IMC automatiquement
    calculerEtAfficherIMC();
    
    console.log(`[INFO] Données utilisateur chargées automatiquement - Poids: ${poids}kg, Taille: ${taille}cm`);
    return true; // Données complètes
  } else {
    // Si données incomplètes, permettre la saisie manuelle
    inputPoids.readOnly = false;
    inputTaille.readOnly = false;
    inputPoids.style.backgroundColor = '';
    inputTaille.style.backgroundColor = '';
    inputPoids.style.cursor = '';
    inputTaille.style.cursor = '';
    
    // Pré-remplir ce qui est disponible
    if (poids && poids !== '') inputPoids.value = poids;
    if (taille && taille !== '') inputTaille.value = taille;
    
    console.log(`[INFO] Données partielles, saisie manuelle activée`);
    return false; // Données incomplètes
  }
}

// Écouteurs d'événements pour calcul IMC en temps réel (seulement si saisie manuelle)
function activerEcouteursIMC() {
  const inputPoids = document.getElementById('inputPoids');
  const inputTaille = document.getElementById('inputTaille');
  
  // Seulement ajouter les écouteurs si les champs ne sont pas en lecture seule
  if (!inputPoids.readOnly && !inputTaille.readOnly) {
    inputPoids.addEventListener('input', calculerEtAfficherIMC);
    inputTaille.addEventListener('input', calculerEtAfficherIMC);
  }
}

document.getElementById('calculateBtn').addEventListener('click', () => {
  const prefs = Array.from(document.querySelectorAll('input[name="preferences"]:checked')).map(el => el.value);
  const menus = Array.from(document.querySelectorAll('input[name="menu"]:checked')).map(el => el.value);

  

  const poids = parseFloat(document.getElementById('inputPoids').value);
  const taille = parseFloat(document.getElementById('inputTaille').value);

  if (!poids || !taille || poids < 20 || taille < 100 || taille > 300) {
    showModalAlert("Données invalides ⚠️", "Merci de saisir un poids (≥20kg) et une taille (100-300cm) valides.", "error");
    return;
  }

  const fastingType = document.querySelector('input[name="fasting_type"]:checked')?.value || "";
  const fastingStart = document.getElementById('startFasting').value;
  const fastingEnd = document.getElementById('endFasting').value;

  if (fastingType && (!fastingStart || !fastingEnd)) {
    showModalAlert("Informations manquantes ❗", "Merci d'indiquer l'heure de début et de fin du jeûne sélectionné.", "error");
    return;
  }
  const fasting = fastingType ? {
    type: fastingType,
    start: fastingStart,
    end: fastingEnd
  } : null;

  const requestData = {
    user_id: parseInt(userId),
    preferences: prefs,
    menu_original: menus,
    poids,
    taille,
    fasting
  };

  console.log("Données envoyées au backend :", requestData);

  // L'IMC est déjà affiché, on indique juste que les menus se génèrent
  document.getElementById('results').innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #2196F3;"></i>
      <p style="margin-top: 10px;">Génération personnalisée du menu en cours...</p>
      <small style="color: black;">L'IA analyse votre profil pour vous proposer le menu idéal</small>
    </div>
  `;

  fetch('/api/nutrition', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(requestData)
  })
    .then(res => {
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log("Réponse reçue:", data);

      // Mise à jour de l'IMC avec les données du serveur (si différentes)
      if (data.imc_info) {
        const info = data.imc_info;
        const imc = typeof info.imc === "number" ? info.imc.toFixed(2) : "N/A";
        const interpretation = info.interpretation || "";
        const poidsAffiche = info.poids || "N/A";
        const tailleAffiche = info.taille ? (info.taille / 100).toFixed(2) : "N/A";

        document.getElementById('imcResult').innerHTML = `
          <strong>Votre IMC :</strong> ${imc} ${interpretation ? `(${interpretation})` : ""}
          <br><strong>Poids :</strong>  ⚖️ ${poidsAffiche} kg |
          <strong>Taille :</strong> 📏 ${tailleAffiche} m
        `;
      }

      let html = "";

      if (data.nutrition && Object.keys(data.nutrition).length > 0) {
        const sourceIcon = data.source_menu === "IA" ? "🤖" : "📋";
        const sourceText = data.source_menu === "IA" ? "généré par l'IA personnalisée" : "menu de fallback";
        
        // Afficher des infos sur la personnalisation si disponibles
        let personalizationInfo = "";
        if (data.user_data) {
          personalizationInfo = `
            <div style="background: #e8f5e8;color:black; padding: 10px; border-radius: 5px; margin-bottom: 15px; font-size: 14px;">
              <strong style="color: black;">🎯 Menu personnalisé pour :</strong>
              ${data.user_data.sexe !== 'Non renseigné' ? `${data.user_data.sexe}` : ''}
              ${data.user_data.age !== 'Non renseigné' ? `, ${data.user_data.age} ans` : ''}
              ${data.imc_info ? `, IMC ${data.imc_info.imc} (${data.imc_info.interpretation})` : ''}
            </div>
          `;
        }
      
        html += personalizationInfo;
        html += `<h2 class="menu-title">Menu adapté ${sourceIcon} <small>(${sourceText})</small></h2>`;
        
        // Afficher chaque repas séparément
        // Afficher uniquement le déjeuner
const repasKey = "repas";
if (data.nutrition[repasKey] && data.nutrition[repasKey].length > 0) {
  html += `<h3 style="margin-top: 20px; color: #6366f1;">Déjeuner</h3>`;
  html += "<table><tr><th>Jour</th><th>Plat</th><th>Calories</th><th>Protéines</th><th>Glucides</th><th>Lipides</th></tr>";

data.nutrition[repasKey].forEach(item => {
  html += `<tr>
    <td>${item.jour || ''}</td>
    <td>${item.name || 'N/A'}</td>
    <td>${item.calories || 0}</td>
    <td>${item.protein || 0}g</td>
    <td>${item.carbs || 0}g</td>
    <td>${item.fat || 0}g</td>
  </tr>`;
});

  
  html += "</table>";
}

      
        if (data.total_calories) {
          html += `<p style="margin-top: 20px;"><strong>Total calories:</strong> ${data.total_calories} kcal</p>`;
        }
      }

       else {
        html += "<p>❌ Aucun menu adapté disponible.</p>";
      }

      if (data.raw_response && data.source_menu !== "IA") {
        html += `<h3>Détails techniques :</h3>
          <div style="background:#f9f9f9;color:black; padding:10px; border-radius:5px; max-height:200px; overflow:auto; font-size:12px;">
            <strong>Source:</strong> ${data.source_menu || 'inconnu'}<br>
            <strong>Réponse:</strong><br>
            <pre>${data.raw_response}</pre>
          </div>`;
      }

      let platsParam = "";
if (data.nutrition && Object.keys(data.nutrition).length > 0) {
  // Récupérer tous les noms de plats de tous les repas
  const allPlats = [];
  Object.values(data.nutrition).forEach(repas => {
    if (Array.isArray(repas)) {
      repas.forEach(plat => {
        if (plat.name) allPlats.push(plat.name);
      });
    }
  });
  platsParam = allPlats.map(p => encodeURIComponent(p)).join(',');
} else {
  platsParam = menus.map(p => encodeURIComponent(p)).join(',');
}
if (platsParam) {
  // Stocker les plats sélectionnés dans le localStorage
  localStorage.setItem('selected_plats', platsParam);
  
  html += `<p style="margin-top:15px;">
    <button onclick="checkSubscriptionAndRedirect('${platsParam}')" class="btn" 
       style="background:#2196F3; color:white; padding:8px 15px; border-radius:5px; text-decoration:none; border:none; cursor:pointer;">
      Continuer vers les recettes 🍽️
    </button>
  </p>`;
}

      document.getElementById('results').innerHTML = html;
    })
    .catch(err => {
      console.error("Erreur:", err);
      document.getElementById('results').innerHTML = `
        <div style="color: #e74c3c; text-align: center; padding: 20px;">
          <i class="fas fa-exclamation-triangle"></i>
          <p><strong>Erreur lors de la génération :</strong> ${err.message}</p>
          <small>Veuillez réessayer ou contacter le support si le problème persiste.</small>
        </div>
      `;
      // On garde l'IMC affiché même en cas d'erreur des menus
    });
});

// ===== GESTION VÉGÉTARIEN =====
const vegetarianCheckbox = document.querySelector('input[value="végétarien"]');
const menuCheckboxes = document.querySelectorAll('input[name="menu"]');
const meatDishes = ["Poulet DG", "Cheeseburger", "Hot dog", "Brochettes de bœuf", "Ndolé", "Poisson braisé", "Sandwich au thon"];

if (vegetarianCheckbox) {
  vegetarianCheckbox.addEventListener('change', () => {
    menuCheckboxes.forEach(checkbox => {
      if (meatDishes.includes(checkbox.value)) {
        checkbox.checked = false;
        checkbox.disabled = vegetarianCheckbox.checked;
        checkbox.parentElement.style.opacity = vegetarianCheckbox.checked ? '0.5' : '1';
      }
    });
  });
}

// ===== DÉSELECTION BOUTONS RADIO =====
document.querySelectorAll('input[name="fasting_type"]').forEach(radio => {
  radio.addEventListener('click', function () {
    if (this.checked && this.dataset.checked === "true") {
      this.checked = false;
      this.dataset.checked = "false";
    } else {
      document.querySelectorAll('input[name="fasting_type"]').forEach(r => r.dataset.checked = "false");
      this.dataset.checked = "true";
    }
    
    // Efface les heures si aucun n'est sélectionné
    const selected = document.querySelector('input[name="fasting_type"]:checked');
    if (!selected) {
      document.getElementById('startFasting').value = "";
      document.getElementById('endFasting').value = "";
    }
  });
});

// ===== EFFACER LES HEURES SI DÉSELECTION =====
document.getElementById('user-metrics').addEventListener('change', () => {
  const selected = document.querySelector('input[name="fasting_type"]:checked');
  if (!selected) {
    document.getElementById('startFasting').value = "";
    document.getElementById('endFasting').value = "";
  }
});

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  // Gérer les données utilisateur (auto-remplissage ou saisie manuelle)
  const donneesCompletes = gererDonneesUtilisateur();
  
  // Activer les écouteurs d'événements selon le mode
  activerEcouteursIMC();
  
  // Message informatif selon le cas
  const bodyElement = document.body;
  const poids = bodyElement.getAttribute('data-poids');
  const taille = bodyElement.getAttribute('data-taille');
  
  if (donneesCompletes) {
    // Données complètes - Message de confirmation
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
      background: #d4edda; 
      border: 1px solid #28a745; 
      border-radius: 5px; 
      padding: 12px; 
      margin: 15px 0; 
      font-size: 14px;
      color: #155724;
    `;
    infoDiv.innerHTML = `
      <i class="fas fa-check-circle"></i> 
      <strong>Données automatiquement chargées</strong> depuis votre profil utilisateur.
      <br><small>Poids: ${poids}kg • Taille: ${taille}cm • IMC calculé automatiquement</small>
      <button id="modifierDonnees" style="margin-left: 15px; padding: 5px 10px; font-size: 12px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">
        <i class="fas fa-edit"></i> Modifier
      </button>
    `;
    
    // Insérer après les champs de saisie
    const metricsDiv = document.querySelector('.user-metrics');
    metricsDiv.parentNode.insertBefore(infoDiv, metricsDiv.nextSibling);
    
    // Ajouter fonction de modification
    document.getElementById('modifierDonnees').addEventListener('click', () => {
      const inputPoids = document.getElementById('inputPoids');
      const inputTaille = document.getElementById('inputTaille');
      
      // Réactiver l'édition
      inputPoids.readOnly = false;
      inputTaille.readOnly = false;
      inputPoids.style.backgroundColor = '';
      inputTaille.style.backgroundColor = '';
      inputPoids.style.cursor = '';
      inputTaille.style.cursor = '';
      
      // Réactiver les écouteurs
      inputPoids.addEventListener('input', calculerEtAfficherIMC);
      inputTaille.addEventListener('input', calculerEtAfficherIMC);
      
      // Masquer le message et changer le style
      infoDiv.style.display = 'none';
      inputPoids.focus();
      
      console.log('[INFO] Mode édition activé');
    });
  } else if (poids || taille) {
    // Données partielles - Message d'information
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
      background: #fff3cd; 
      border: 1px solid #ffc107; 
      border-radius: 5px; 
      padding: 12px; 
      margin: 15px 0; 
      font-size: 14px;
      color: #856404;
    `;
    infoDiv.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i> 
      <strong>Données partielles détectées</strong> dans votre profil.
      <br><small>Veuillez compléter les informations manquantes pour un calcul automatique.</small>
    `;
    
    const metricsDiv = document.querySelector('.user-metrics');
    metricsDiv.parentNode.insertBefore(infoDiv, metricsDiv.nextSibling);
  }
});
// Fonction pour vérifier l'abonnement et rediriger

function checkSubscriptionAndRedirect(platsParam) {
  // Récupérer l'ID utilisateur depuis l'URL ou la session
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user_id') || sessionStorage.getItem('current_user_id') || 'guest';
  
  const subscriptionKey = `subscription_${userId}`;
  const subscriptionDateKey = `subscription_date_${userId}`;
  
  const subscription = localStorage.getItem(subscriptionKey);
  const subscriptionDate = localStorage.getItem(subscriptionDateKey);
  
  if (subscription && subscriptionDate) {
      // Vérifier si l'abonnement est encore valide
      const subDate = new Date(subscriptionDate);
      const now = new Date();
      let isValid = false;
      
      switch(subscription) {
          case '1_mois':
              isValid = (now - subDate) < (30 * 24 * 60 * 60 * 1000);
              break;
          case '3_mois':
              isValid = (now - subDate) < (90 * 24 * 60 * 60 * 1000);
              break;
          case '1_an':
              isValid = (now - subDate) < (365 * 24 * 60 * 60 * 1000);
              break;
      }
      
      if (isValid) {
          // Abonnement valide, rediriger vers les recettes
          window.location.href = `/recettes?plats=${platsParam}&user_id=${userId}`;
      } else {
          // Abonnement expiré, aller à la page de paiement
          localStorage.removeItem(subscriptionKey);
          localStorage.removeItem(subscriptionDateKey);
          window.location.href = `/paiement?plats=${platsParam}&user_id=${userId}`;
      }
  } else {
      // Pas d'abonnement, aller à la page de paiement
      window.location.href = `/paiement?plats=${platsParam}&user_id=${userId}`;
  }
}
