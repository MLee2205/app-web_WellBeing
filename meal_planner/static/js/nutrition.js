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

  document.getElementById('results').textContent = "Calcul en cours...";
  document.getElementById('imcResult').textContent = "Calcul de l'IMC en cours...";

  fetch('/api/nutrition', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ user_id: parseInt(userId), preferences: prefs, menu_original: menus })
  })
  .then(res => res.json())
  .then(data => {
    // Afficher l'IMC
    if (data.imc_info) {
      const info = data.imc_info;
      let imc = typeof info.imc === "number" ? info.imc.toFixed(2) : "N/A";
      document.getElementById('imcResult').innerHTML = `
        <strong>Votre IMC :</strong> ${imc} ${info.interpretation ? `(${info.interpretation})` : ""}
        <br><strong>Poids :</strong> ${info.poids || "N/A"} kg |
        <strong>Taille :</strong> ${info.taille ? (info.taille/100).toFixed(2) : "N/A"} m
      `;
    } else {
      document.getElementById('imcResult').textContent = "IMC non disponible.";
    }

    // Afficher le graphique
    if (data.imc_history?.length > 0) {
      const ctx = document.getElementById('imcChart').getContext('2d');
      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.imc_history.map(e => e.date),
          datasets: [{ label: 'IMC', data: data.imc_history.map(e => e.imc), borderColor: '#4CAF50' }]
        },
        options: { responsive: true }
      });
    }

    // Menu adapté
    let html = "";
    if (data.nutrition?.length > 0) {
      html += "<h2>Menu adapté</h2><table><tr><th>Plat</th><th>Calories</th><th>Protéines</th><th>Glucides</th><th>Lipides</th></tr>";
      data.nutrition.forEach(item => {
        html += `<tr><td>${item.name}</td><td>${item.calories}</td><td>${item.protein}</td><td>${item.carbs}</td><td>${item.fat}</td></tr>`;
      });
      html += "</table>";
      if (data.total_calories) html += `<p><strong>Total calories:</strong> ${data.total_calories}</p>`;
    } else {
      html += "<p>Aucun menu adapté reçu.</p>";
    }

    //  Afficher aussi le texte brut généré (même s'il n'est pas valide JSON)
    if (data.raw_response) {
      html += `<h3>Texte généré par l'IA :</h3>
      <pre style="background:#f9f9f9; padding:10px; border-radius:5px; max-height:300px; overflow:auto;">${data.raw_response}</pre>`;
    }

    //  Ajouter un bouton ou lien pour continuer
   // Construire la liste des plats pour la page recettes
    let platsParam = "";
    const platsGeneres = (data.nutrition || []).map(item => item.name).filter(Boolean);

    if (platsGeneres.length > 0) {
      //  si on a des plats générés, on les utilise
      platsParam = platsGeneres.map(p => encodeURIComponent(p)).join(',');
    } else {
      // sinon on utilise les menus choisis
      platsParam = menus.map(p => encodeURIComponent(p)).join(',');
    }


html += `<p style="margin-top:15px;">
  <a href="/recettes?plats=${platsParam}" class="btn" style="background:#2196F3; color:white; padding:8px 15px; border-radius:5px; text-decoration:none;">
    Continuer vers les recettes 🍽️
  </a></p>`;


    document.getElementById('results').innerHTML = html;
  })
  .catch(err => {
    console.error(err);
    document.getElementById('results').textContent = "❌ Erreur lors du calcul.";
    document.getElementById('imcResult').textContent = "";
  });
});

