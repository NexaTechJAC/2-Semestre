import cron from "node-cron";
import { processarFilaDiaria, limparRespondidas } from "../services/perguntaService.js";

export function iniciarScheduler() {
  // Job 1: todo dia às 23:59 — coleta as perguntas pendentes, gera o .txt e envia por e-mail
  cron.schedule("59 23 * * *", async () => {
    console.log("[Scheduler] Iniciando envio diário de perguntas...");
    await processarFilaDiaria();
  }, {
    timezone: "America/Sao_Paulo"
  });

  // Job 2: a cada hora — deleta perguntas respondidas há mais de 24h
  cron.schedule("0 * * * *", async () => {
    console.log("[Scheduler] Verificando perguntas para limpeza...");
    await limparRespondidas();
  }, {
    timezone: "America/Sao_Paulo"
  });

  console.log("[Scheduler] Jobs agendados com sucesso.");
}