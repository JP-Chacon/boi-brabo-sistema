(() => {
  const API_BASE_URL =
    typeof window.resolveApiBaseUrl === "function"
      ? window.resolveApiBaseUrl()
      : window.location.origin && window.location.origin !== "null"
        ? window.location.origin
        : "http://localhost:3000";

  const form = document.getElementById("registerForm");
  const errorBox = document.getElementById("registerError");
  const nomeInput = document.getElementById("reg_nome");
  const usuarioInput = document.getElementById("reg_usuario");
  const senhaInput = document.getElementById("reg_senha");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const confirmPasswordError = document.getElementById("confirmPasswordError");

  const toggleRegPasswordBtn = document.getElementById("toggleRegPassword");
  const regEyeIcon = document.getElementById("regEyeIcon");
  const regEyeOffIcon = document.getElementById("regEyeOffIcon");

  const toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPassword");
  const confirmEyeIcon = document.getElementById("confirmEyeIcon");
  const confirmEyeOffIcon = document.getElementById("confirmEyeOffIcon");

  const registerBtn = document.getElementById("registerBtn");
  const registerBtnText = document.getElementById("registerBtnText");
  const registerBtnSpinner = document.getElementById("registerBtnSpinner");

  const MISMATCH_MSG = "As senhas não coincidem";

  function setError(message) {
    if (!errorBox) return;
    errorBox.textContent = message || "";
    errorBox.hidden = !message;
  }

  function setConfirmFieldError(message) {
    if (!confirmPasswordError) return;
    const hasMsg = Boolean(message);
    confirmPasswordError.textContent = message || "";
    confirmPasswordError.hidden = !hasMsg;
    confirmPasswordError.classList.toggle("is-error", hasMsg);
    confirmPasswordInput?.setAttribute("aria-invalid", hasMsg ? "true" : "false");
  }

  function passwordsMismatch() {
    const a = String(senhaInput?.value || "");
    const b = String(confirmPasswordInput?.value || "");
    if (!a.length && !b.length) return false;
    return a !== b;
  }

  function updateConfirmHintRealtime() {
    const a = String(senhaInput?.value || "");
    const b = String(confirmPasswordInput?.value || "");
    if (!a.length || !b.length) {
      setConfirmFieldError("");
      return;
    }
    if (a !== b) {
      setConfirmFieldError(MISMATCH_MSG);
    } else {
      setConfirmFieldError("");
    }
  }

  function setLoading(isLoading) {
    if (!registerBtn || !registerBtnText || !registerBtnSpinner) return;
    registerBtn.disabled = Boolean(isLoading);
    registerBtnText.hidden = Boolean(isLoading);
    registerBtnSpinner.hidden = !Boolean(isLoading);
  }

  function notify(message, type = "error") {
    if (!message) return;
    window.appToast?.show?.(message, { type });
  }

  function wirePasswordToggle(input, btn, eyeOn, eyeOff, labels) {
    const show = labels?.show || "Mostrar senha";
    const hide = labels?.hide || "Ocultar senha";

    function apply(visible) {
      if (!input) return;
      input.type = visible ? "text" : "password";
      if (eyeOn && eyeOff) {
        eyeOn.classList.toggle("is-visible", !visible);
        eyeOff.classList.toggle("is-visible", visible);
      }
      btn?.setAttribute("aria-label", visible ? hide : show);
    }

    apply(false);
    btn?.addEventListener("click", () => {
      const visible = input?.type === "text";
      apply(!visible);
    });
  }

  wirePasswordToggle(senhaInput, toggleRegPasswordBtn, regEyeIcon, regEyeOffIcon);
  wirePasswordToggle(confirmPasswordInput, toggleConfirmPasswordBtn, confirmEyeIcon, confirmEyeOffIcon, {
    show: "Mostrar confirmação de senha",
    hide: "Ocultar confirmação de senha",
  });

  senhaInput?.addEventListener("input", updateConfirmHintRealtime);
  confirmPasswordInput?.addEventListener("input", updateConfirmHintRealtime);

  // Estado inicial
  window.appToast?.consumePendingToast?.();
  nomeInput?.focus?.();

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setError("");
    setConfirmFieldError("");

    const nome = String(nomeInput?.value || "").trim();
    const usuario = String(usuarioInput?.value || "").trim();
    const senha = String(senhaInput?.value || "");
    const confirmPassword = String(confirmPasswordInput?.value || "");

    if (senha !== confirmPassword) {
      setConfirmFieldError(MISMATCH_MSG);
      notify(MISMATCH_MSG, "error");
      confirmPasswordInput?.focus();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, usuario, senha, confirmPassword }),
      });

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const message = data?.error || data?.message || "Falha ao criar conta";
        throw new Error(message);
      }

      window.appToast?.queuePendingToast?.({
        type: "success",
        title: "Conta criada",
        message: "Usuário cadastrado com sucesso. Faça login para continuar.",
      });
      window.location.href = "/login.html";
    } catch (err) {
      const msg = String(err?.message || "Falha ao criar conta");
      setError(msg);
      notify(msg, "error");
    } finally {
      setLoading(false);
    }
  });
})();
