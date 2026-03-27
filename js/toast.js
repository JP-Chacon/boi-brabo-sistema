(() => {
  const PENDING_TOAST_KEY = "pending-toast";
  const DEFAULT_DURATION = 4200;
  let container = null;

  function ensureContainer() {
    if (container?.isConnected) return container;

    container = document.querySelector("[data-toast-container]");
    if (container) return container;

    container = document.createElement("div");
    container.className = "app-toast-stack";
    container.setAttribute("data-toast-container", "");
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);
    return container;
  }

  function getIcon(type) {
    const icons = {
      success:
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>',
      error:
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>',
      warning:
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>',
      info:
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>',
    };
    return icons[type] || icons.info;
  }

  function removeToast(toast) {
    if (!toast || toast.dataset.leaving === "true") return;
    toast.dataset.leaving = "true";
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 220);
  }

  function show(message, { type = "info", title = "", duration = DEFAULT_DURATION } = {}) {
    const text = String(message || "").trim();
    if (!text) return null;

    const host = ensureContainer();
    const toast = document.createElement("div");
    toast.className = "app-toast";
    toast.dataset.type = type;
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    toast.innerHTML = `
      <div class="app-toast-icon">${getIcon(type)}</div>
      <div class="app-toast-body">
        ${title ? `<div class="app-toast-title">${title}</div>` : ""}
        <div class="app-toast-text">${text}</div>
      </div>
      <button class="app-toast-close" type="button" aria-label="Fechar notificação">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
    `;

    const closeBtn = toast.querySelector(".app-toast-close");
    closeBtn?.addEventListener("click", () => removeToast(toast));

    host.appendChild(toast);

    if (duration > 0) {
      window.setTimeout(() => removeToast(toast), duration);
    }

    return toast;
  }

  function queuePendingToast(payload) {
    try {
      sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify(payload));
    } catch {}
  }

  function consumePendingToast() {
    try {
      const raw = sessionStorage.getItem(PENDING_TOAST_KEY);
      if (!raw) return;
      sessionStorage.removeItem(PENDING_TOAST_KEY);
      const payload = JSON.parse(raw);
      if (payload?.message) show(payload.message, payload);
    } catch {}
  }

  window.appToast = {
    show,
    success: (message, options = {}) => show(message, { ...options, type: "success" }),
    error: (message, options = {}) => show(message, { ...options, type: "error" }),
    warning: (message, options = {}) => show(message, { ...options, type: "warning" }),
    info: (message, options = {}) => show(message, { ...options, type: "info" }),
    queuePendingToast,
    consumePendingToast,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureContainer, { once: true });
  } else {
    ensureContainer();
  }
})();
