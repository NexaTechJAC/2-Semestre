import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/index.js";
import { iniciarScheduler } from "./infra/scheduler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use("/uploads", express.static("src/uploads"));

// Rotas
app.use(router);

// Inicia os jobs agendados
iniciarScheduler();

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;