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
  
    // Gestionnaire pour les boutons d'abonnement - SIMPLIFIÉ
    document.querySelectorAll('.subscription-btn').forEach(button => {
      button.addEventListener('click', function() {
        const plan = this.getAttribute('data-plan');
        
        // Simuler le processus de paiement
        showModalAlert("Paiement en cours", "Veuillez patienter pendant le traitement de votre abonnement " + plan.replace('_', ' '), "info");
        
        // Après un délai, rediriger vers les recettes SANS sauvegarder l'abonnement
        setTimeout(() => {
          // Récupérer les plats sélectionnés depuis l'URL ou le localStorage
          const urlParams = new URLSearchParams(window.location.search);
          const plats = urlParams.get('plats') || localStorage.getItem('selected_plats') || '';
          
          // Redirection vers la page recettes
          window.location.href = `/recettes?plats=${plats}`;
        }, 2000);
      });
    });
  });
  
  // Fonction pour afficher les modals
  function showModalAlert(title, message, type = "info") {
    const existing = document.querySelector(".custom-modal");
    if (existing) existing.remove();
  
    const modal = document.createElement("div");
    modal.className = "custom-modal";
    modal.innerHTML = `
      <div class="modal-content ${type}">
        <div class="modal-icon">
          <i class="fas ${
            type === "error" ? "fa-times-circle" :
            type === "success" ? "fa-check-circle" :
            "fa-info-circle"
          }"></i>
        </div>
        <h2>${title}</h2>
        <p>${message}</p>
        <button id="modal-ok">OK</button>
      </div>
    `;
    document.body.appendChild(modal);
  
    modal.querySelector("#modal-ok").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  }