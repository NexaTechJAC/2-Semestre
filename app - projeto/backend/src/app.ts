import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import { iniciarScheduler } from "./infra/scheduler.js";

const app = express();

// Middlewares globais
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use("/uploads", express.static("src/uploads"));

// Rotas
app.use(router);

// Inicia os jobs agendados
iniciarScheduler();

export default app;