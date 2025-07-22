const params = new URLSearchParams(window.location.search);
const plats = params.get('plats') ? params.get('plats').split(',') : [];

const div = document.getElementById('recettes');

if (plats.length === 0) {
  div.textContent = "Aucun plat fourni.";
} else {
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
      div.textContent = "Aucune recette trouvée pour ces plats.";
      return;
    }

    data.recettes.forEach(r => {
      const texteAffiche = r.raw_response ? r.raw_response.replace(/\n/g, "<br>") : "Pas de réponse.";
      div.innerHTML += `
        <div class="recette">
          <h2>${r.name}</h2>
          <pre>${texteAffiche}</pre>
        </div>`;
    });

    const platsParam = data.recettes.map(r => encodeURIComponent(r.name)).join(',');
    div.innerHTML += `
      <p style="text-align:center;">
        <a href="/courses?plats=${platsParam}" class="liste-courses-btn">
          Voir la liste de courses 🛒
        </a>
      </p>`;
  })
  .catch(err => {
    console.error(err);
    div.textContent = "Erreur lors du chargement des recettes.";
  });
}

