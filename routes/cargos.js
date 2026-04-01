const express = require("express");
const { run, all, get } = require("../db");
const { requireAtLeast } = require("../middleware/permissions");

const router = express.Router();

function normalizeNome(value) {
  return String(value || "").trim();
}

// GET /cargos?departamento_id= opcional — filtra por departamento
router.get("/", async (req, res) => {
  try {
    const raw = req.query.departamento_id;
    const depId =
      raw != null && String(raw).trim() !== "" ? Number.parseInt(String(raw), 10) : null;

    if (depId != null && String(raw).trim() !== "") {
      if (!Number.isInteger(depId) || depId <= 0) {
        return res.status(400).json({ error: "departamento_id inválido" });
      }
      const rows = await all(
        `
          SELECT id, nome, departamento_id
          FROM cargos
          WHERE departamento_id = ?
          ORDER BY LOWER(nome) ASC
        `,
        [depId]
      );
      return res.json(rows);
    }

    const rows = await all(
      `
        SELECT id, nome, departamento_id
        FROM cargos
        ORDER BY LOWER(nome) ASC
      `
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar cargos" });
  }
});

// POST /cargos — nome + departamento_id obrigatórios; único por departamento
router.post("/", requireAtLeast("admin"), async (req, res) => {
  const nome = normalizeNome(req.body?.nome);
  const depIdRaw = req.body?.departamento_id;
  const depId =
    depIdRaw != null && String(depIdRaw).trim() !== "" ? Number.parseInt(String(depIdRaw), 10) : null;

  if (!nome) {
    return res.status(400).json({ error: "Campo obrigatório: nome" });
  }
  if (!Number.isInteger(depId) || depId <= 0) {
    return res.status(400).json({ error: "Campo obrigatório: departamento_id" });
  }

  try {
    const dept = await get(`SELECT id FROM departamentos WHERE id = ?`, [depId]);
    if (!dept?.id) {
      return res.status(404).json({ error: "Departamento não encontrado" });
    }

    const existing = await get(
      `SELECT id FROM cargos WHERE departamento_id = ? AND LOWER(nome) = LOWER(?)`,
      [depId, nome]
    );
    if (existing?.id) {
      return res.status(409).json({ error: "Já existe um cargo com este nome neste departamento" });
    }

    const result = await run(`INSERT INTO cargos (nome, departamento_id) VALUES (?, ?)`, [nome, depId]);
    return res.status(201).json({ id: result.lastID });
  } catch (err) {
    if (String(err?.message || "").toLowerCase().includes("unique")) {
      return res.status(409).json({ error: "Já existe um cargo com este nome neste departamento" });
    }
    return res.status(500).json({ error: "Erro ao cadastrar cargo" });
  }
});

module.exports = router;
