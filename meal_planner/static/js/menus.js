   let currentPreferences = {
            diet: 'mixed',
            cuisine: 'both'
        };

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

        function updatePreferences() {
            currentPreferences.diet = document.getElementById('dietSelect').value;
            currentPreferences.cuisine = document.getElementById('cuisineSelect').value;
        }

        function loadMenus(endpoint = '/api/menus') {
            showLoading();
            updatePreferences();

            const params = new URLSearchParams(currentPreferences);
            const url = `${endpoint}?${params}`;

            fetch(url)
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

            // Activer les animations
            setTimeout(() => {
                const elements = container.querySelectorAll('.fade-in');
                elements.forEach(el => el.style.opacity = '1');
            }, 100);
        }

        function toggleButtons(disabled) {
            document.getElementById('regenBtn').disabled = disabled;
            document.getElementById('randomBtn').disabled = disabled;
        }

        // Event listeners
        document.getElementById('regenBtn').addEventListener('click', () => {
            toggleButtons(true);
            loadMenus('/api/menus');
            setTimeout(() => toggleButtons(false), 2000);
        });

        document.getElementById('randomBtn').addEventListener('click', () => {
            toggleButtons(true);
            loadMenus('/api/menus/random');
            setTimeout(() => toggleButtons(false), 2000);
        });

        // Charger les préférences et le menu initial
        document.addEventListener('DOMContentLoaded', () => {
            // Charger les options de préférences
            fetch('/api/menus/preferences')
                .then(res => res.json())
                .then(data => {
                    // Ici on pourrait dynamiquement peupler les selects
                    // Pour l'instant on garde les options en dur
                })
                .catch(err => console.log('Préférences par défaut utilisées'));

            // Charger le menu initial
            loadMenus();
        });

        // Sauvegarder les préférences dans localStorage (si supporté)
        document.getElementById('dietSelect').addEventListener('change', () => {
            updatePreferences();
            try {
                localStorage.setItem('menuPreferences', JSON.stringify(currentPreferences));
            } catch (e) {}
        });

        document.getElementById('cuisineSelect').addEventListener('change', () => {
            updatePreferences();
            try {
                localStorage.setItem('menuPreferences', JSON.stringify(currentPreferences));
            } catch (e) {}
        });

        // Restaurer les préférences sauvegardées
        try {
            const saved = localStorage.getItem('menuPreferences');
            if (saved) {
                const prefs = JSON.parse(saved);
                document.getElementById('dietSelect').value = prefs.diet || 'mixed';
                document.getElementById('cuisineSelect').value = prefs.cuisine || 'both';
                updatePreferences();
            }
        } catch (e) {}
