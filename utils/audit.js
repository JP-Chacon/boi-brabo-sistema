const { run } = require("../db");

const VALID_ACTIONS = new Set(["CREATE", "UPDATE", "INATIVAR", "ATRIBUIR", "DEVOLVER"]);
const VALID_ENTITIES = new Set(["equipamento", "colaborador", "atribuicao"]);

async function registerAuditLog({
  usuarioId,
  acao,
  entidade,
  entidadeId,
  exec = run,
  dataHora = new Date().toISOString(),
}) {
  const normalizedUserId = Number(usuarioId);
  const normalizedEntityId = Number(entidadeId);
  const normalizedAction = String(acao || "").trim().toUpperCase();
  const normalizedEntity = String(entidade || "").trim().toLowerCase();

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw new Error("usuario_id inválido para auditoria");
  }

  if (!VALID_ACTIONS.has(normalizedAction)) {
    throw new Error("acao de auditoria inválida");
  }

  if (!VALID_ENTITIES.has(normalizedEntity)) {
    throw new Error("entidade de auditoria inválida");
  }

  if (!Number.isInteger(normalizedEntityId) || normalizedEntityId <= 0) {
    throw new Error("entidade_id inválido para auditoria");
  }

  await exec(
    `
      INSERT INTO auditoria_logs (
        usuario_id,
        acao,
        entidade,
        entidade_id,
        data_hora
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [normalizedUserId, normalizedAction, normalizedEntity, normalizedEntityId, dataHora]
  );
}

module.exports = {
  registerAuditLog,
};
