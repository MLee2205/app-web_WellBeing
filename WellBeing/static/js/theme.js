document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("theme-toggle");

    // Vérifie si un thème est déjà sauvegardé
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
    }

    updateThemeIcon(document.documentElement.getAttribute("data-theme"));

    toggleBtn.addEventListener("click", () => {
        let current = document.documentElement.getAttribute("data-theme");
        let newTheme = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        toggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
    }
});