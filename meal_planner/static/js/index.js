// Création des particules d'arrière-plan
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 50;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
                
                particlesContainer.appendChild(particle);
            }
        }

        // Navigation avec effet de scroll
        function handleNavScroll() {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Animation des éléments au scroll
        function animateOnScroll() {
            const elements = document.querySelectorAll('.animate-on-scroll');
            
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add('visible');
                }
            });
        }

        // Smooth scroll pour les liens internes
        function setupSmoothScroll() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                });
            });
        }

        // Animation des statistiques
        function animateStats() {
            const stats = document.querySelectorAll('.stat-item h3');
            stats.forEach(stat => {
                const finalValue = stat.textContent;
                const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
                
                if (numericValue) {
                    let currentValue = 0;
                    const increment = numericValue / 50;
                    const timer = setInterval(() => {
                        currentValue += increment;
                        if (currentValue >= numericValue) {
                            stat.textContent = finalValue;
                            clearInterval(timer);
                        } else {
                            stat.textContent = Math.floor(currentValue) + finalValue.replace(/[\d]/g, '').slice(-1);
                        }
                    }, 30);
                }
            });
        }

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            createParticles();
            setupSmoothScroll();
            
            // Observer pour les animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (entry.target.classList.contains('stats')) {
                            animateStats();
                        }
                    }
                });
            });

            document.querySelectorAll('.stats').forEach(el => {
                observer.observe(el);
            });
        });

        // Event listeners
        window.addEventListener('scroll', handleNavScroll);
        window.addEventListener('scroll', animateOnScroll);

        // Gestion des erreurs de chargement des images
        document.addEventListener('error', function(e) {
            if (e.target.tagName === 'IMG') {
                e.target.style.display = 'none';
            }
        }, true);
