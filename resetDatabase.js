const { initDb, run, get, all, DB_PATH } = require("./db");

const REQUIRED_CONFIRMATION = "true";
const RESETTABLE_TABLES = [
  "auth_sessions",
  "auditoria_logs",
  "atribuicoes",
  "equipamentos",
  "colaboradores",
];

async function main() {
  if (String(process.env.CONFIRM_RESET || "").trim().toLowerCase() !== REQUIRED_CONFIRMATION) {
    console.error(
      'Reset bloqueado por segurança. Execute com CONFIRM_RESET=true para confirmar a limpeza.'
    );
    process.exitCode = 1;
    return;
  }

  await initDb();

  const adminUser = await get(
    `
      SELECT id, nome, usuario, perfil
      FROM usuarios
      WHERE usuario = 'admin'
      ORDER BY id ASC
      LIMIT 1
    `
  );

  if (!adminUser?.id) {
    throw new Error('Usuário admin não encontrado. Reset cancelado por segurança.');
  }

  const before = {
    colaboradores: Number((await get(`SELECT COUNT(*) AS total FROM colaboradores`))?.total || 0),
    equipamentos: Number((await get(`SELECT COUNT(*) AS total FROM equipamentos`))?.total || 0),
    atribuicoes: Number((await get(`SELECT COUNT(*) AS total FROM atribuicoes`))?.total || 0),
    auditoria_logs: Number((await get(`SELECT COUNT(*) AS total FROM auditoria_logs`))?.total || 0),
    auth_sessions: Number((await get(`SELECT COUNT(*) AS total FROM auth_sessions`))?.total || 0),
    usuarios: Number((await get(`SELECT COUNT(*) AS total FROM usuarios`))?.total || 0),
  };

  await run("BEGIN IMMEDIATE");

  try {
    for (const tableName of RESETTABLE_TABLES) {
      await run(`DELETE FROM ${tableName}`);
    }

    await run(`DELETE FROM usuarios WHERE id <> ?`, [adminUser.id]);
    await run(
      `
        DELETE FROM sqlite_sequence
        WHERE name IN ('atribuições', 'atribuicoes', 'equipamentos', 'colaboradores', 'auditoria_logs', 'auth_sessions')
      `
    );

    await run("COMMIT");
  } catch (error) {
    try {
      await run("ROLLBACK");
    } catch (_) {
      // ignore rollback errors
    }
    throw error;
  }

  const after = {
    colaboradores: Number((await get(`SELECT COUNT(*) AS total FROM colaboradores`))?.total || 0),
    equipamentos: Number((await get(`SELECT COUNT(*) AS total FROM equipamentos`))?.total || 0),
    atribuicoes: Number((await get(`SELECT COUNT(*) AS total FROM atribuicoes`))?.total || 0),
    auditoria_logs: Number((await get(`SELECT COUNT(*) AS total FROM auditoria_logs`))?.total || 0),
    auth_sessions: Number((await get(`SELECT COUNT(*) AS total FROM auth_sessions`))?.total || 0),
    usuarios: Number((await get(`SELECT COUNT(*) AS total FROM usuarios`))?.total || 0),
  };

  const remainingUsers = await all(
    `
      SELECT id, nome, usuario, perfil
      FROM usuarios
      ORDER BY id ASC
    `
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        dbPath: DB_PATH,
        adminMantido: adminUser,
        before,
        after,
        remainingUsers,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Falha ao resetar banco:", error.message || error);
  process.exitCode = 1;
});
