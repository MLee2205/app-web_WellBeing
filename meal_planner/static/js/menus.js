function showLoading() {
    const container = document.getElementById('menus');
    container.innerHTML = '<div class="loading">Génération de votre menu...</div>';
}

function showError(message) {
    const container = document.getElementById('menus');
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #e74c3c;">
            <h3>❌ ${message}</h3>
            <p style="margin-top: 10px; color: #7f8c8d;">Veuillez réessayer dans quelques instants.</p>
        </div>
    `;
}

function loadMenus(endpoint = '/api/menus') {
    showLoading();
    fetch(endpoint)
        .then(res => {
            if (!res.ok) throw new Error(`Erreur ${res.status}`);
            return res.json();
        })
        .then(data => {
            displayMenu(data);
        })
        .catch(err => {
            console.error('Erreur:', err);
            showError('Erreur lors du chargement du menu');
        });
}

function displayMenu(data) {
    const container = document.getElementById('menus');
    const menu = data.menu;

    if (!menu) {
        showError('Aucun menu reçu du serveur');
        return;
    }

    let html = '';

    // Info sur la source du menu
    if (data.source) {
        const sourceInfo = {
            'ai_generated': '🤖 Menu généré par IA',
            'fallback': '📋 Menu de référence',
            'random_fallback': '🎲 Menu surprise',
            'fallback_after_error': '⚠️ Menu de secours'
        };
        html += `<div style="text-align: center; margin-bottom: 20px; color: #7f8c8d; font-style: italic;">
            ${sourceInfo[data.source] || 'Menu personnalisé'}
        </div>`;
    }

    for (const category in menu) {
        html += `
            <div class="menu-category fade-in">
                <h2>${category}</h2>
                <div class="menu-items">
        `;

        menu[category].forEach(item => {
            const type = item.type || 'mixed';
            html += `
                <div class="menu-item ${type}">
                    <div class="menu-item-name">${item.name}</div>
                    <span class="menu-item-type ${type}">${type}</span>
                </div>
            `;
        });

        html += '</div></div>';
    }

    container.innerHTML = html;

    // Activer l'animation fade-in
    setTimeout(() => {
        const elements = container.querySelectorAll('.fade-in');
        elements.forEach(el => el.style.opacity = '1');
    }, 100);
}

function toggleButtons(disabled) {
    document.getElementById('regenBtn').disabled = disabled;
}

// Event listeners
document.getElementById('regenBtn').addEventListener('click', () => {
    toggleButtons(true);
    loadMenus('/api/menus');
    setTimeout(() => toggleButtons(false), 2000);
});

// Charger le menu initial au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadMenus();
});

