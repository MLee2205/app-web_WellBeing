document.getElementById('confirmForm').addEventListener('submit', function (event) {
    const clickedButton = document.activeElement;
    if (clickedButton.name === 'confirm' && clickedButton.value === 'yes') {
        const confirmDelete = confirm("Cette action est irréversible. Voulez-vous continuer ?");
        if (!confirmDelete) {
            event.preventDefault();
        }
    }
});

