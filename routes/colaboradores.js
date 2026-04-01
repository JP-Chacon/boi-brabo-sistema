const express = require("express");
const { run, all, get } = require("../db");
const { registerAuditLog } = require("../utils/audit");
const { requireAtLeast } = require("../middleware/permissions");

const router = express.Router();

const JOIN_COLAB = `
  FROM colaboradores
  LEFT JOIN cargos cg ON cg.id = colaboradores.cargo_id
  LEFT JOIN departamentos d ON d.id = colaboradores.departamento_id
`;

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function hasAdvancedListQuery(query = {}) {
  return ["page", "limit", "q", "nome", "setor", "departamento", "cargo"].some(
    (key) => query[key] != null && String(query[key]).trim() !== ""
  );
}

function selectColaboradoresCols() {
  return `
    colaboradores.id,
    colaboradores.nome,
    colaboradores.cpf,
    COALESCE(cg.nome, colaboradores.cargo) AS cargo,
    colaboradores.cargo_id,
    COALESCE(d.nome, colaboradores.setor) AS departamento,
    colaboradores.departamento_id,
    cg.departamento_id AS cargo_departamento_id
  `;
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
      const depFilter = String(req.query?.departamento || req.query?.setor || "")
        .trim()
        .toLowerCase();
      const cargo = String(req.query?.cargo || "").trim().toLowerCase();
      const conditions = [];
      const params = [];

      if (q) {
        conditions.push(`
          (
            LOWER(colaboradores.nome) LIKE ?
            OR LOWER(COALESCE(cg.nome, colaboradores.cargo)) LIKE ?
            OR LOWER(COALESCE(d.nome, colaboradores.setor)) LIKE ?
          )
        `);
        params.push(`%${q}%`, `%${q}%`, `%${q}%`);
      }

      if (nome) {
        conditions.push(`LOWER(colaboradores.nome) LIKE ?`);
        params.push(`%${nome}%`);
      }

      if (depFilter) {
        conditions.push(`LOWER(COALESCE(d.nome, colaboradores.setor)) LIKE ?`);
        params.push(`%${depFilter}%`);
      }

      if (cargo) {
        conditions.push(`LOWER(COALESCE(cg.nome, colaboradores.cargo)) LIKE ?`);
        params.push(`%${cargo}%`);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const countRows = await all(
        `
          SELECT COUNT(*) AS total
          ${JOIN_COLAB}
          ${whereClause}
        `,
        params
      );
      const total = Number(countRows?.[0]?.total || 0);
      const items = await all(
        `
          SELECT ${selectColaboradoresCols()}
          ${JOIN_COLAB}
          ${whereClause}
          ORDER BY colaboradores.id DESC
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

    const rows = await all(
      `
        SELECT ${selectColaboradoresCols()}
        ${JOIN_COLAB}
        ORDER BY colaboradores.id DESC
      `
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar colaboradores" });
  }
});

// POST /colaboradores — obrigatório: departamento_id, cargo_id; não aceitar setor
router.post("/", requireAtLeast("admin"), async (req, res) => {
  try {
    const usuarioId = Number(req.user?.id);
    const { nome, cpf, cargo, setor, cargo_id, departamento_id } = req.body || {};
    const cargoId = cargo_id != null && String(cargo_id).trim() !== "" ? Number(cargo_id) : null;
    const depIdRaw = departamento_id != null && String(departamento_id).trim() !== "" ? Number(departamento_id) : null;

    if (String(setor || "").trim() !== "") {
      return res.status(400).json({ error: "Selecione um departamento válido" });
    }

    if (!Number.isInteger(depIdRaw) || depIdRaw <= 0) {
      return res.status(400).json({ error: "Selecione um departamento válido" });
    }

    if (!nome || !cpf || !Number.isInteger(cargoId) || cargoId <= 0) {
      return res.status(400).json({ error: "Campos obrigatórios: nome, cpf, departamento e cargo" });
    }

    const dept = await get(`SELECT id, nome FROM departamentos WHERE id = ?`, [depIdRaw]);
    if (!dept?.id) {
      return res.status(404).json({ error: "Departamento não encontrado" });
    }

    const cargoRow = await get(
      `SELECT id, nome, departamento_id FROM cargos WHERE id = ?`,
      [cargoId]
    );
    if (!cargoRow?.id) {
      return res.status(404).json({ error: "Cargo não encontrado" });
    }

    const cargoDeptId = cargoRow.departamento_id != null ? Number(cargoRow.departamento_id) : null;
    if (cargoDeptId !== depIdRaw) {
      return res.status(400).json({ error: "O cargo selecionado não pertence a este departamento" });
    }

    const setorValue = String(dept.nome || "").trim();
    const cargoName = String(cargoRow.nome || "").trim();

    await run("BEGIN IMMEDIATE");

    const result = await run(
      `INSERT INTO colaboradores (nome, cpf, cargo, cargo_id, setor, departamento_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, cpf, cargoName, cargoId, setorValue, depIdRaw]
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
