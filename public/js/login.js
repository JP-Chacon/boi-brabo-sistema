(() => {
  const API_BASE_URL =
    typeof window.resolveApiBaseUrl === "function"
      ? window.resolveApiBaseUrl()
      : window.location.origin && window.location.origin !== "null"
        ? window.location.origin
        : "http://localhost:3000";
  const TOKEN_KEY = "token";
  const TOKEN_EXPIRES_KEY = "token_expires_at";
  const USER_KEY = "user";

  const form = document.getElementById("loginForm");
  const errorBox = document.getElementById("loginError");
  const usuarioInput = document.getElementById("usuario");
  const senhaInput = document.getElementById("senha");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const eyeIcon = document.getElementById("eyeIcon");
  const eyeOffIcon = document.getElementById("eyeOffIcon");
  const loginBtn = document.getElementById("loginBtn");
  const loginBtnText = document.getElementById("loginBtnText");
  const loginBtnSpinner = document.getElementById("loginBtnSpinner");
  const currentYear = document.getElementById("currentYear");

  function formatUserDisplayName(value) {
    const text = String(value || "").trim();
    if (!text) return "Admin";
    const base = text.includes("@") ? text.split("@")[0] : text;
    return base
      .replace(/[._-]+/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  function setError(message) {
    if (!errorBox) return;
    errorBox.textContent = message || "";
    errorBox.hidden = !message;
  }

  function notify(message, type = "error") {
    if (!message) return;
    window.appToast?.show?.(message, { type });
  }

  function setLoading(isLoading) {
    if (!loginBtn || !loginBtnText || !loginBtnSpinner) return;
    loginBtn.disabled = Boolean(isLoading);
    loginBtnText.hidden = Boolean(isLoading);
    loginBtnSpinner.hidden = !Boolean(isLoading);
  }

  function formatProfileLabel(profile) {
    const normalized = String(profile || "").trim().toLowerCase();
    if (normalized === "admin") return "Administrador";
    if (normalized === "operador") return "Operador";
    return "Usuário";
  }

  function setPasswordVisible(visible) {
    if (!senhaInput) return;
    senhaInput.type = visible ? "text" : "password";

    if (eyeIcon && eyeOffIcon) {
      eyeIcon.classList.toggle("is-visible", !visible);
      eyeOffIcon.classList.toggle("is-visible", visible);
    }

    togglePasswordBtn?.setAttribute(
      "aria-label",
      visible ? "Ocultar senha" : "Mostrar senha"
    );
  }

  // Estado inicial
  window.appToast?.consumePendingToast?.();
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
  setPasswordVisible(false);

  togglePasswordBtn?.addEventListener("click", () => {
    const isCurrentlyVisible = senhaInput.type === "text";
    setPasswordVisible(!isCurrentlyVisible);
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const usuario = String(usuarioInput.value || "").trim();
    const senha = String(senhaInput.value || "");

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const message = data?.error || data?.message || "Falha no login";
        throw new Error(message);
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      if (data?.expira_em) localStorage.setItem(TOKEN_EXPIRES_KEY, data.expira_em);
      localStorage.setItem(
        USER_KEY,
        JSON.stringify({
          id: data?.user?.id ?? null,
          name: data?.user?.nome || formatUserDisplayName(usuario),
          username: data?.user?.usuario || usuario,
          role: formatProfileLabel(data?.user?.perfil),
          profile: data?.user?.perfil || "admin",
        })
      );
      window.appToast?.queuePendingToast?.({
        type: "success",
        title: "Acesso liberado",
        message: "Login realizado com sucesso.",
      });
      window.location.href = "dashboard.html";
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Erro no login:", err);

      const msg = String(err?.message || "");
      const isNetwork =
        msg.toLowerCase().includes("fetch") ||
        msg.toLowerCase().includes("connect") ||
        msg.toLowerCase().includes("network");

      const friendlyMessage = isNetwork
        ? "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
        : msg || "Falha no login. Verifique usuário e senha.";

      setError(friendlyMessage);
      notify(friendlyMessage, "error");
    } finally {
      setLoading(false);
    }
  });
})();

