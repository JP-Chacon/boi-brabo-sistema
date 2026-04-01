const express = require("express");
const { run, all, get } = require("../db");
const { registerAuditLog } = require("../utils/audit");
const { requireAtLeast } = require("../middleware/permissions");

const router = express.Router();

function normalizeStatus(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return raw;
  if (raw === "disponível" || raw === "disponivel") return "disponivel";
  if (raw === "em uso" || raw === "em_uso" || raw === "em-uso") return "em uso";
  return raw;
}

function normalizeSituacao(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw || raw === "all") return "all";
  if (raw === "ativo") return "ativo";
  if (raw === "inativo" || raw === "arquivado") return "inativo";
  return "ativo";
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function hasAdvancedListQuery(query = {}) {
  return [
    "page",
    "limit",
    "q",
    "situacao",
    "disponibilidade",
    "status",
    "nome",
    "codigo",
  ].some((key) => query[key] != null && String(query[key]).trim() !== "");
}

function getStatusExpression() {
  return `CASE WHEN COALESCE(situacao, 'ativo') = 'inativo' THEN 'inativo' ELSE status END`;
}

async function generateEquipmentCode() {
  const rows = await all(`SELECT id, codigo_barras FROM equipamentos`);
  let maxSequence = 0;
  let maxId = 0;

  for (const row of rows) {
    maxId = Math.max(maxId, Number(row?.id || 0));
    const match = String(row?.codigo_barras || "")
      .trim()
      .toUpperCase()
      .match(/^EQP-(\d+)$/);
    if (match) {
      maxSequence = Math.max(maxSequence, Number(match[1] || 0));
    }
  }

  const nextSequence = Math.max(maxSequence, maxId) + 1;
  return `EQP-${String(nextSequence).padStart(4, "0")}`;
}

async function hasActiveAssignment(equipamentoId) {
  const row = await get(
    `SELECT id FROM atribuicoes WHERE equipamento_id = ? AND status = 'ativo' LIMIT 1`,
    [equipamentoId]
  );
  return Boolean(row?.id);
}

