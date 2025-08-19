  // Initialize particles.js
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: ["#6366f1", "#22c55e", "#f59e0b", "#a855f7"] },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.3 } },
                size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 1 } },
                line_linked: { 
                    enable: true, 
                    distance: 150, 
                    color: "#ffffff", 
                    opacity: 0.2, 
                    width: 1 
                },
                move: { 
                    enable: true, 
                    speed: 2, 
                    direction: "none", 
                    random: true, 
                    straight: false, 
                    out_mode: "out" 
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" }
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 0.5 } },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }

    // Navigation scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const menuLines = document.querySelectorAll('.menu-line');
    let isMenuOpen = false;

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            isMenuOpen = !isMenuOpen;
            navLinks.classList.toggle('active');
            
            if (isMenuOpen) {
                menuLines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                menuLines[1].style.opacity = '0';
                menuLines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                menuLines.forEach(line => {
                    line.style.transform = '';
                    line.style.opacity = '';
                });
            }
        });
    }

    // Generate sample menu (for demo purposes)
    const regenBtn = document.getElementById('regenBtn');
    const menusContainer = document.getElementById('menus');
    
    if (regenBtn && menusContainer) {
        regenBtn.addEventListener('click', function() {
            menusContainer.classList.add('loading');
            menusContainer.innerHTML = `
                <div class="spinner">
                    <i class="fas fa-circle-notch fa-spin"></i>
                </div>
                <p>Création de votre menu personnalisé...</p>
            `;
            
            // Simulate API call delay
            setTimeout(() => {
                generateSampleMenu();
            }, 1500);
        });
        
        // Generate initial menu
        generateSampleMenu();
    }
    
    function generateSampleMenu() {
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const meals = ['Petit-déjeuner', 'Déjeuner', 'Dîner'];
        const cameroonianDishes = [
            'Ndolé avec plantain mûr',
            'Poulet DG avec riz blanc',
            'Eru et water fufu',
            'Kondrè et igname pilé',
            'Poulet rôti et bâton de manioc',
            'Sauce jaune avec couscous de maïs',
            'Okok avec miondo',
            'Taro sauce jaune',
            'Poisson braisé avec plantain',
            'Koki maïs et plantain'
        ];
        
        const internationalDishes = [
            'Salade César au poulet',
            'Pâtes carbonara',
            'Riz sauté aux légumes',
            'Omelette aux champignons',
            'Quiche lorraine',
            'Gratin dauphinois',
            'Lasagnes bolognaise',
            'Burger maison avec frites',
            'Pizza margherita',
            'Tajine d\'agneau aux pruneaux'
        ];
        
        let menuHTML = '';
        
        // Generate 3 days of menu
        for (let i = 0; i < 3; i++) {
            menuHTML += `
                <div class="menu-day">
                    <h3 class="menu-title">${days[i]}</h3>
            `;
            
            for (let j = 0; j < meals.length; j++) {
                const isBreakfast = j === 0;
                const dishes = isBreakfast 
                    ? ['Fruits de saison', 'Pain complet avec confiture maison', 'Thé vert ou café']
                    : [
                        cameroonianDishes[Math.floor(Math.random() * cameroonianDishes.length)],
                        internationalDishes[Math.floor(Math.random() * internationalDishes.length)],
                        'Salade verte avec vinaigrette légère',
                        'Dessert: Fruit ou yaourt nature'
                    ];
                
                menuHTML += `
                    <div class="meal">
                        <h4 class="meal-title">
                            <i class="fas ${isBreakfast ? 'fa-coffee' : j === 1 ? 'fa-utensils' : 'fa-moon'}"></i>
                            ${meals[j]}
                        </h4>
                        <ul class="meal-dishes">
                            ${dishes.map(dish => `<li>${dish}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
            
            menuHTML += `</div>`;
        }
        
        menusContainer.classList.remove('loading');
        menusContainer.innerHTML = menuHTML;
        
        // Add animation to menu items
        const menuDays = menusContainer.querySelectorAll('.menu-day');
        menuDays.forEach((day, index) => {
            day.style.opacity = '0';
            day.style.transform = 'translateY(20px)';
            day.style.transition = `all 0.5s ease ${index * 0.2}s`;
            
            setTimeout(() => {
                day.style.opacity = '1';
                day.style.transform = 'translateY(0)';
            }, 100);
        });
    }
    
    // Hide info panel after 10 seconds
    setTimeout(() => {
        const infoPanel = document.querySelector('.info-panel');
        if (infoPanel) {
            infoPanel.style.transform = 'translateY(100px) scale(0.8)';
            infoPanel.style.opacity = '0';
            setTimeout(() => {
                infoPanel.style.display = 'none';
            }, 500);
        }
    }, 10000);
});
