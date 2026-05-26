import "dotenv/config";
import app from "./app.js";
import { iniciarScheduler } from "./infra/scheduler.js";

const PORT = process.env.PORT ?? 3000;

// Inicia os jobs agendados
iniciarScheduler();

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});