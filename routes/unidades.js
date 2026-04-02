const express = require("express");
const { run, all, get } = require("../db");
const { requireAtLeast } = require("../middleware/permissions");

const router = express.Router();

function normalizeNome(value) {
  return String(value || "").trim();
}

function normalizeTipo(value) {
  const v = String(value || "").trim().toLowerCase();
  if (v === "matriz") return "matriz";
  if (v === "filial") return "filial";
  return null;
}

function normalizeBoolToInt(value, fallback = 1) {
  if (value == null) return fallback;
  const v = String(value).trim().toLowerCase();
  if (v === "0" || v === "false" || v === "inativo" || v === "no") return 0;
  return 1;
}

const MSG_UNIDADE_DUPLICADA =
  "Já existe uma unidade com esse nome nesta cidade/estado";

/** Mesma regra do índice único em db.js (nome + cidade + estado, trim + lower) */
function normalizeUnidadeLocal(cidade, estado) {
  return {
    cidade: String(cidade ?? "").trim(),
    estado: String(estado ?? "").trim(),
  };
}

async function findUnidadeDuplicada({ nome, cidade, estado, excetoId = null }) {
  const loc = normalizeUnidadeLocal(cidade, estado);
  const params = [nome, loc.cidade, loc.estado];
  let sql = `
    SELECT id FROM unidades
    WHERE LOWER(TRIM(nome)) = LOWER(TRIM(?))
      AND LOWER(TRIM(COALESCE(cidade, ''))) = LOWER(?)
      AND LOWER(TRIM(COALESCE(estado, ''))) = LOWER(?)
  `;
  if (excetoId != null) {
    sql += ` AND id <> ?`;
    params.push(excetoId);
  }
  sql += ` LIMIT 1`;
  return get(sql, params);
}

// GET /unidades — listar (autenticado); também registrado em server.js com app.get para garantir o match
async function listUnidades(_req, res) {
  try {
    const rows = await all(
      `
        SELECT id, nome, tipo, cidade, estado, ativo
        FROM unidades
        ORDER BY LOWER(nome) ASC
      `
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar unidades" });
  }
}

router.get("/", listUnidades);

// POST /unidades — criar (apenas admin)
router.post("/", requireAtLeast("admin"), async (req, res) => {
  try {
    const nome = normalizeNome(req.body?.nome);
    const tipo = normalizeTipo(req.body?.tipo) || "matriz";
    const cidade = String(req.body?.cidade || "").trim();
    const estado = String(req.body?.estado || "").trim();
    const ativo = normalizeBoolToInt(req.body?.ativo, 1);

    if (!nome) return res.status(400).json({ error: "Campo obrigatório: nome" });

    const existing = await findUnidadeDuplicada({ nome, cidade, estado });
    if (existing?.id) return res.status(409).json({ error: MSG_UNIDADE_DUPLICADA });

    const result = await run(
      `
        INSERT INTO unidades (nome, tipo, cidade, estado, ativo)
        VALUES (?, ?, ?, ?, ?)
      `,
      [nome, tipo, cidade, estado, ativo]
    );

    return res.status(201).json({ id: result.lastID });
  } catch (err) {
    if (String(err?.message || "").toLowerCase().includes("unique")) {
      return res.status(409).json({ error: MSG_UNIDADE_DUPLICADA });
    }
    return res.status(500).json({ error: "Erro ao cadastrar unidade" });
  }
});

// PATCH /unidades/:id — editar (apenas admin)
router.patch("/:id", requireAtLeast("admin"), async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ error: "Unidade inválida" });
  }

  try {
    const existing = await get(
      `SELECT id, nome, tipo, cidade, estado, ativo FROM unidades WHERE id = ?`,
      [targetId]
    );
    if (!existing?.id) return res.status(404).json({ error: "Unidade não encontrada" });

    const nome = normalizeNome(req.body?.nome);
    if (!nome) return res.status(400).json({ error: "Campo obrigatório: nome" });

    const tipo =
      req.body?.tipo != null && String(req.body.tipo).trim() !== ""
        ? normalizeTipo(req.body.tipo)
        : existing.tipo || "matriz";
    if (!tipo) return res.status(400).json({ error: "Tipo inválido" });

    const cidade =
      req.body?.cidade != null ? String(req.body.cidade || "").trim() : String(existing.cidade || "").trim();
    const estado =
      req.body?.estado != null ? String(req.body.estado || "").trim() : String(existing.estado || "").trim();
    const ativo =
      req.body?.ativo != null ? normalizeBoolToInt(req.body.ativo, existing.ativo) : normalizeBoolToInt(existing.ativo, 1);

    const dup = await findUnidadeDuplicada({
      nome,
      cidade,
      estado,
      excetoId: targetId,
    });
    if (dup?.id) return res.status(409).json({ error: MSG_UNIDADE_DUPLICADA });

    await run(
      `
        UPDATE unidades
        SET nome = ?, tipo = ?, cidade = ?, estado = ?, ativo = ?
        WHERE id = ?
      `,
      [nome, tipo, cidade, estado, ativo, targetId]
    );

    return res.json({ ok: true, id: targetId });
  } catch (err) {
    if (String(err?.message || "").toLowerCase().includes("unique")) {
      return res.status(409).json({ error: MSG_UNIDADE_DUPLICADA });
    }
    return res.status(500).json({ error: "Erro ao atualizar unidade" });
  }
});

// DELETE /unidades/:id — excluir (apenas admin; bloqueia se em uso)
router.delete("/:id", requireAtLeast("admin"), async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ error: "Unidade inválida" });
  }

  try {
    const existing = await get(`SELECT id, nome FROM unidades WHERE id = ?`, [targetId]);
    if (!existing?.id) return res.status(404).json({ error: "Unidade não encontrada" });

    const inUse = await get(`SELECT id FROM colaboradores WHERE unidade_id = ? LIMIT 1`, [targetId]);
    if (inUse?.id) {
      return res.status(409).json({ error: "Não é possível excluir: unidade está vinculada a colaboradores" });
    }

    await run(`DELETE FROM unidades WHERE id = ?`, [targetId]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao excluir unidade" });
  }
});

module.exports = router;
module.exports.listUnidades = listUnidades;

