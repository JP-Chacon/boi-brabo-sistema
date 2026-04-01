const express = require("express");
const { all, get, run } = require("../db");
const { requireAtLeast } = require("../middleware/permissions");

const router = express.Router();

function normalizePerfil(input) {
  const value = String(input || "").trim().toLowerCase();
  if (value === "admin") return "admin";
  if (value === "operador") return "operador";
  return null;
}

// GET /usuarios — apenas admin
router.get("/", requireAtLeast("admin"), async (_req, res) => {
  try {
    const rows = await all(
      `
        SELECT id, nome, usuario, perfil
        FROM usuarios
        ORDER BY id DESC
      `
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

// PATCH /usuarios/:id/perfil — apenas admin
router.patch("/:id/perfil", requireAtLeast("admin"), async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ error: "Usuário inválido" });
  }

  if (Number(req.user?.id) === targetId) {
    return res.status(403).json({ error: "Você não pode alterar seu próprio perfil" });
  }

  const nextPerfil = normalizePerfil(req.body?.perfil);
  if (!nextPerfil) {
    return res.status(400).json({ error: "Perfil inválido. Use 'admin' ou 'operador'." });
  }

  try {
    const existing = await get(`SELECT id, perfil FROM usuarios WHERE id = ?`, [targetId]);
    if (!existing?.id) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (String(existing.perfil || "").trim().toLowerCase() === nextPerfil) {
      return res.json({ ok: true, id: targetId, perfil: nextPerfil });
    }

    const currentPerfil = String(existing.perfil || "").trim().toLowerCase();
    if (currentPerfil === "admin" && nextPerfil === "operador") {
      const admins = await all(
        `SELECT id FROM usuarios WHERE LOWER(perfil) = 'admin' AND id <> ? LIMIT 1`,
        [targetId]
      );
      if (!admins || admins.length === 0) {
        return res
          .status(403)
          .json({ error: "Não é possível remover o último administrador do sistema" });
      }
    }

    await run(`UPDATE usuarios SET perfil = ? WHERE id = ?`, [nextPerfil, targetId]);
    return res.json({ ok: true, id: targetId, perfil: nextPerfil });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
});

module.exports = router;
