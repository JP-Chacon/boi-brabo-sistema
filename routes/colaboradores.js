const express = require("express");
const { run, all } = require("../db");
const { registerAuditLog } = require("../utils/audit");

const router = express.Router();

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function hasAdvancedListQuery(query = {}) {
  return ["page", "limit", "q", "nome", "setor", "cargo"].some(
    (key) => query[key] != null && String(query[key]).trim() !== ""
  );
}

// GET /colaboradores
router.get("/", async (req, res) => {
  try {
    if (hasAdvancedListQuery(req.query)) {
      const page = parsePositiveInt(req.query?.page, 1);
      const limit = Math.min(parsePositiveInt(req.query?.limit, 5), 50);
      const offset = (page - 1) * limit;
      const q = String(req.query?.q || "").trim().toLowerCase();
      const nome = String(req.query?.nome || "").trim().toLowerCase();
      const setor = String(req.query?.setor || "").trim().toLowerCase();
      const cargo = String(req.query?.cargo || "").trim().toLowerCase();
      const conditions = [];
      const params = [];

      if (q) {
        conditions.push(`
          (
            LOWER(nome) LIKE ?
            OR LOWER(cargo) LIKE ?
            OR LOWER(setor) LIKE ?
          )
        `);
        params.push(`%${q}%`, `%${q}%`, `%${q}%`);
      }

      if (nome) {
        conditions.push(`LOWER(nome) LIKE ?`);
        params.push(`%${nome}%`);
      }

      if (setor) {
        conditions.push(`LOWER(setor) LIKE ?`);
        params.push(`%${setor}%`);
      }

      if (cargo) {
        conditions.push(`LOWER(cargo) LIKE ?`);
        params.push(`%${cargo}%`);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const countRows = await all(
        `
          SELECT COUNT(*) AS total
          FROM colaboradores
          ${whereClause}
        `,
        params
      );
      const total = Number(countRows?.[0]?.total || 0);
      const items = await all(
        `
          SELECT id, nome, cpf, cargo, setor
          FROM colaboradores
          ${whereClause}
          ORDER BY id DESC
          LIMIT ? OFFSET ?
        `,
        [...params, limit, offset]
      );

      return res.json({
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    }

    const rows = await all(`SELECT id, nome, cpf, cargo, setor FROM colaboradores ORDER BY id DESC`);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar colaboradores" });
  }
});

// POST /colaboradores
router.post("/", async (req, res) => {
  try {
    const usuarioId = Number(req.user?.id);
    const { nome, cpf, cargo, setor } = req.body || {};

    if (!nome || !cpf || !cargo || !setor) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: nome, cpf, cargo, setor" });
    }

    await run("BEGIN IMMEDIATE");

    const result = await run(
      `INSERT INTO colaboradores (nome, cpf, cargo, setor) VALUES (?, ?, ?, ?)`,
      [nome, cpf, cargo, setor]
    );

    await registerAuditLog({
      usuarioId,
      acao: "CREATE",
      entidade: "colaborador",
      entidadeId: result.lastID,
      exec: run,
    });

    await run("COMMIT");

    return res.status(201).json({ id: result.lastID });
  } catch (err) {
    try {
      await run("ROLLBACK");
    } catch (_) {
      // ignore rollback errors
    }
    // UNIQUE constraint em cpf
    if (
      String(err?.message || "").toLowerCase().includes("unique") ||
      String(err?.message || "").toLowerCase().includes("cpf")
    ) {
      return res.status(409).json({ error: "CPF já cadastrado" });
    }
    return res.status(500).json({ error: "Erro ao criar colaborador" });
  }
});

module.exports = router;