// GET /equipamentos
router.get("/", async (req, res) => {
  try {
    const statusExpression = getStatusExpression();
    if (hasAdvancedListQuery(req.query)) {
      const page = parsePositiveInt(req.query?.page, 1);
      const limit = Math.min(parsePositiveInt(req.query?.limit, 5), 50);
      const offset = (page - 1) * limit;
      const q = String(req.query?.q || "").trim().toLowerCase();
      const nome = String(req.query?.nome || "").trim();
      const codigo = String(req.query?.codigo || "").trim();
      const situacao = normalizeSituacao(req.query?.situacao);
      const disponibilidade = normalizeStatus(
        req.query?.disponibilidade ?? req.query?.status
      );
      const conditions = [];
      const params = [];

      if (situacao !== "all") {
        conditions.push(`COALESCE(situacao, 'ativo') = ?`);
        params.push(situacao);
      }

      if (disponibilidade && disponibilidade !== "all") {
        conditions.push(`${statusExpression} = ?`);
        params.push(disponibilidade);
      }

      if (q) {
        conditions.push(`
          (
            LOWER(nome) LIKE ?
            OR LOWER(marca) LIKE ?
            OR LOWER(codigo_barras) LIKE ?
          )
        `);
        params.push(`%${q}%`, `%${q}%`, `%${q}%`);
      }

      if (nome) {
        conditions.push(`LOWER(nome) LIKE ?`);
        params.push(`%${nome.toLowerCase()}%`);
      }

      if (codigo) {
        conditions.push(`LOWER(codigo_barras) LIKE ?`);
        params.push(`%${codigo.toLowerCase()}%`);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const countRow = await get(
        `
          SELECT COUNT(*) AS total
          FROM equipamentos
          ${whereClause}
        `,
        params
      );
      const total = Number(countRow?.total || 0);
      const items = await all(
        `
          SELECT id, nome, marca, codigo_barras, serial, modelo, observacoes, ${statusExpression} AS status, situacao
          FROM equipamentos
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

    const rows = await all(
      `
        SELECT id, nome, marca, codigo_barras, serial, modelo, observacoes, ${statusExpression} AS status, situacao
        FROM equipamentos
        WHERE COALESCE(situacao, 'ativo') = 'ativo'
        ORDER BY id DESC
      `
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar equipamentos" });
  }
});

// POST /equipamentos
router.post("/", requireAtLeast("admin"), async (req, res) => {
  try {
    const usuarioId = Number(req.user?.id);
    const { nome, marca, status, serial, modelo, observacoes } = req.body || {};
    const normalizedStatus = normalizeStatus(status);
    const safeSerial = String(serial || "").trim();
    const safeModelo = String(modelo || "").trim();
    const safeObs = observacoes == null ? null : String(observacoes || "").trim();

    if (!nome || !marca || !normalizedStatus || !safeSerial) {
      return res
        .status(400)
        .json({
          error:
            "Campos obrigatórios: nome, marca, serial e status (Disponível ou Em uso)",
        });
    }

    if (!["disponivel", "em uso"].includes(normalizedStatus)) {
      return res
        .status(400)
        .json({ error: "status inválido. Use 'disponivel' ou 'em uso'" });
    }

    await run("BEGIN IMMEDIATE");
    const finalCode = await generateEquipmentCode();

    const result = await run(
      `
        INSERT INTO equipamentos (nome, marca, codigo_barras, serial, modelo, observacoes, status, situacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'ativo')
      `,
      [nome, marca, finalCode, safeSerial, safeModelo || null, safeObs, normalizedStatus]
    );

    await registerAuditLog({
      usuarioId,
      acao: "CREATE",
      entidade: "equipamento",
      entidadeId: result.lastID,
      exec: run,
    });

    await run("COMMIT");

    return res.status(201).json({ id: result.lastID, codigo_barras: finalCode });
  } catch (err) {
    try {
      await run("ROLLBACK");
    } catch (_) {
      // ignore rollback errors
    }
    if (String(err?.message || "").toLowerCase().includes("unique")) {
      const lower = String(err?.message || "").toLowerCase();
      if (lower.includes("serial")) return res.status(409).json({ error: "serial já cadastrado" });
      return res.status(409).json({ error: "codigo_barras já cadastrado" });
    }
    return res.status(500).json({ error: "Erro ao criar equipamento" });
  }
});

async function handleUpdateEquipamento(req, res) {
  try {
    const usuarioId = Number(req.user?.id);
    const equipamentoId = Number(req.params.id);
    const { nome, marca, status, serial, modelo, observacoes } = req.body || {};
    const normalizedStatus = normalizeStatus(status);
    const safeSerial = String(serial || "").trim();
    const safeModelo = String(modelo || "").trim();
    const safeObs = observacoes == null ? null : String(observacoes || "").trim();

    if (!Number.isInteger(equipamentoId) || equipamentoId <= 0) {
      return res.status(400).json({ error: "Equipamento inválido" });
    }

    if (!nome || !marca || !normalizedStatus || !safeSerial) {
      return res.status(400).json({
        error: "Campos obrigatórios: nome, marca, serial e status",
      });
    }

    if (!["disponivel", "em uso"].includes(normalizedStatus)) {
      return res
        .status(400)
        .json({ error: "status inválido. Use 'disponivel' ou 'em uso'" });
    }

    await run("BEGIN IMMEDIATE");
    const equipamento = await get(
      `SELECT id, status, situacao FROM equipamentos WHERE id = ?`,
      [equipamentoId]
    );

    if (!equipamento) {
      await run("ROLLBACK");
      return res.status(404).json({ error: "Equipamento não encontrado" });
    }

    if (String(equipamento.situacao || "ativo") === "inativo") {
      await run("ROLLBACK");
      return res
        .status(409)
        .json({ error: "Equipamentos inativos não podem ser editados" });
    }

    const assignmentExists = await hasActiveAssignment(equipamentoId);

    if (normalizedStatus === "disponivel" && assignmentExists) {
      await run("ROLLBACK");
      return res.status(409).json({
        error: "Use a devolução para liberar um equipamento que está em uso",
      });
    }

    if (normalizedStatus === "em uso" && !assignmentExists) {
      await run("ROLLBACK");
      return res.status(409).json({
        error: "Para marcar como Em uso, faça uma atribuição primeiro",
      });
    }

    await run(
      `
        UPDATE equipamentos
        SET nome = ?,
            marca = ?,
            serial = ?,
            modelo = ?,
            observacoes = ?,
            status = ?
        WHERE id = ?
      `,
      [nome, marca, safeSerial, safeModelo || null, safeObs, normalizedStatus, equipamentoId]
    );

    await registerAuditLog({
      usuarioId,
      acao: "UPDATE",
      entidade: "equipamento",
      entidadeId: equipamentoId,
      exec: run,
    });

    await run("COMMIT");

    return res.json({ ok: true, id: equipamentoId });
  } catch (err) {
    try {
      await run("ROLLBACK");
    } catch (_) {
      // ignore rollback errors
    }
    if (String(err?.message || "").toLowerCase().includes("unique")) {
      const lower = String(err?.message || "").toLowerCase();
      if (lower.includes("serial")) return res.status(409).json({ error: "serial já cadastrado" });
      return res.status(409).json({ error: "codigo_barras já cadastrado" });
    }
    return res.status(500).json({ error: "Erro ao atualizar equipamento" });
  }
}

// PUT /equipamentos/:id
router.put("/:id", requireAtLeast("admin"), handleUpdateEquipamento);

// PATCH /equipamentos/:id
router.patch("/:id", requireAtLeast("admin"), handleUpdateEquipamento);

// POST /equipamentos/:id/inativar
router.post("/:id/inativar", requireAtLeast("admin"), async (req, res) => {
  try {
    const usuarioId = Number(req.user?.id);
    const equipamentoId = Number(req.params.id);

    if (!Number.isInteger(equipamentoId) || equipamentoId <= 0) {
      return res.status(400).json({ error: "Equipamento inválido" });
    }

    await run("BEGIN IMMEDIATE");
    const equipamento = await get(
      `SELECT id, nome, status, situacao FROM equipamentos WHERE id = ?`,
      [equipamentoId]
    );

    if (!equipamento) {
      await run("ROLLBACK");
      return res.status(404).json({ error: "Equipamento não encontrado" });
    }

    if (String(equipamento.situacao || "ativo") === "inativo") {
      await run("ROLLBACK");
      return res.status(409).json({ error: "Equipamento já está inativo" });
    }

    const assignmentExists = await hasActiveAssignment(equipamentoId);
    if (String(equipamento.status || "").trim().toLowerCase() === "em uso" || assignmentExists) {
      await run("ROLLBACK");
      return res.status(409).json({
        error: "Não é possível inativar um equipamento que está em uso",
      });
    }

    await run(`UPDATE equipamentos SET situacao = 'inativo', status = 'inativo' WHERE id = ?`, [equipamentoId]);

    await registerAuditLog({
      usuarioId,
      acao: "INATIVAR",
      entidade: "equipamento",
      entidadeId: equipamentoId,
      exec: run,
    });

    await run("COMMIT");

    return res.json({
      ok: true,
      id: equipamentoId,
      message: `Equipamento "${equipamento.nome}" inativado com sucesso`,
    });
  } catch (err) {
    try {
      await run("ROLLBACK");
    } catch (_) {
      // ignore rollback errors
    }
    return res.status(500).json({ error: "Erro ao inativar equipamento" });
  }
});

module.exports = router;

