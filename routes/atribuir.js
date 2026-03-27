const express = require("express");
const { run, get } = require("../db");
const { registerAuditLog } = require("../utils/audit");

const router = express.Router();

function nowIso() {
  return new Date().toISOString();
}

router.post("/", async (req, res) => {
  const { colaborador_id, equipamento_id, data_atribuicao } = req.body || {};

  if (!colaborador_id || !equipamento_id) {
    return res
      .status(400)
      .json({ error: "Campos obrigatórios: colaborador_id, equipamento_id" });
  }

  try {
    const usuarioId = Number(req.user?.id);
    await run("BEGIN IMMEDIATE");

    const colaborador = await get(
      `SELECT id FROM colaboradores WHERE id = ?`,
      [colaborador_id]
    );
    if (!colaborador) {
      await run("ROLLBACK");
      return res.status(404).json({ error: "Colaborador não encontrado" });
    }

    const equipamento = await get(
      `SELECT id, status, situacao FROM equipamentos WHERE id = ?`,
      [equipamento_id]
    );
    if (!equipamento) {
      await run("ROLLBACK");
      return res.status(404).json({ error: "Equipamento não encontrado" });
    }

    if (String(equipamento.situacao || "ativo") !== "ativo") {
      await run("ROLLBACK");
      return res.status(409).json({ error: "Equipamento inativo não pode ser atribuído" });
    }

    if (equipamento.status !== "disponivel") {
      await run("ROLLBACK");
      return res.status(409).json({ error: "Equipamento já está em uso" });
    }

    const activeAssignment = await get(
      `SELECT id FROM atribuicoes WHERE equipamento_id = ? AND status = 'ativo' LIMIT 1`,
      [equipamento_id]
    );
    if (activeAssignment) {
      await run("ROLLBACK");
      return res.status(409).json({ error: "Equipamento já está em uso" });
    }

    await run(
      `UPDATE equipamentos SET status = 'em uso' WHERE id = ?`,
      [equipamento_id]
    );

    const data = data_atribuicao ? String(data_atribuicao) : nowIso();
    const result = await run(
      `
        INSERT INTO atribuicoes (
          colaborador_id,
          equipamento_id,
          data_atribuicao,
          status,
          data_devolucao
        )
        VALUES (?, ?, ?, 'ativo', NULL)
      `,
      [colaborador_id, equipamento_id, data]
    );

    await registerAuditLog({
      usuarioId,
      acao: "ATRIBUIR",
      entidade: "atribuicao",
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
    if (String(err?.message || "").toLowerCase().includes("unique")) {
      return res.status(409).json({ error: "Equipamento já está em uso" });
    }
    return res.status(500).json({ error: "Erro ao atribuir equipamento" });
  }
});

module.exports = router;

