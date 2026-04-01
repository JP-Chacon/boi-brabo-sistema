const express = require("express");
const { run, get } = require("../db");
const { registerAuditLog } = require("../utils/audit");

const router = express.Router();

function nowIso() {
  return new Date().toISOString();
}

function normalizeIds(input) {
  const list = Array.isArray(input) ? input : input != null ? [input] : [];
  const parsed = list
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
  return Array.from(new Set(parsed));
}

router.post("/", async (req, res) => {
  const { colaborador_id, equipamento_id, equipamento_ids, data_atribuicao } = req.body || {};
  const ids = normalizeIds(equipamento_ids ?? equipamento_id);

  if (!colaborador_id || !ids.length) {
    return res
      .status(400)
      .json({ error: "Campos obrigatórios: colaborador_id e equipamento_id(s)" });
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

    const createdItems = [];
    const data = data_atribuicao ? String(data_atribuicao) : nowIso();

    for (const id of ids) {
      const equipamento = await get(
        `SELECT id, nome, status, situacao FROM equipamentos WHERE id = ?`,
        [id]
      );
      if (!equipamento) {
        await run("ROLLBACK");
        return res.status(404).json({ error: `Equipamento não encontrado (id: ${id})` });
      }

      if (String(equipamento.situacao || "ativo") !== "ativo") {
        await run("ROLLBACK");
        return res.status(409).json({ error: `Equipamento inativo não pode ser atribuído (${equipamento.nome})` });
      }

      if (equipamento.status !== "disponivel") {
        await run("ROLLBACK");
        return res.status(409).json({ error: `Equipamento já está em uso (${equipamento.nome})` });
      }

      const activeAssignment = await get(
        `SELECT id FROM atribuicoes WHERE equipamento_id = ? AND status = 'ativo' LIMIT 1`,
        [id]
      );
      if (activeAssignment) {
        await run("ROLLBACK");
        return res.status(409).json({ error: `Equipamento já está em uso (${equipamento.nome})` });
      }

      await run(`UPDATE equipamentos SET status = 'em uso' WHERE id = ?`, [id]);

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
        [colaborador_id, id, data]
      );

      await registerAuditLog({
        usuarioId,
        acao: "ATRIBUIR",
        entidade: "atribuicao",
        entidadeId: result.lastID,
        exec: run,
      });

      createdItems.push({ id: result.lastID, equipamento_id: id });
    }

    await run("COMMIT");

    if (createdItems.length === 1) {
      return res.status(201).json({ id: createdItems[0].id });
    }
    return res.status(201).json({ ok: true, items: createdItems });
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

