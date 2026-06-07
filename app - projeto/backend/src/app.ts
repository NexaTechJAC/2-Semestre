import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/index.js";
import { iniciarScheduler } from "./infra/scheduler.js";

dotenv.config();

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

// Healthcheck — citado no README
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Inicia os jobs agendados
iniciarScheduler();

export default app;