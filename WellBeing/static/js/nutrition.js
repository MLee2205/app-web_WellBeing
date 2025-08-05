let chartInstance = null;
const urlParams = new URLSearchParams(window.location.search);
let userId = urlParams.get('user_id') || 1;

document.getElementById('calculateBtn').addEventListener('click', () => {
  const prefs = Array.from(document.querySelectorAll('input[name="preferences"]:checked')).map(el => el.value);
  const menus = Array.from(document.querySelectorAll('input[name="menu"]:checked')).map(el => el.value);

  if (menus.length < 1) {
    alert("Merci de sélectionner au moins un plats.");
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
    alert("Merci d’indiquer l’heure de début et de fin du jeûne sélectionné.");
    return;
  }

  const fasting = fastingType ? {
    type: fastingType,
    start: fastingStart,
    end: fastingEnd
  } : null;

  console.log("Données envoyées au backend :", {
    user_id: parseInt(userId),
    preferences: prefs,
    menu_original: menus,
    poids,
    taille,
    fasting
  });

  document.getElementById('results').textContent = "Calcul en cours...";
  document.getElementById('imcResult').textContent = "Calcul de l'IMC en cours...";

  fetch('/api/nutrition', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      user_id: parseInt(userId),
      preferences: prefs,
      menu_original: menus,
      poids,
      taille,
      fasting
    })
  })
    .then(res => {
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log("Réponse reçue:", data);

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
      } else {
        document.getElementById('imcResult').textContent = "❌ IMC non calculable.";
      }

      let html = "";

      if (data.nutrition && data.nutrition.length > 0) {
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

      if (data.raw_response) {
        html += `<h3>Détails techniques :</h3>
          <div style="background:#f9f9f9; padding:10px; border-radius:5px; max-height:200px; overflow:auto; font-size:12px;">
            <strong>Source:</strong> ${data.source_menu || 'inconnu'}<br>
            <strong>Réponse brute:</strong><br>
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
      document.getElementById('results').textContent = `❌ Erreur lors du calcul: ${err.message}`;
      document.getElementById('imcResult').textContent = "❌ Erreur lors du calcul de l'IMC.";
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

