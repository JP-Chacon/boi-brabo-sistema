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

  app.use(express.static(path.join(__dirname, "public")));
  app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

  const authMiddleware = authMiddlewareFactory();

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
  });

  // Rotas públicas
  app.post("/login", authRoutes.login);

  // Rotas protegidas
  app.post("/logout", authMiddleware, authRoutes.logout);
  app.use("/colaboradores", authMiddleware, colaboradoresRoutes);
  app.use("/equipamentos", authMiddleware, equipamentosRoutes);
  app.use("/atribuir", authMiddleware, atribuirRoutes);
  app.use("/atribuicoes", authMiddleware, atribuicoesRoutes);
  app.use("/liberar", authMiddleware, liberarRoutes);

  // Healthcheck opcional
  app.get("/health", (req, res) => res.json({ ok: true }));

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

