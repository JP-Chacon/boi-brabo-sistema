(() => {
  let overlayEl = null;
  let pendingResolve = null;
  let focusBeforeOpen = null;
  let confirmAction = () => {};
  /** @type {"confirm" | "alert"} */
  let modalKind = "confirm";

  function finish(result) {
    if (!pendingResolve || !overlayEl) return;

    const resolve = pendingResolve;
    pendingResolve = null;

    overlayEl.classList.remove("is-open");
    document.body.style.overflow = "";

    const cleanup = () => {
      overlayEl.hidden = true;
      if (modalKind === "alert") {
        resolve();
      } else {
        resolve(Boolean(result));
      }
      if (focusBeforeOpen && typeof focusBeforeOpen.focus === "function") {
        try {
          focusBeforeOpen.focus({ preventScroll: true });
        } catch {
          focusBeforeOpen.focus();
        }
      }
      focusBeforeOpen = null;
    };

    let done = false;
    const onTransitionEnd = (e) => {
      if (e.target !== overlayEl || e.propertyName !== "opacity") return;
      done = true;
      overlayEl.removeEventListener("transitionend", onTransitionEnd);
      cleanup();
    };

    overlayEl.addEventListener("transitionend", onTransitionEnd);
    window.setTimeout(() => {
      if (!done) {
        overlayEl.removeEventListener("transitionend", onTransitionEnd);
        cleanup();
      }
    }, 300);
  }

  function ensureModal() {
    if (overlayEl) return overlayEl;

    overlayEl = document.createElement("div");
    overlayEl.className = "app-modal-overlay";
    overlayEl.id = "appModalOverlay";
    overlayEl.hidden = true;
    overlayEl.setAttribute("role", "presentation");
    overlayEl.innerHTML = `
      <div class="app-modal" role="dialog" aria-modal="true" aria-labelledby="appModalTitle" aria-describedby="appModalMessage">
        <div class="app-modal-inner">
          <h2 id="appModalTitle" class="app-modal-title"></h2>
          <p id="appModalMessage" class="app-modal-message"></p>
          <div class="app-modal-actions">
            <button type="button" class="saas-btn saas-btn-ghost app-modal-btn-cancel"></button>
            <button type="button" class="saas-btn primary app-modal-btn-confirm"></button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlayEl);

    const modal = overlayEl.querySelector(".app-modal");
    const btnCancel = overlayEl.querySelector(".app-modal-btn-cancel");
    const btnConfirm = overlayEl.querySelector(".app-modal-btn-confirm");

    overlayEl.addEventListener("mousedown", (e) => {
      if (e.target === overlayEl) {
        finish(modalKind === "alert" ? undefined : false);
      }
    });

    modal.addEventListener("click", (e) => e.stopPropagation());

    btnCancel.addEventListener("click", () => finish(false));
    btnConfirm.addEventListener("click", () => {
      confirmAction();
    });

    document.addEventListener("keydown", (e) => {
      if (!overlayEl || overlayEl.hidden) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        finish(modalKind === "alert" ? undefined : false);
      }
    });

    return overlayEl;
  }

  /**
   * @param {object} [opts]
   * @param {string} [opts.title]
   * @param {string} [opts.message]
   * @param {string} [opts.confirmText]
   * @param {string} [opts.cancelText]
   * @param {() => void | Promise<void>} [opts.onConfirm]
   * @returns {Promise<boolean>}
   */
  function showConfirmModal(opts = {}) {
    if (pendingResolve) {
      return Promise.resolve(false);
    }

    const {
      title = "Confirmar",
      message = "",
      confirmText = "Confirmar",
      cancelText = "Cancelar",
      onConfirm,
    } = opts;

    modalKind = "confirm";
    ensureModal();

    const btnCancel = overlayEl.querySelector(".app-modal-btn-cancel");
    const btnConfirm = overlayEl.querySelector(".app-modal-btn-confirm");
    const actions = overlayEl.querySelector(".app-modal-actions");

    overlayEl.querySelector("#appModalTitle").textContent = title;
    overlayEl.querySelector("#appModalMessage").textContent = message;
    btnCancel.textContent = cancelText;
    btnConfirm.textContent = confirmText;

    btnCancel.hidden = false;
    btnCancel.style.display = "";
    actions.classList.remove("app-modal-actions--single");

    confirmAction = async () => {
      if (typeof onConfirm === "function") {
        try {
          await Promise.resolve(onConfirm());
        } catch {
          return;
        }
      }
      finish(true);
    };

    return new Promise((resolve) => {
      pendingResolve = resolve;
      focusBeforeOpen = document.activeElement;

      overlayEl.hidden = false;
      requestAnimationFrame(() => {
        overlayEl.classList.add("is-open");
        requestAnimationFrame(() => {
          btnConfirm.focus({ preventScroll: true });
        });
      });

      document.body.style.overflow = "hidden";
    });
  }

  /**
   * @param {object} [opts]
   * @param {string} [opts.title]
   * @param {string} [opts.message]
   * @param {string} [opts.confirmText]
   * @returns {Promise<void>}
   */
  function showAlertModal(opts = {}) {
    if (pendingResolve) {
      return Promise.resolve();
    }

    const { title = "Aviso", message = "", confirmText = "OK" } = opts;

    modalKind = "alert";
    ensureModal();

    const btnCancel = overlayEl.querySelector(".app-modal-btn-cancel");
    const btnConfirm = overlayEl.querySelector(".app-modal-btn-confirm");
    const actions = overlayEl.querySelector(".app-modal-actions");

    overlayEl.querySelector("#appModalTitle").textContent = title;
    overlayEl.querySelector("#appModalMessage").textContent = message;
    btnConfirm.textContent = confirmText;

    btnCancel.hidden = true;
    btnCancel.style.display = "none";
    actions.classList.add("app-modal-actions--single");

    confirmAction = () => finish(undefined);

    return new Promise((resolve) => {
      pendingResolve = resolve;
      focusBeforeOpen = document.activeElement;

      overlayEl.hidden = false;
      requestAnimationFrame(() => {
        overlayEl.classList.add("is-open");
        requestAnimationFrame(() => {
          btnConfirm.focus({ preventScroll: true });
        });
      });

      document.body.style.overflow = "hidden";
    });
  }

  window.showConfirmModal = showConfirmModal;
  window.showAlertModal = showAlertModal;
})();
