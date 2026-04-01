const path = require("path");
const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");

const colaboradoresRoutes = require("./routes/colaboradores");
const equipamentosRoutes = require("./routes/equipamentos");
const atribuirRoutes = require("./routes/atribuir");
const atribuicoesRoutes = require("./routes/atribuicoes");
const liberarRoutes = require("./routes/liberar");
const authRoutes = require("./routes/auth");
const cargosRoutes = require("./routes/cargos");
const departamentosRoutes = require("./routes/departamentos");
const usuariosRoutes = require("./routes/usuarios");
const authMiddlewareFactory = require("./middleware/authMiddleware");

async function main() {
  // Garante que o banco seja criado/atualizado antes de subir as rotas.
  await initDb();

  const app = express();
  app.use(express.json());

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  const isProd = String(process.env.NODE_ENV || "").trim().toLowerCase() === "production";
  const staticOptions = isProd
    ? undefined
    : {
        cacheControl: false,
        maxAge: 0,
        etag: false,
        lastModified: false,
        setHeaders(res, filePath) {
          const normalized = String(filePath || "").toLowerCase();
          const shouldNoCache =
            normalized.endsWith(".js") ||
            normalized.endsWith(".css") ||
            normalized.endsWith(".html");
          if (shouldNoCache) {
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
          }
        },
      };

  const authMiddleware = authMiddlewareFactory();

  app.get("/health", (req, res) => res.json({ ok: true }));

  // Rotas públicas (POST /usuarios antes do app.use("/usuarios", ...) protegido)
  app.post("/login", authRoutes.login);
  app.post("/usuarios", authRoutes.register);

  // Rotas protegidas — registradas antes do express.static para não serem sombreadas
  app.post("/logout", authMiddleware, authRoutes.logout);
  app.use("/colaboradores", authMiddleware, colaboradoresRoutes);
  app.use("/equipamentos", authMiddleware, equipamentosRoutes);
  app.use("/atribuir", authMiddleware, atribuirRoutes);
  app.use("/atribuicoes", authMiddleware, atribuicoesRoutes);
  app.use("/liberar", authMiddleware, liberarRoutes);
  app.use("/cargos", authMiddleware, cargosRoutes);
  app.use("/departamentos", authMiddleware, departamentosRoutes);
  app.use("/usuarios", authMiddleware, usuariosRoutes);

  // Arquivos estáticos (após as rotas da API)
  app.use(express.static(path.join(__dirname, "public"), staticOptions));
  app.use("/node_modules", express.static(path.join(__dirname, "node_modules"), staticOptions));

  app.get("/", (req, res) => {
    if (!isProd) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    res.sendFile(path.join(__dirname, "public", "login.html"));
  });

  // Fallback para compatibilidade: evita "Cannot GET /login"
  app.get("/login", (req, res) => {
    if (!isProd) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    res.redirect(302, "/login.html");
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  app.listen(port, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Falha ao iniciar servidor:", err);
  process.exit(1);
});
