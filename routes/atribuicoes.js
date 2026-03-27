const express = require("express");
const { all } = require("../db");

const router = express.Router();

function normalizeStatusFilter(input) {
  const value = String(input || "ativo").trim().toLowerCase();
  if (["ativo", "finalizado", "all"].includes(value)) return value;
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
    "colaborador",
    "equipamento",
    "status",
    "data_inicial",
    "data_final",
  ].some((key) => query[key] != null && String(query[key]).trim() !== "");
}

// GET /atribuicoes
router.get("/", async (req, res) => {
  try {
    if (hasAdvancedListQuery(req.query)) {
      const page = parsePositiveInt(req.query?.page, 1);
      const limit = Math.min(parsePositiveInt(req.query?.limit, 5), 50);
      const offset = (page - 1) * limit;
      const status = normalizeStatusFilter(req.query?.status);
      const q = String(req.query?.q || "").trim().toLowerCase();
      const colaborador = String(req.query?.colaborador || "").trim().toLowerCase();
      const equipamento = String(req.query?.equipamento || "").trim().toLowerCase();
      const dataInicial = String(req.query?.data_inicial || "").trim();
      const dataFinal = String(req.query?.data_final || "").trim();
      const conditions = [];
      const params = [];

      if (status !== "all") {
        conditions.push("a.status = ?");
        params.push(status);
      }

      if (q) {
        conditions.push(`
          (
            LOWER(c.nome) LIKE ?
            OR LOWER(e.nome) LIKE ?
            OR LOWER(e.codigo_barras) LIKE ?
          )
        `);
        params.push(`%${q}%`, `%${q}%`, `%${q}%`);
      }

      if (colaborador) {
        conditions.push(`LOWER(c.nome) LIKE ?`);
        params.push(`%${colaborador}%`);
      }

      if (equipamento) {
        conditions.push(`LOWER(e.nome) LIKE ?`);
        params.push(`%${equipamento}%`);
      }

      if (dataInicial) {
        conditions.push(`date(a.data_atribuicao) >= date(?)`);
        params.push(dataInicial);
      }

      if (dataFinal) {
        conditions.push(`date(a.data_atribuicao) <= date(?)`);
        params.push(dataFinal);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const countRow = await all(
        `
          SELECT COUNT(*) AS total
          FROM atribuicoes a
          JOIN colaboradores c ON c.id = a.colaborador_id
          JOIN equipamentos e ON e.id = a.equipamento_id
          ${whereClause}
        `,
        params
      );
      const total = Number(countRow?.[0]?.total || 0);
      const rows = await all(
        `
          SELECT
            a.id,
            a.colaborador_id,
            a.equipamento_id,
            c.nome AS colaborador_nome,
            e.nome AS equipamento_nome,
            e.codigo_barras,
            a.data_atribuicao,
            a.status,
            a.data_devolucao
          FROM atribuicoes a
          JOIN colaboradores c ON c.id = a.colaborador_id
          JOIN equipamentos e ON e.id = a.equipamento_id
          ${whereClause}
          ORDER BY a.id DESC
          LIMIT ? OFFSET ?
        `,
        [...params, limit, offset]
      );

      return res.json({
        items: rows.map((r) => ({
          id: r.id,
          colaborador_id: r.colaborador_id,
          equipamento_id: r.equipamento_id,
          colaborador_nome: r.colaborador_nome,
          equipamento_nome: r.equipamento_nome,
          codigo_barras: r.codigo_barras,
          data_atribuicao: r.data_atribuicao,
          status: r.status,
          data_devolucao: r.data_devolucao,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    }

    const filter = normalizeStatusFilter(req.query?.status);
    const conditions = [];
    const params = [];

    if (filter !== "all") {
      conditions.push("a.status = ?");
      params.push(filter);
    }

    if (filter === "ativo") {
      conditions.push("e.status = 'em uso'");
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = await all(
      `
      SELECT
        a.id,
        a.colaborador_id,
        a.equipamento_id,
        c.nome AS colaborador_nome,
        e.nome AS equipamento_nome,
        e.codigo_barras,
        a.data_atribuicao,
        a.status,
        a.data_devolucao
      FROM atribuicoes a
      JOIN colaboradores c ON c.id = a.colaborador_id
      JOIN equipamentos e ON e.id = a.equipamento_id
      ${whereClause}
      ORDER BY a.id DESC
    `,
      params
    );

    return res.json(
      rows.map((r) => ({
        id: r.id,
        colaborador_id: r.colaborador_id,
        equipamento_id: r.equipamento_id,
        colaborador_nome: r.colaborador_nome,
        equipamento_nome: r.equipamento_nome,
        codigo_barras: r.codigo_barras,
        data_atribuicao: r.data_atribuicao,
        status: r.status,
        data_devolucao: r.data_devolucao,
      }))
    );
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar atribuições" });
  }
});

module.exports = router;

