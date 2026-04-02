const express = require("express");
const { run, all, get } = require("../db");
const { requireAtLeast } = require("../middleware/permissions");

const router = express.Router();

function normalizeNome(value) {
  return String(value || "").trim();
}

// GET /departamentos — listar (autenticado)
router.get("/", async (_req, res) => {
  try {
    const rows = await all(
      `
        SELECT id, nome
        FROM departamentos
        ORDER BY LOWER(nome) ASC
      `
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar departamentos" });
  }
});

// POST /departamentos — criar (apenas admin)
router.post("/", requireAtLeast("admin"), async (req, res) => {
  const nome = normalizeNome(req.body?.nome);
  if (!nome) {
    return res.status(400).json({ error: "Campo obrigatório: nome" });
  }

  try {
    const existing = await get(`SELECT id FROM departamentos WHERE LOWER(nome) = LOWER(?)`, [nome]);
    if (existing?.id) {
      return res.status(409).json({ error: "Departamento já existe" });
    }

    const result = await run(`INSERT INTO departamentos (nome) VALUES (?)`, [nome]);
    return res.status(201).json({ id: result.lastID });
  } catch (err) {
    if (String(err?.message || "").toLowerCase().includes("unique")) {
      return res.status(409).json({ error: "Departamento já existe" });
    }
    return res.status(500).json({ error: "Erro ao cadastrar departamento" });
  }
});

// PATCH /departamentos/:id — editar nome (apenas admin)
router.patch("/:id", requireAtLeast("admin"), async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ error: "Departamento inválido" });
  }

  const nome = normalizeNome(req.body?.nome);
  if (!nome) {
    return res.status(400).json({ error: "Campo obrigatório: nome" });
  }

  try {
    const existing = await get(`SELECT id FROM departamentos WHERE id = ?`, [targetId]);
    if (!existing?.id) {
      return res.status(404).json({ error: "Departamento não encontrado" });
    }

    const dup = await get(
      `SELECT id FROM departamentos WHERE LOWER(nome) = LOWER(?) AND id <> ?`,
      [nome, targetId]
    );
    if (dup?.id) {
      return res.status(409).json({ error: "Departamento já existe" });
    }

    await run(`UPDATE departamentos SET nome = ? WHERE id = ?`, [nome, targetId]);
    return res.json({ ok: true, id: targetId });
  } catch (err) {
    if (String(err?.message || "").toLowerCase().includes("unique")) {
      return res.status(409).json({ error: "Departamento já existe" });
    }
    return res.status(500).json({ error: "Erro ao atualizar departamento" });
  }
});

// DELETE /departamentos/:id — excluir (apenas admin; bloqueia se em uso)
router.delete("/:id", requireAtLeast("admin"), async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ error: "Departamento inválido" });
  }

  try {
    const existing = await get(`SELECT id FROM departamentos WHERE id = ?`, [targetId]);
    if (!existing?.id) {
      return res.status(404).json({ error: "Departamento não encontrado" });
    }

    const inUseByCargo = await get(`SELECT id FROM cargos WHERE departamento_id = ? LIMIT 1`, [
      targetId,
    ]);
    if (inUseByCargo?.id) {
      return res
        .status(409)
        .json({ error: "Não é possível excluir: existem cargos vinculados a este departamento" });
    }

    const inUseByColab = await get(
      `SELECT id FROM colaboradores WHERE departamento_id = ? LIMIT 1`,
      [targetId]
    );
    if (inUseByColab?.id) {
      return res
        .status(409)
        .json({ error: "Não é possível excluir: existem colaboradores vinculados a este departamento" });
    }

    await run(`DELETE FROM departamentos WHERE id = ?`, [targetId]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao excluir departamento" });
  }
});

module.exports = router;
