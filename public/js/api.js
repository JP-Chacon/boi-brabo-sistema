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

  function clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  async function request(path, { method = "GET", body, requiresAuth = true } = {}) {
    const headers = {};

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (requiresAuth) {
      const token = getToken();
      if (!token) throw new Error("Sessão inválida. Faça login novamente.");
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    const data = text ? safeJsonParse(text) : null;

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthData();
      }
      const message =
        data?.error ||
        data?.message ||
        `Erro HTTP ${res.status} ao chamar ${path}`;
      throw new Error(message);
    }

    return data;
  }

  function safeJsonParse(text) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  async function login(usuario, senha) {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
    });

    const text = await res.text();
    const data = text ? safeJsonParse(text) : null;

    if (!res.ok) {
      const message = data?.error || data?.message || "Falha no login";
      throw new Error(message);
    }

    return data;
  }

  async function logout() {
    try {
      await request("/logout", {
        method: "POST",
      });
    } finally {
      clearAuthData();
    }
  }

  async function getColaboradores(filters = null) {
    const params = new URLSearchParams();
    if (filters && typeof filters === "object") {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          params.set(key, String(value));
        }
      });
    }
    const query = params.toString();
    return await request(query ? `/colaboradores?${query}` : "/colaboradores", { method: "GET" });
  }

  async function criarColaborador({ nome, documento, cpf, cargo_id, departamento_id }) {
    return await request("/colaboradores", {
      method: "POST",
      body: { nome, documento: documento ?? cpf, cargo_id, departamento_id },
    });
  }

  async function getEquipamentos(filters = null) {
    const params = new URLSearchParams();
    if (filters && typeof filters === "object") {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          params.set(key, String(value));
        }
      });
    }
    const query = params.toString();
    return await request(query ? `/equipamentos?${query}` : "/equipamentos", { method: "GET" });
  }

  async function criarEquipamento({ nome, marca, status }) {
    return await request("/equipamentos", {
      method: "POST",
      body: { nome, marca, status },
    });
  }

  async function editarEquipamento(id, { nome, marca, status }) {
    return await request(`/equipamentos/${id}`, {
      method: "PATCH",
      body: { nome, marca, status },
    });
  }

  async function inativarEquipamento(id) {
    return await request(`/equipamentos/${id}/inativar`, {
      method: "POST",
    });
  }

  async function atribuirEquipamento({ colaborador_id, equipamento_id, data_atribuicao }) {
    return await request("/atribuir", {
      method: "POST",
      body: { colaborador_id, equipamento_id, data_atribuicao },
    });
  }

  async function getAtribuicoes(filters = "ativo") {
    if (typeof filters === "string") {
      const normalized = String(filters || "ativo").trim().toLowerCase();
      const query = normalized && normalized !== "ativo"
        ? `/atribuicoes?status=${encodeURIComponent(normalized)}`
        : "/atribuicoes";
      return await request(query, { method: "GET" });
    }

    const params = new URLSearchParams();
    if (filters && typeof filters === "object") {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          params.set(key, String(value));
        }
      });
    }
    const query = params.toString();
    return await request(query ? `/atribuicoes?${query}` : "/atribuicoes", { method: "GET" });
  }

  async function liberarEquipamento({ equipamento_id } = {}) {
    return await request("/liberar", {
      method: "POST",
      body: { equipamento_id },
    });
  }

  window.api = {
    login,
    logout,
    getColaboradores,
    criarColaborador,
    getEquipamentos,
    criarEquipamento,
    editarEquipamento,
    inativarEquipamento,
    atribuirEquipamento,
    getAtribuicoes,
    liberarEquipamento,
  };
})();

