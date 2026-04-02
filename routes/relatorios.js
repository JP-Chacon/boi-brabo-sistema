const express = require("express");
const { all } = require("../db");
const { requireAtLeast } = require("../middleware/permissions");

const router = express.Router();

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// GET /relatorios/resumo
router.get("/resumo", requireAtLeast("operador"), async (req, res) => {
  try {
    const row = await all(
      `
        SELECT
          COALESCE(SUM(CASE WHEN COALESCE(situacao, 'ativo') = 'ativo' THEN COALESCE(valor, 0) ELSE 0 END), 0) AS total_valor,
          COALESCE(SUM(CASE WHEN COALESCE(situacao, 'ativo') = 'ativo' AND status = 'em uso' THEN COALESCE(valor, 0) ELSE 0 END), 0) AS valor_em_uso,
          COALESCE(SUM(CASE WHEN COALESCE(situacao, 'ativo') = 'ativo' AND status = 'disponivel' THEN COALESCE(valor, 0) ELSE 0 END), 0) AS valor_disponivel
        FROM equipamentos
      `
    );
    const r = row?.[0] || {};
    return res.json({
      total_valor: num(r.total_valor),
      valor_em_uso: num(r.valor_em_uso),
      valor_disponivel: num(r.valor_disponivel),
    });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao carregar resumo financeiro" });
  }
});

// GET /relatorios/por-departamento
router.get("/por-departamento", requireAtLeast("operador"), async (req, res) => {
  try {
    const rows = await all(
      `
        SELECT
          d.id AS departamento_id,
          d.nome AS departamento_nome,
          COALESCE(SUM(COALESCE(e.valor, 0)), 0) AS total_valor
        FROM departamentos d
        LEFT JOIN colaboradores c ON c.departamento_id = d.id
        LEFT JOIN atribuicoes a ON a.colaborador_id = c.id AND a.status = 'ativo'
        LEFT JOIN equipamentos e ON e.id = a.equipamento_id AND COALESCE(e.situacao, 'ativo') = 'ativo'
        GROUP BY d.id, d.nome
        ORDER BY total_valor DESC, d.nome ASC
      `
    );
    return res.json(
      rows.map((r) => ({
        departamento_id: r.departamento_id,
        departamento_nome: String(r.departamento_nome || "—"),
        total_valor: num(r.total_valor),
      }))
    );
  } catch (err) {
    return res.status(500).json({ error: "Erro ao carregar valores por departamento" });
  }
});

// GET /relatorios/por-status
router.get("/por-status", requireAtLeast("operador"), async (req, res) => {
  try {
    const rows = await all(
      `
        SELECT
          status,
          COALESCE(SUM(COALESCE(valor, 0)), 0) AS total_valor
        FROM equipamentos
        WHERE COALESCE(situacao, 'ativo') = 'ativo'
        GROUP BY status
      `
    );
    return res.json(
      rows.map((r) => ({
        status: String(r.status || "").trim(),
        total_valor: num(r.total_valor),
      }))
    );
  } catch (err) {
    return res.status(500).json({ error: "Erro ao carregar valores por status" });
  }
});

module.exports = router;
