let chartInstance = null;
const urlParams = new URLSearchParams(window.location.search);
let userId = urlParams.get('user_id') || 1;

// Fonction pour calculer et afficher l'IMC immédiatement
function calculerEtAfficherIMC() {
  const poids = parseFloat(document.getElementById('inputPoids').value);
  const taille = parseFloat(document.getElementById('inputTaille').value);
  
  if (poids && taille && poids >= 20 && taille >= 100 && taille <= 300) {
    const imc = poids / ((taille/100) ** 2);
    let interpretation = "";
    
    if (imc < 18.5) {
      interpretation = "Insuffisance pondérale";
    } else if (imc < 25) {
      interpretation = "Poids normal";
    } else if (imc < 30) {
      interpretation = "Surpoids";
    } else {
      interpretation = "Obésité";
    }
    
    document.getElementById('imcResult').innerHTML = `
      <strong>Votre IMC :</strong> ${imc.toFixed(2)} (${interpretation})
      <br><strong>Poids :</strong> ${poids} kg |
      <strong>Taille :</strong> ${(taille/100).toFixed(2)} m
    `;
  } else if (poids || taille) {
    // Si au moins un champ est rempli mais les valeurs sont incomplètes/invalides
    document.getElementById('imcResult').innerHTML = `
      <span style="color: #f39c12;">⚠️ Veuillez saisir un poids valide (≥20kg) et une taille valide (100-300cm)</span>
    `;
  } else {
    document.getElementById('imcResult').textContent = "IMC non calculé pour l'instant...";
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

  if (menus.length < 1) {
    alert("Merci de sélectionner au moins un plat.");
    return;
  }

  const poids = parseFloat(document.getElementById('inputPoids').value);
  const taille = parseFloat(document.getElementById('inputTaille').value);

  if (!poids || !taille || poids < 20 || taille < 100 || taille > 300) {
    alert("Merci de saisir un poids (min 20kg) et une taille (100-300cm) valides.");
    return;
  }

  const fastingType = document.querySelector('input[name="fasting_type"]:checked')?.value || "";
  const fastingStart = document.getElementById('startFasting').value;
  const fastingEnd = document.getElementById('endFasting').value;

  if (fastingType && (!fastingStart || !fastingEnd)) {
    alert("Merci d'indiquer l'heure de début et de fin du jeûne sélectionné.");
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
      <small style="color: #666;">L'IA analyse votre profil pour vous proposer le menu idéal</small>
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
          <br><strong>Poids :</strong> ${poidsAffiche} kg |
          <strong>Taille :</strong> ${tailleAffiche} m
        `;
      }

      let html = "";

      if (data.nutrition && data.nutrition.length > 0) {
        const sourceIcon = data.source_menu === "IA" ? "🤖" : "📋";
        const sourceText = data.source_menu === "IA" ? "généré par l'IA personnalisée" : "menu de fallback";
        
        // Afficher des infos sur la personnalisation si disponibles
        let personalizationInfo = "";
        if (data.user_data) {
          personalizationInfo = `
            <div style="background: #e8f5e8; padding: 10px; border-radius: 5px; margin-bottom: 15px; font-size: 14px;">
              <strong>🎯 Menu personnalisé pour :</strong>
              ${data.user_data.sexe !== 'Non renseigné' ? `${data.user_data.sexe}` : ''}
              ${data.user_data.age !== 'Non renseigné' ? `, ${data.user_data.age} ans` : ''}
              ${data.imc_info ? `, IMC ${data.imc_info.imc} (${data.imc_info.interpretation})` : ''}
            </div>
          `;
        }

        html += personalizationInfo;
        html += `<h2>Menu adapté ${sourceIcon} <small>(${sourceText})</small></h2>`;
        html += "<table><tr><th>Plat</th><th>Calories</th><th>Protéines</th><th>Glucides</th><th>Lipides</th></tr>";

        data.nutrition.forEach(item => {
          html += `<tr>
            <td>${item.name || 'N/A'}</td>
            <td>${item.calories || 0}</td>
            <td>${item.protein || 0}g</td>
            <td>${item.carbs || 0}g</td>
            <td>${item.fat || 0}g</td>
          </tr>`;
        });

        html += "</table>";

        if (data.total_calories) {
          html += `<p><strong>Total calories:</strong> ${data.total_calories} kcal</p>`;
        }
      } else {
        html += "<p>❌ Aucun menu adapté disponible.</p>";
      }

      if (data.raw_response && data.source_menu !== "IA") {
        html += `<h3>Détails techniques :</h3>
          <div style="background:#f9f9f9; padding:10px; border-radius:5px; max-height:200px; overflow:auto; font-size:12px;">
            <strong>Source:</strong> ${data.source_menu || 'inconnu'}<br>
            <strong>Réponse:</strong><br>
            <pre>${data.raw_response}</pre>
          </div>`;
      }

      let platsParam = data.nutrition && data.nutrition.length > 0
        ? data.nutrition.map(item => encodeURIComponent(item.name || '')).join(',')
        : menus.map(p => encodeURIComponent(p)).join(',');

      if (platsParam) {
        html += `<p style="margin-top:15px;">
          <a href="/recettes?plats=${platsParam}" class="btn" 
             style="background:#2196F3; color:white; padding:8px 15px; border-radius:5px; text-decoration:none;">
            Continuer vers les recettes 🍽️
          </a>
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

