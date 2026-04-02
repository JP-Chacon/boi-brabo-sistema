/**
 * Normaliza para apenas dígitos (máx. 14).
 */
function normalizeDocumentoDigits(input) {
  return String(input || "").replace(/\D/g, "").slice(0, 14);
}

function isValidCpfDigits(digits) {
  const cpf = String(digits || "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(cpf[i]) * (10 - i);
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(cpf[i]) * (11 - i);
  check = (sum * 10) % 11;
  if (check === 10) check = 0;
  return check === Number(cpf[10]);
}

function isValidCnpjDigits(digits) {
  const cnpj = String(digits || "");
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i += 1) sum += Number(cnpj[i]) * w1[i];
  let mod = sum % 11;
  const d1 = mod < 2 ? 0 : 11 - mod;
  if (d1 !== Number(cnpj[12])) return false;
  sum = 0;
  for (let i = 0; i < 13; i += 1) sum += Number(cnpj[i]) * w2[i];
  mod = sum % 11;
  const d2 = mod < 2 ? 0 : 11 - mod;
  return d2 === Number(cnpj[13]);
}

function isValidDocumentoDigits(digits) {
  const d = String(digits || "");
  if (d.length === 11) return isValidCpfDigits(d);
  if (d.length === 14) return isValidCnpjDigits(d);
  return false;
}

module.exports = {
  normalizeDocumentoDigits,
  isValidCpfDigits,
  isValidCnpjDigits,
  isValidDocumentoDigits,
};
