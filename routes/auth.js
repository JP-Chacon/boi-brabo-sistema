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

module.exports = { login, logout, hashToken };

