(() => {
  const THEME_KEY = "app-theme";

  function normalizeTheme(value) {
    return value === "dark" ? "dark" : "light";
  }

  function getCurrentTheme() {
    return normalizeTheme(document.documentElement.dataset.theme || localStorage.getItem(THEME_KEY));
  }

  function updateToggleUi(theme) {
    const isDark = theme === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("title", isDark ? "Ativar modo claro" : "Ativar modo escuro");
      button.dataset.theme = theme;
      const label = button.querySelector("[data-theme-label]");
      if (label) label.textContent = isDark ? "Modo escuro" : "Modo claro";
    });
  }

  function applyTheme(theme, { persist = true } = {}) {
    const resolved = normalizeTheme(theme);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, resolved);
      } catch {}
    }
    updateToggleUi(resolved);
  }

  function toggleTheme() {
    applyTheme(getCurrentTheme() === "dark" ? "light" : "dark");
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(getCurrentTheme(), { persist: false });
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", toggleTheme);
    });
  });

  window.themeController = {
    applyTheme,
    toggleTheme,
    getCurrentTheme,
  };
})();
