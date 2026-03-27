const express = require("express");
const { run, get } = require("../db");
const { registerAuditLog } = require("../utils/audit");

const router = express.Router();

function nowIso() {
  return new Date().toISOString();
}

// POST /liberar
// Body: { equipamento_id }
router.post("/", async (req, res) => {
  const { equipamento_id } = req.body || {};

  if (!equipamento_id) {
    return res
      .status(400)
      .json({ error: "Campos obrigatórios: equipamento_id" });
  }

  try {
    const usuarioId = Number(req.user?.id);
    await run("BEGIN IMMEDIATE");

    const equipamento = await get(
      `SELECT id, status FROM equipamentos WHERE id = ?`,
      [equipamento_id]
    );
    if (!equipamento) {
      await run("ROLLBACK");
      return res.status(404).json({ error: "Equipamento não encontrado" });
    }

    const current = await get(
      `
        SELECT id
        FROM atribuicoes
        WHERE equipamento_id = ? AND status = 'ativo'
        ORDER BY id DESC
        LIMIT 1
      `,
      [equipamento_id]
    );

    if (!current) {
      await run("ROLLBACK");
      return res.status(409).json({ error: "Não existe atribuição ativa para este equipamento" });
    }

    await run(
      `UPDATE equipamentos SET status = 'disponivel' WHERE id = ?`,
      [equipamento_id]
    );

    const finalizedAt = nowIso();
    const update = await run(
      `
        UPDATE atribuicoes
        SET status = 'finalizado',
            data_devolucao = ?
        WHERE id = ?
      `,
      [finalizedAt, current.id]
    );

    await registerAuditLog({
      usuarioId,
      acao: "DEVOLVER",
      entidade: "atribuicao",
      entidadeId: current.id,
      exec: run,
    });

    await run("COMMIT");
    return res.status(201).json({
      ok: true,
      equipamento_id,
      atribuicao_id: current.id,
      atribuicoes_finalizadas: update.changes ?? 0,
      data_devolucao: finalizedAt,
    });
  } catch (err) {
    try {
      await run("ROLLBACK");
    } catch (_) {
      // ignore rollback errors
    }
    return res.status(500).json({ error: "Erro ao liberar equipamento" });
  }
});

module.exports = router;

