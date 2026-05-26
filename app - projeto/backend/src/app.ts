import express from "express";
import cors from "cors";
import router from "./routes/index.js";

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use("/uploads", express.static("src/uploads"));

// Rotas
app.use(router);

export default app;