const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { get, run } = require("../db");

const SESSION_HOURS = Number(process.env.AUTH_SESSION_HOURS || 12);

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function getExpirationDate() {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_HOURS);
  return expiresAt;
}

async function login(req, res) {
  const { usuario, senha } = req.body || {};
  const normalizedUsername = String(usuario || "").trim();
  const rawPassword = String(senha || "");

  if (!normalizedUsername || !rawPassword) {
    return res.status(400).json({ error: "Informe usuário e senha" });
  }

  try {
    const user = await get(
      `
        SELECT id, nome, usuario, senha_hash, perfil
        FROM usuarios
        WHERE usuario = ?
      `,
      [normalizedUsername]
    );

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const passwordMatches = await bcrypt.compare(rawPassword, user.senha_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = crypto.randomBytes(48).toString("hex");
    const expiraEm = getExpirationDate();

    await run(
      `
        INSERT INTO auth_sessions (user_id, token_hash, expira_em)
        VALUES (?, ?, ?)
      `,
      [user.id, hashToken(token), expiraEm.toISOString()]
    );

    return res.json({
      ok: true,
      token,
      expira_em: expiraEm.toISOString(),
      user: {
        id: user.id,
        nome: user.nome,
        usuario: user.usuario,
        perfil: user.perfil,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao autenticar usuário" });
  }
}

async function logout(req, res) {
  const sessionId = req.session?.id;

  if (!sessionId) {
    return res.status(401).json({ error: "Sessão inválida" });
  }

  try {
    await run(
      `
        UPDATE auth_sessions
        SET revogado_em = ?
        WHERE id = ? AND revogado_em IS NULL
      `,
      [new Date().toISOString(), sessionId]
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao encerrar sessão" });
  }
}

async function register(req, res) {
  const { nome, usuario, senha, confirmPassword } = req.body || {};
  const safeNome = String(nome || "").trim();
  const safeUsuario = String(usuario || "").trim();
  const safeSenha = String(senha || "");
  const safeConfirm = String(confirmPassword || "");
  const normalizedPerfil = "operador";

  if (!safeNome || !safeUsuario || !safeSenha) {
    return res.status(400).json({ error: "Campos obrigatórios: nome, usuario, senha" });
  }

  if (safeSenha !== safeConfirm) {
    return res.status(400).json({ error: "As senhas não coincidem" });
  }

  if (safeSenha.length < 4) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 4 caracteres." });
  }

  try {
    const existing = await get(`SELECT id FROM usuarios WHERE usuario = ?`, [safeUsuario]);
    if (existing?.id) {
      return res.status(409).json({ error: "Usuário já cadastrado." });
    }

    const passwordHash = await bcrypt.hash(safeSenha, 12);
    const result = await run(
      `
        INSERT INTO usuarios (nome, usuario, senha_hash, perfil, criado_em)
        VALUES (?, ?, ?, ?, ?)
      `,
      [safeNome, safeUsuario, passwordHash, normalizedPerfil, new Date().toISOString()]
    );

    return res.status(201).json({
      ok: true,
      id: result.lastID,
      user: {
        id: result.lastID,
        nome: safeNome,
        usuario: safeUsuario,
        perfil: normalizedPerfil,
      },
    });
  } catch (err) {
    if (String(err?.message || "").toLowerCase().includes("unique")) {
      return res.status(409).json({ error: "Usuário já cadastrado." });
    }
    return res.status(500).json({ error: "Erro ao cadastrar usuário" });
  }
}

module.exports = { login, logout, register, hashToken };

