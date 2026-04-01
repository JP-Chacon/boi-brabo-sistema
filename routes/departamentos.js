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

module.exports = router;
