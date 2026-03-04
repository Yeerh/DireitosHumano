import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import terreirosRoutes from "./routes/terreiros.js";
import vinculosRoutes from "./routes/vinculos.js";
import denunciasRoutes from "./routes/denuncias.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "Direitos Humano API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth (POST register, POST login, GET me)",
      users: "/api/users (GET, GET/:id, PUT/:id, DELETE/:id)",
      terreiros: "/api/terreiros (GET, GET/:id, POST, PUT/:id, DELETE/:id)",
      vinculos: "/api/vinculos (GET, GET/terreiro/:id, GET/:id, POST, PUT/:id, DELETE/:id)",
      denuncias: "/api/denuncias (GET, GET/:id, POST, PUT/:id, DELETE/:id)",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/terreiros", terreirosRoutes);
app.use("/api/vinculos", vinculosRoutes);
app.use("/api/denuncias", denunciasRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
