const params = new URLSearchParams(window.location.search);
const plats = params.get('plats') ? params.get('plats').split(',') : [];
const div = document.getElementById('recettes');
let recettesData = []; // pour PDF

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

    recettesData = data.recettes;
    data.recettes.forEach(r => {
      div.innerHTML += `
        <div class="recette">
          <h2>${r.name}</h2>
          <p>${r.recette.replace(/\n/g, "<br>")}</p>
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
  const doc = new jsPDF({ unit: 'mm', format: 'a4' }); // pour unité claire

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

  recettesData.forEach(r => {
    if (y > 260) { doc.addPage(); y = 20; }

    // Nom du plat
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(46, 125, 50);
    doc.text(r.name, 20, y);
    y += 8;

    // Recette (texte formaté)
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

  doc.save("recettes.pdf");
});

