const params = new URLSearchParams(window.location.search);
const plats = params.get('plats') ? params.get('plats').split(',') : [];

const div = document.getElementById('recettes');
let recettesData = []; // pour stocker les recettes et exporter en PDF

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

    recettesData = data.recettes; // stocker pour le PDF

    data.recettes.forEach(r => {
      const texteAffiche = r.raw_response ? r.raw_response.replace(/\n/g, "<br>") : "Pas de réponse.";
      div.innerHTML += `
        <div class="recette">
          <h2>${r.name}</h2>
          <pre>${texteAffiche}</pre>
        </div>`;
    });
  })
  .catch(err => {
    console.error(err);
    div.textContent = "Erreur lors du chargement des recettes.";
  });
}


// Export PDF
document.getElementById('exportBtn').addEventListener('click', () => {
  if (!recettesData || recettesData.length === 0) {
    alert("Aucune recette à exporter.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  // Titre principal
  doc.setFont("courier", "bold");
  doc.setFontSize(24);
  doc.setTextColor(33, 150, 243);
  doc.text(" WellBeing", 105, y, { align: "center" });
  y += 12;

  // Sous-titre
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Recettes adaptées", 105, y, { align: "center" });
  y += 10;

  recettesData.forEach(r => {
    if (y > 260) { doc.addPage(); y = 20; }

    // Encadré arrondi
    const rawText = r.raw_response ? r.raw_response : "Pas de réponse.";
    const lines = doc.splitTextToSize(rawText, 170); // 170px de largeur max

    const boxHeight = 8 + lines.length * 7 + 6;
    doc.setDrawColor(76, 175, 80);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, y - 5, 180, boxHeight, 3, 3);

    // Nom du plat
    doc.setFont("courier", "italic");
    doc.setFontSize(14);
    doc.setTextColor(46, 125, 50);
    doc.text(r.name, 105, y + 5, { align: "center" });
    y += 12;

    // Texte complet de la recette
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    lines.forEach(line => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += 7;
    });

    y += 8;
  });

  // Signature à la fin
  if (y > 280) { doc.addPage(); y = 20; }
  doc.setFont("helvetica", "italic");
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Réalisé par Meffo Lea", 105, y, { align: "center" });

  doc.save("recettes.pdf");
});

