const express = require("express");
const { run, all, get } = require("../db");
const { registerAuditLog } = require("../utils/audit");
const { requireAtLeast } = require("../middleware/permissions");
const {
  normalizeDocumentoDigits,
  isValidDocumentoDigits,
} = require("../utils/documento");

const router = express.Router();

const JOIN_COLAB = `
  FROM colaboradores
  LEFT JOIN cargos cg ON cg.id = colaboradores.cargo_id
  LEFT JOIN departamentos d ON d.id = colaboradores.departamento_id
  LEFT JOIN unidades u ON u.id = colaboradores.unidade_id
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
    COALESCE(NULLIF(TRIM(colaboradores.documento), ''), colaboradores.cpf) AS documento,
    colaboradores.cpf,
    COALESCE(cg.nome, colaboradores.cargo) AS cargo,
    colaboradores.cargo_id,
    COALESCE(d.nome, colaboradores.setor) AS departamento,
    colaboradores.departamento_id,
    COALESCE(u.nome, colaboradores.unidade) AS unidade,
    u.cidade AS unidade_cidade,
    u.estado AS unidade_estado,
    colaboradores.unidade_id,
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
            OR LOWER(COALESCE(u.nome, colaboradores.unidade)) LIKE ?
            OR LOWER(COALESCE(u.cidade, '')) LIKE ?
            OR LOWER(COALESCE(u.estado, '')) LIKE ?
            OR REPLACE(REPLACE(REPLACE(REPLACE(TRIM(COALESCE(colaboradores.documento, colaboradores.cpf)), '.', ''), '-', ''), '/', ''), ' ', '') LIKE ?
          )
        `);
        params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
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
    const { nome, cargo, setor, cargo_id, departamento_id, unidade, unidade_id } = req.body || {};
    const docDigits = normalizeDocumentoDigits(req.body?.documento ?? req.body?.cpf);
    const cargoId = cargo_id != null && String(cargo_id).trim() !== "" ? Number(cargo_id) : null;
    const depIdRaw = departamento_id != null && String(departamento_id).trim() !== "" ? Number(departamento_id) : null;
    const unidadeName = String(unidade || "").trim();
    const unidadeId = unidade_id != null && String(unidade_id).trim() !== "" ? Number(unidade_id) : null;

    if (String(setor || "").trim() !== "") {
      return res.status(400).json({ error: "Selecione um departamento válido" });
    }

    if (!Number.isInteger(depIdRaw) || depIdRaw <= 0) {
      return res.status(400).json({ error: "Selecione um departamento válido" });
    }

    if (!nome || !docDigits || !Number.isInteger(cargoId) || cargoId <= 0) {
      return res.status(400).json({ error: "Campos obrigatórios: nome, documento, departamento e cargo" });
    }

    if (!isValidDocumentoDigits(docDigits)) {
      return res.status(400).json({ error: "Documento inválido (CPF ou CNPJ)" });
    }

    const dup = await get(`SELECT id FROM colaboradores WHERE cpf = ?`, [docDigits]);
    if (dup?.id) {
      return res.status(409).json({ error: "Documento já cadastrado" });
    }

    let unidadeRow = null;
    if (Number.isInteger(unidadeId) && unidadeId > 0) {
      unidadeRow = await get(`SELECT id, nome FROM unidades WHERE id = ? LIMIT 1`, [unidadeId]);
    } else if (unidadeName) {
      unidadeRow = await get(`SELECT id, nome FROM unidades WHERE LOWER(nome) = LOWER(?) LIMIT 1`, [unidadeName]);
      if (!unidadeRow?.id) {
        // Compatibilidade: se vier texto legado, cria unidade padrão (admin já autentica).
        const result = await run(
          `INSERT INTO unidades (nome, tipo, cidade, estado, ativo) VALUES (?, 'matriz', '', '', 1)`,
          [unidadeName]
        );
        unidadeRow = await get(`SELECT id, nome FROM unidades WHERE id = ? LIMIT 1`, [result.lastID]);
      }
    }

    if (!unidadeRow?.id) {
      return res.status(400).json({ error: "Campo obrigatório: unidade" });
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
      `
        INSERT INTO colaboradores
          (nome, cpf, documento, cargo, cargo_id, setor, departamento_id, unidade, unidade_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [nome, docDigits, docDigits, cargoName, cargoId, setorValue, depIdRaw, unidadeRow.nome, unidadeRow.id]
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
      String(err?.message || "").toLowerCase().includes("cpf") ||
      String(err?.message || "").toLowerCase().includes("documento")
    ) {
      return res.status(409).json({ error: "Documento já cadastrado" });
    }
    return res.status(500).json({ error: "Erro ao criar colaborador" });
  }
});

// PATCH /colaboradores/:id — editar (admin)
router.patch("/:id", requireAtLeast("admin"), async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ error: "Colaborador inválido" });
  }

  try {
    const usuarioId = Number(req.user?.id);
    const { nome, setor, cargo_id, departamento_id, unidade, unidade_id } = req.body || {};
    const docDigits = normalizeDocumentoDigits(req.body?.documento ?? req.body?.cpf);

    if (String(setor || "").trim() !== "") {
      return res.status(400).json({ error: "Selecione um departamento válido" });
    }

    const depIdRaw =
      departamento_id != null && String(departamento_id).trim() !== "" ? Number(departamento_id) : null;
    const cargoId =
      cargo_id != null && String(cargo_id).trim() !== "" ? Number(cargo_id) : null;

    if (!nome || !docDigits || !Number.isInteger(depIdRaw) || depIdRaw <= 0 || !Number.isInteger(cargoId) || cargoId <= 0) {
      return res.status(400).json({ error: "Campos obrigatórios: nome, documento, departamento e cargo" });
    }

    if (!isValidDocumentoDigits(docDigits)) {
      return res.status(400).json({ error: "Documento inválido (CPF ou CNPJ)" });
    }

    const dupPatch = await get(`SELECT id FROM colaboradores WHERE cpf = ? AND id != ?`, [docDigits, targetId]);
    if (dupPatch?.id) {
      return res.status(409).json({ error: "Documento já cadastrado" });
    }

    const existing = await get(`SELECT id FROM colaboradores WHERE id = ?`, [targetId]);
    if (!existing?.id) {
      return res.status(404).json({ error: "Colaborador não encontrado" });
    }

    const dept = await get(`SELECT id, nome FROM departamentos WHERE id = ?`, [depIdRaw]);
    if (!dept?.id) {
      return res.status(404).json({ error: "Departamento não encontrado" });
    }

    const cargoRow = await get(`SELECT id, nome, departamento_id FROM cargos WHERE id = ?`, [cargoId]);
    if (!cargoRow?.id) {
      return res.status(404).json({ error: "Cargo não encontrado" });
    }

    const cargoDeptId = cargoRow.departamento_id != null ? Number(cargoRow.departamento_id) : null;
    if (cargoDeptId !== depIdRaw) {
      return res.status(400).json({ error: "O cargo selecionado não pertence a este departamento" });
    }

    const setorValue = String(dept.nome || "").trim();
    const cargoName = String(cargoRow.nome || "").trim();
    const unidadeName = String(unidade || "").trim();
    const unidadeId = unidade_id != null && String(unidade_id).trim() !== "" ? Number(unidade_id) : null;

    let unidadeRow = null;
    if (Number.isInteger(unidadeId) && unidadeId > 0) {
      unidadeRow = await get(`SELECT id, nome FROM unidades WHERE id = ? LIMIT 1`, [unidadeId]);
    } else if (unidadeName) {
      unidadeRow = await get(`SELECT id, nome FROM unidades WHERE LOWER(nome) = LOWER(?) LIMIT 1`, [unidadeName]);
    }

    if (!unidadeRow?.id) {
      return res.status(400).json({ error: "Campo obrigatório: unidade" });
    }

    await run("BEGIN IMMEDIATE");
    await run(
      `
        UPDATE colaboradores
        SET nome = ?, cpf = ?, documento = ?, cargo = ?, cargo_id = ?, setor = ?, departamento_id = ?, unidade = ?, unidade_id = ?
        WHERE id = ?
      `,
      [nome, docDigits, docDigits, cargoName, cargoId, setorValue, depIdRaw, unidadeRow.nome, unidadeRow.id, targetId]
    );

    await registerAuditLog({
      usuarioId,
      acao: "UPDATE",
      entidade: "colaborador",
      entidadeId: targetId,
      exec: run,
    });

    await run("COMMIT");
    return res.json({ ok: true, id: targetId });
  } catch (err) {
    try {
      await run("ROLLBACK");
    } catch (_) {
      // ignore
    }
    if (
      String(err?.message || "").toLowerCase().includes("unique") ||
      String(err?.message || "").toLowerCase().includes("cpf") ||
      String(err?.message || "").toLowerCase().includes("documento")
    ) {
      return res.status(409).json({ error: "Documento já cadastrado" });
    }
    return res.status(500).json({ error: "Erro ao atualizar colaborador" });
  }
});

// DELETE /colaboradores/:id — excluir (admin)
router.delete("/:id", requireAtLeast("admin"), async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ error: "Colaborador inválido" });
  }

  try {
    const usuarioId = Number(req.user?.id);
    const existing = await get(`SELECT id, nome FROM colaboradores WHERE id = ?`, [targetId]);
    if (!existing?.id) {
      return res.status(404).json({ error: "Colaborador não encontrado" });
    }

    const atribuicaoAtiva = await get(
      `SELECT id FROM atribuicoes WHERE colaborador_id = ? AND status = 'ativo' LIMIT 1`,
      [targetId]
    );
    if (atribuicaoAtiva?.id) {
      return res.status(409).json({
        error: "Não é possível excluir este colaborador pois ele possui equipamentos atribuídos",
      });
    }

    await run("BEGIN IMMEDIATE");

    await run(`DELETE FROM atribuicoes WHERE colaborador_id = ?`, [targetId]);
    await run(`DELETE FROM colaboradores WHERE id = ?`, [targetId]);

    await registerAuditLog({
      usuarioId,
      acao: "INATIVAR",
      entidade: "colaborador",
      entidadeId: targetId,
      exec: run,
    });

    await run("COMMIT");
    return res.json({ ok: true });
  } catch (err) {
    try {
      await run("ROLLBACK");
    } catch (_) {
      // ignore
    }
    return res.status(500).json({ error: "Erro ao excluir colaborador" });
  }
});

module.exports = router;
