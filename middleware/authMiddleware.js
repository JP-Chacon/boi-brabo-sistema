const { get, run } = require("../db");
const { hashToken } = require("../routes/auth");

function authMiddlewareFactory() {
  return async (req, res, next) => {
    const header = req.headers["authorization"];
    if (!header) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const [scheme, token] = String(header).split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) {
      return res.status(401).json({ error: "Token inválido" });
    }

    try {
      const session = await get(
        `
          SELECT
            s.id,
            s.user_id,
            s.expira_em,
            s.revogado_em,
            u.nome,
            u.usuario,
            u.perfil
          FROM auth_sessions s
          JOIN usuarios u ON u.id = s.user_id
          WHERE s.token_hash = ?
        `,
        [hashToken(token)]
      );

      if (!session || session.revogado_em) {
        return res.status(401).json({ error: "Token expirado ou inválido" });
      }

      if (new Date(session.expira_em).getTime() <= Date.now()) {
        await run(
          `
            UPDATE auth_sessions
            SET revogado_em = ?
            WHERE id = ? AND revogado_em IS NULL
          `,
          [new Date().toISOString(), session.id]
        );
        return res.status(401).json({ error: "Sessão expirada. Faça login novamente." });
      }

      req.authToken = token;
      req.session = {
        id: session.id,
        user_id: session.user_id,
        expira_em: session.expira_em,
      };
      req.user = {
        id: session.user_id,
        nome: session.nome,
        usuario: session.usuario,
        perfil: session.perfil,
      };
      return next();
    } catch (err) {
      return res.status(500).json({ error: "Erro ao validar autenticação" });
    }
  };
}

module.exports = authMiddlewareFactory;

