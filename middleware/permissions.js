function getEffectiveRoleFromUser(user) {
  const perfil = String(user?.perfil || "").trim().toLowerCase();
  return perfil === "admin" ? "admin" : "operador";
}

function roleRank(role) {
  if (role === "operador") return 1;
  if (role === "admin") return 2;
  return 0;
}

function requireAtLeast(minRole) {
  const min = roleRank(minRole);
  return (req, res, next) => {
    const role = getEffectiveRoleFromUser(req.user);
    if (roleRank(role) < min) {
      return res.status(403).json({ error: "Permissão insuficiente" });
    }
    return next();
  };
}

module.exports = {
  getEffectiveRoleFromUser,
  requireAtLeast,
};
