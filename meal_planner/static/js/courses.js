// Supposons que 'recettes' est une variable globale qui contient les recettes reçues du backend (via template Flask)

const listDiv = document.getElementById('ingredientsList');

function afficherIngredients(recettes) {
  if (!recettes.length) {
    listDiv.textContent = "Aucun ingrédient disponible.";
    return;
  }

  let html = "";
  recettes.forEach(r => {
    html += `<h2>${r.name}</h2><ul>`;
    if (r.ingredients && r.ingredients.length > 0) {
      r.ingredients.forEach(ing => {
        html += `<li>${ing}</li>`;
      });
    } else {
      html += "<li>Ingrédients non disponibles</li>";
    }
    html += "</ul>";
  });

  listDiv.innerHTML = html;
}

// Appeler à l’ouverture de la page pour afficher la liste
afficherIngredients(recettes);


// Export PDF
document.getElementById('exportBtn').addEventListener('click', () => {
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
  doc.text("Liste des ingrédients", 105, y, { align: "center" });
  y += 10;

  recettes.forEach(r => {
    if (y > 260) { doc.addPage(); y = 20; }

    // Encadré arrondi
    const boxHeight = 8 + (r.ingredients.length || 1) * 7 + 6;
    doc.setDrawColor(76, 175, 80);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, y - 5, 180, boxHeight, 3, 3);

    // Nom du plat
    doc.setFont("courier", "italic");
    doc.setFontSize(14);
    doc.setTextColor(46, 125, 50);
    doc.text(r.name, 105, y + 5, { align: "center" });
    y += 12;

    // Ingrédients
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    if (r.ingredients && r.ingredients.length > 0) {
      r.ingredients.forEach(ing => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(`• ${ing}`, 20, y);
        y += 7;
      });
    } else {
      doc.text("- Ingrédients non disponibles", 20, y);
      y += 7;
    }

    y += 8;
  });
// Ajout du texte "Réalisé par Meffo Lea" à la fin
if (y > 280) { 
  doc.addPage(); 
  y = 20; 
}
doc.setFont("helvetica", "italic");
doc.setFontSize(12);
doc.setTextColor(100, 100, 100); // gris foncé
doc.text("Réalisé par Meffo Lea", 105, y, { align: "center" });

  doc.save("liste_courses.pdf");
});

