/**
 * Limpeza manual de dados de teste (mantém estrutura e usuários).
 *
 * NÃO é executado automaticamente. Uso:
 *
 *   PowerShell:
 *     $env:CONFIRM_RESET="true"; node resetDatabase.js
 *
 *   bash:
 *     CONFIRM_RESET=true node resetDatabase.js
 *
 * Remove registros de: atribuicoes → colaboradores → equipamentos → cargos → departamentos.
 * Opcionalmente zera sequências AUTOINCREMENT dessas tabelas.
 * Não altera usuários nem sessões (mantém pelo menos o fluxo de login existente).
 */

const { initDb, run, all } = require("./db");

async function tableNames() {
  const rows = await all(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
  );
  return (rows || []).map((r) => r.name);
}

async function main() {
  if (String(process.env.CONFIRM_RESET || "").trim() !== "true") {
    console.error(
      "[resetDatabase] Abortado: defina CONFIRM_RESET=true para confirmar a limpeza dos dados."
    );
    process.exit(1);
  }

  await initDb();

  const names = await tableNames();
  const required = ["atribuicoes", "colaboradores", "equipamentos", "cargos", "departamentos"];
  const missing = required.filter((t) => !names.includes(t));
  if (missing.length) {
    console.error("[resetDatabase] Tabelas ausentes no banco:", missing.join(", "));
    process.exit(1);
  }

  await run("BEGIN IMMEDIATE");
  try {
    await run("DELETE FROM atribuicoes");
    await run("DELETE FROM colaboradores");
    await run("DELETE FROM equipamentos");
    await run("DELETE FROM cargos");
    await run("DELETE FROM departamentos");

    const seqRows = await all(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'`
    );
    if (seqRows?.length) {
      await run(
        `DELETE FROM sqlite_sequence WHERE name IN ('atribuicoes','colaboradores','equipamentos','cargos','departamentos')`
      );
    }

    await run("COMMIT");
    console.log("[resetDatabase] Concluído: dados removidos e sequências resetadas (onde aplicável).");
  } catch (err) {
    try {
      await run("ROLLBACK");
    } catch (_) {
      // ignore
    }
    console.error("[resetDatabase] Erro:", err?.message || err);
    process.exit(1);
  }
}

main();
