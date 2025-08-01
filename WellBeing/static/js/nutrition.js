let chartInstance = null;
const urlParams = new URLSearchParams(window.location.search);
let userId = urlParams.get('user_id') || 1;

document.getElementById('calculateBtn').addEventListener('click', () => {
  const prefs = Array.from(document.querySelectorAll('input[name="preferences"]:checked')).map(el => el.value);
  const menus = Array.from(document.querySelectorAll('input[name="menu"]:checked')).map(el => el.value);

  if (menus.length !== 4) {
    alert("Merci de sélectionner exactement 4 plats.");
    return;
  }

  // Récupérer poids et taille des inputs
  const poidsInput = document.getElementById('inputPoids');
  const tailleInput = document.getElementById('inputTaille');
  const poids = parseFloat(poidsInput.value);
  const taille = parseFloat(tailleInput.value);

  // Validation stricte des données
  if (!poids || !taille || poids <= 0 || taille <= 0 || poids < 20 || taille < 100 || taille > 300) {
    alert("Merci de saisir un poids (min 20kg) et une taille (100-300cm) valides.");
    return;
  }

  console.log("Données envoyées au backend :", {
    user_id: parseInt(userId),
    preferences: prefs,
    menu_original: menus,
    poids: poids,
    taille: taille
  });

  // Affichage des messages de loading
  document.getElementById('results').textContent = "Calcul en cours...";
  document.getElementById('imcResult').textContent = "Calcul de l'IMC en cours...";

  fetch('/api/nutrition', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      user_id: parseInt(userId),
      preferences: prefs,
      menu_original: menus,
      poids: poids,
      taille: taille
    })
  })
  .then(res => {
    if (!res.ok) {
      throw new Error(`Erreur HTTP: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log("Réponse reçue:", data);

    // ===== AFFICHAGE IMC (INDÉPENDANT DE L'IA) =====
    if (data.imc_info) {
      const info = data.imc_info;
      const imc = typeof info.imc === "number" ? info.imc.toFixed(2) : "N/A";
      const interpretation = info.interpretation || "";
      const poidsAffiche = info.poids || "N/A";
      const tailleAffiche = info.taille ? (info.taille/100).toFixed(2) : "N/A";
      
      document.getElementById('imcResult').innerHTML = `
        <strong>Votre IMC :</strong> ${imc} ${interpretation ? `(${interpretation})` : ""}
        <br><strong>Poids :</strong> ${poidsAffiche} kg |
        <strong>Taille :</strong> ${tailleAffiche} m
      `;
    } else {
      document.getElementById('imcResult').textContent = "❌ IMC non calculable.";
    }

    // ===== AFFICHAGE DU MENU =====
    let html = "";
    
    if (data.nutrition && data.nutrition.length > 0) {
      // Indicateur de source du menu
      const sourceIcon = data.source_menu === "IA" ? "🤖" : "📋";
      const sourceText = data.source_menu === "IA" ? "généré par l'IA" : "menu de fallback";
      
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

    // ===== RÉPONSE BRUTE DE L'IA (POUR DEBUG) =====
    if (data.raw_response) {
      html += `<h3>Détails techniques :</h3>
      <div style="background:#f9f9f9; padding:10px; border-radius:5px; max-height:200px; overflow:auto; font-size:12px;">
        <strong>Source:</strong> ${data.source_menu || 'inconnu'}<br>
        <strong>Réponse brute:</strong><br>
        <pre>${data.raw_response}</pre>
      </div>`;
    }

    // ===== LIEN VERS RECETTES =====
    let platsParam = '';
    if (data.nutrition && data.nutrition.length > 0) {
      platsParam = data.nutrition.map(item => encodeURIComponent(item.name || '')).join(',');
    } else {
      platsParam = menus.map(p => encodeURIComponent(p)).join(',');
    }

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
    document.getElementById('results').textContent = `❌ Erreur lors du calcul: ${err.message}`;
    document.getElementById('imcResult').textContent = "❌ Erreur lors du calcul de l'IMC.";
  });
});

// ===== GESTION DES PRÉFÉRENCES VÉGÉTARIENNES =====
const vegetarianCheckbox = document.querySelector('input[value="végétarien"]');
const menuCheckboxes = document.querySelectorAll('input[name="menu"]');
const meatDishes = ["Poulet DG", "Cheeseburger", "Hot dog", "Brochettes de bœuf", "Ndolé", "Poisson braisé", "Sandwich au thon"];

if (vegetarianCheckbox) {
  vegetarianCheckbox.addEventListener('change', () => {
    if (vegetarianCheckbox.checked) {
      // Désactiver les plats avec viande
      menuCheckboxes.forEach(checkbox => {
        if (meatDishes.includes(checkbox.value)) {
          checkbox.checked = false;
          checkbox.disabled = true;
          checkbox.parentElement.style.opacity = '0.5';
        }
      });
    } else {
      // Réactiver tous les plats
      menuCheckboxes.forEach(checkbox => {
        if (meatDishes.includes(checkbox.value)) {
          checkbox.disabled = false;
          checkbox.parentElement.style.opacity = '1';
        }
      });
    }
  });
}
