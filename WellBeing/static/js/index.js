// Preloader
window.addEventListener('load', function() {
    setTimeout(() => {
        const preloader = document.querySelector('.preloader');
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 800);
    }, 1000);
});

// Particles.js configuration
document.addEventListener('DOMContentLoaded', function() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 100, density: { enable: true, value_area: 1000 } },
                color: { value: ["#6366f1", "#22c55e", "#f59e0b", "#a855f7"] },
                shape: { type: "circle" },
                opacity: { value: 0.6, random: true, anim: { enable: true, speed: 1, opacity_min: 0.3 } },
                size: { value: 4, random: true, anim: { enable: true, speed: 2, size_min: 1 } },
                line_linked: { 
                    enable: true, 
                    distance: 150, 
                    color: "#ffffff", 
                    opacity: 0.3, 
                    width: 1 
                },
                move: { 
                    enable: true, 
                    speed: 3, 
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
                    grab: { distance: 200, line_linked: { opacity: 0.8 } },
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

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '-50px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Special handling for stats counter animation
                if (entry.target.classList.contains('stat-item')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.feature-card, .step, .stat-item, .stats-cta').forEach(el => {
        observer.observe(el);
    });

    // Counter animation for stats
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();
            
            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.round(target * easeOutQuart);
                
                counter.textContent = current;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            }
            
            requestAnimationFrame(updateCounter);
        });
    }

    // Parallax effect for floating shapes
    function updateParallax() {
        const shapes = document.querySelectorAll('.shape');
        const scrolled = window.pageYOffset;
        
        shapes.forEach((shape, index) => {
            const rate = scrolled * -0.3 * (index + 1) * 0.5;
            shape.style.transform = `translateY(${rate}px)`;
        });
    }

    // Throttled scroll handler for better performance
    let ticking = false;
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', handleScroll);

    // Enhanced hover effects for cards
    const cards = document.querySelectorAll('.feature-card, .stat-item');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // Error handling for missing images
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            e.target.style.opacity = '0.5';
            //e.target.alt = 'Image non disponible';
        }
    }, true);

    // Add loading states and smooth transitions
    window.addEventListener('beforeunload', function() {
        document.body.style.opacity = '0';
    });
});

// Fonction de redirection vers la page de login
function redirectToLogin() {
    window.location.href = '/login';
}

// Ajouter la gestion du clavier pour l'accessibilité
document.querySelectorAll('.step').forEach(step => {
    // Gestion de la touche Entrée pour l'accessibilité
    step.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            redirectToLogin();
        }
    });
    
    // Ajouter un tabindex pour permettre la navigation au clavier
    step.setAttribute('tabindex', '0');
    
    // Ajouter un rôle pour l'accessibilité
    step.setAttribute('role', 'button');
    
    // Ajouter une description pour les lecteurs d'écran
    step.setAttribute('aria-label', 'Cliquez pour accéder à la page de connexion');
});


// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log(`Page loaded in ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
        }, 0);
    });
}
