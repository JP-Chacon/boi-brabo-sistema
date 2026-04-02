const path = require("path");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcryptjs");

function resolveDbPath() {
  if (process.env.SQLITE_DB_PATH && String(process.env.SQLITE_DB_PATH).trim()) {
    return String(process.env.SQLITE_DB_PATH).trim();
  }

  // Render: use um disco persistente quando configurado.
  if (process.env.RENDER_DISK_PATH && String(process.env.RENDER_DISK_PATH).trim()) {
    return path.join(String(process.env.RENDER_DISK_PATH).trim(), "controle_colaboradores.sqlite");
  }

  // Default: mesmo arquivo do projeto (dev local).
  return path.join(__dirname, "controle_colaboradores.sqlite");
}

const DB_PATH = resolveDbPath();

let db;

function getDb() {
  if (!db) throw new Error("DB não inicializado");
  return db;
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function columnExists(tableName, columnName) {
  const columns = await all(`PRAGMA table_info(${tableName})`);
  return columns.some((column) => column.name === columnName);
}

async function migrateCargosDepartamentoSchema() {
  const master = await get(`SELECT sql FROM sqlite_master WHERE type='table' AND name='cargos'`);
  const ddl = String(master?.sql || "");

  if (!(await columnExists("cargos", "departamento_id"))) {
    await run(`ALTER TABLE cargos ADD COLUMN departamento_id INTEGER REFERENCES departamentos(id)`);
  }

  if (ddl.includes("UNIQUE") && ddl.toLowerCase().includes("nome")) {
    await run("BEGIN IMMEDIATE");
    try {
      await run(`
        CREATE TABLE cargos_mig (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          departamento_id INTEGER,
          FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
        )
      `);
      await run(
        `
          INSERT INTO cargos_mig (id, nome, departamento_id)
          SELECT id, nome, departamento_id FROM cargos
        `
      );
      await run(`DROP TABLE cargos`);
      await run(`ALTER TABLE cargos_mig RENAME TO cargos`);
      await run("COMMIT");
    } catch (err) {
      try {
        await run("ROLLBACK");
      } catch (_) {
        // ignore
      }
      throw err;
    }
  }

  await run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_cargos_departamento_nome
    ON cargos (departamento_id, nome)
    WHERE departamento_id IS NOT NULL
  `);
}

async function seedDefaultAdminUser() {
  const row = await get(`SELECT COUNT(*) AS total FROM usuarios`);
  if (Number(row?.total || 0) > 0) return;

  const defaultName = process.env.DEFAULT_ADMIN_NAME || "Administrador";
  const defaultUsername = process.env.DEFAULT_ADMIN_USER || "admin";
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "1234";
  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  await run(
    `
      INSERT INTO usuarios (nome, usuario, senha_hash, perfil, criado_em)
      VALUES (?, ?, ?, 'admin', ?)
    `,
    [defaultName, defaultUsername, passwordHash, new Date().toISOString()]
  );
}

async function initDb() {
  if (db) return;

  db = new sqlite3.Database(DB_PATH);

  // Ativa constraints (FK, UNIQUE etc).
  await run("PRAGMA foreign_keys = ON");

  // Departamentos (antes de cargos — FK)
  await run(`
    CREATE TABLE IF NOT EXISTS departamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE
    );
  `);

  // Cargos (novos installs: sem UNIQUE global em nome)
  await run(`
    CREATE TABLE IF NOT EXISTS cargos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      departamento_id INTEGER,
      FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
    );
  `);

  await migrateCargosDepartamentoSchema();

  // Unidades (matriz/filial)
  await run(`
    CREATE TABLE IF NOT EXISTS unidades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('matriz','filial')) DEFAULT 'matriz',
      cidade TEXT DEFAULT '',
      estado TEXT DEFAULT '',
      ativo INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Unicidade: mesmo nome pode existir em cidade/estado diferentes (case-insensitive)
  await run(`DROP INDEX IF EXISTS idx_unidades_nome_lower`);
  await run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_unidades_nome_cidade_estado_lower
    ON unidades (
      LOWER(TRIM(nome)),
      LOWER(TRIM(COALESCE(cidade, ''))),
      LOWER(TRIM(COALESCE(estado, '')))
    )
  `);

  // Colaboradores
  await run(`
    CREATE TABLE IF NOT EXISTS colaboradores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT NOT NULL UNIQUE,
      cargo TEXT NOT NULL,
      setor TEXT NOT NULL,
      unidade TEXT,
      unidade_id INTEGER
    );
  `);

  if (!(await columnExists("colaboradores", "cargo_id"))) {
    await run(`ALTER TABLE colaboradores ADD COLUMN cargo_id INTEGER`);
  }

  if (!(await columnExists("colaboradores", "departamento_id"))) {
    await run(`ALTER TABLE colaboradores ADD COLUMN departamento_id INTEGER`);
  }

  if (!(await columnExists("colaboradores", "unidade"))) {
    await run(`ALTER TABLE colaboradores ADD COLUMN unidade TEXT`);
  }

  if (!(await columnExists("colaboradores", "unidade_id"))) {
    await run(`ALTER TABLE colaboradores ADD COLUMN unidade_id INTEGER`);
  }

  await run(`
    CREATE INDEX IF NOT EXISTS idx_colaboradores_unidade_id
    ON colaboradores (unidade_id)
  `);

  // Migra valores legados do campo texto "unidade" para "unidade_id"
  await run(`
    INSERT OR IGNORE INTO unidades (nome, tipo, cidade, estado, ativo)
    SELECT DISTINCT
      TRIM(unidade) AS nome,
      'matriz' AS tipo,
      '' AS cidade,
      '' AS estado,
      1 AS ativo
    FROM colaboradores
    WHERE unidade IS NOT NULL
      AND TRIM(unidade) <> ''
  `);

  await run(`
    UPDATE colaboradores
    SET unidade_id = (
      SELECT u.id
      FROM unidades u
      WHERE LOWER(u.nome) = LOWER(colaboradores.unidade)
      LIMIT 1
    )
    WHERE unidade IS NOT NULL
      AND TRIM(unidade) <> ''
      AND (unidade_id IS NULL)
  `);

  if (!(await columnExists("colaboradores", "documento"))) {
    await run(`ALTER TABLE colaboradores ADD COLUMN documento TEXT`);
    await run(`
      UPDATE colaboradores
      SET documento = REPLACE(REPLACE(REPLACE(REPLACE(TRIM(COALESCE(cpf, '')), '.', ''), '-', ''), '/', ''), ' ', '')
      WHERE documento IS NULL OR TRIM(COALESCE(documento, '')) = ''
    `);
    await run(`
      UPDATE colaboradores
      SET cpf = documento
      WHERE documento IS NOT NULL AND TRIM(documento) != ''
    `);
  }

  if (await columnExists("colaboradores", "documento")) {
    await run(`
      UPDATE colaboradores
      SET cpf = documento
      WHERE documento IS NOT NULL AND TRIM(documento) != ''
        AND (cpf IS NULL OR cpf != documento)
    `);
  }

  // Equipamentos
  await run(`
    CREATE TABLE IF NOT EXISTS equipamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      marca TEXT NOT NULL,
      codigo_barras TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL CHECK(status IN ('disponivel','em uso')),
      situacao TEXT NOT NULL DEFAULT 'ativo'
    );
  `);

  if (!(await columnExists("equipamentos", "situacao"))) {
    await run(`ALTER TABLE equipamentos ADD COLUMN situacao TEXT NOT NULL DEFAULT 'ativo'`);
  }

  if (!(await columnExists("equipamentos", "serial"))) {
    await run(`ALTER TABLE equipamentos ADD COLUMN serial TEXT`);
  }

  if (!(await columnExists("equipamentos", "modelo"))) {
    await run(`ALTER TABLE equipamentos ADD COLUMN modelo TEXT`);
  }

  if (!(await columnExists("equipamentos", "observacoes"))) {
    await run(`ALTER TABLE equipamentos ADD COLUMN observacoes TEXT`);
  }

  if (!(await columnExists("equipamentos", "valor"))) {
    await run(`ALTER TABLE equipamentos ADD COLUMN valor REAL`);
  }

  await run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_equipamentos_serial_unique
    ON equipamentos (serial)
    WHERE serial IS NOT NULL AND TRIM(serial) <> ''
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      usuario TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      perfil TEXT NOT NULL CHECK(perfil IN ('admin','operador')),
      criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expira_em TEXT NOT NULL,
      revogado_em TEXT,
      criado_em TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS auditoria_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      acao TEXT NOT NULL CHECK(acao IN ('CREATE','UPDATE','INATIVAR','ATRIBUIR','DEVOLVER')),
      entidade TEXT NOT NULL CHECK(entidade IN ('equipamento','colaborador','atribuicao')),
      entidade_id INTEGER NOT NULL,
      data_hora TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
    );
  `);

  await run(`
    CREATE INDEX IF NOT EXISTS idx_auditoria_logs_usuario_data
    ON auditoria_logs (usuario_id, data_hora DESC)
  `);

  await run(`
    CREATE INDEX IF NOT EXISTS idx_auditoria_logs_entidade
    ON auditoria_logs (entidade, entidade_id, data_hora DESC)
  `);

  // Atribuições
  await run(`
    CREATE TABLE IF NOT EXISTS atribuicoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      colaborador_id INTEGER NOT NULL,
      equipamento_id INTEGER NOT NULL,
      data_atribuicao TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      status TEXT NOT NULL DEFAULT 'ativo',
      data_devolucao TEXT,
      FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE RESTRICT,
      FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE RESTRICT
    );
  `);

  if (!(await columnExists("atribuicoes", "status"))) {
    await run(`ALTER TABLE atribuicoes ADD COLUMN status TEXT NOT NULL DEFAULT 'ativo'`);
  }

  if (!(await columnExists("atribuicoes", "data_devolucao"))) {
    await run(`ALTER TABLE atribuicoes ADD COLUMN data_devolucao TEXT`);
  }

  await run(`
    UPDATE atribuicoes
    SET status = 'ativo'
    WHERE status IS NULL OR TRIM(status) = ''
  `);

  await run(`
    UPDATE atribuicoes
    SET status = 'finalizado',
        data_devolucao = COALESCE(data_devolucao, data_atribuicao)
    WHERE equipamento_id IN (
      SELECT id FROM equipamentos WHERE status <> 'em uso'
    )
      AND status = 'ativo'
  `);

  await run(`
    UPDATE atribuicoes
    SET status = 'finalizado',
        data_devolucao = COALESCE(data_devolucao, data_atribuicao)
    WHERE id IN (
      SELECT antiga.id
      FROM atribuicoes antiga
      JOIN atribuicoes recente
        ON recente.equipamento_id = antiga.equipamento_id
       AND recente.status = 'ativo'
       AND antiga.status = 'ativo'
       AND recente.id > antiga.id
    )
  `);

  await run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_atribuicoes_equipamento_ativo
    ON atribuicoes (equipamento_id)
    WHERE status = 'ativo'
  `);

  await seedDefaultAdminUser();
}

module.exports = {
  DB_PATH,
  initDb,
  run,
  all,
  get,
};

