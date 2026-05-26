import {
  criarPergunta,
  listarPendentesHoje,
  listarEnviadas,
  marcarComoEnviadas,
  marcarComoRespondida,
  deletarRespondidas,
} from "../repositories/perguntaRepository.js";
import { enviarEmailDiario } from "./emailService.js";

export async function enviarPergunta(dados: {
  nome_aluno: string;
  email_aluno: string;
  curso_sigla?: string;
  texto: string;
}) {
  return criarPergunta(dados);
}

export async function getPerguntas(data?: string) {
  return listarEnviadas(data);
}

export async function responderPergunta(id: number) {
  return marcarComoRespondida(id);
}

export async function processarFilaDiaria() {
  const perguntas = await listarPendentesHoje();

  if (!perguntas.length) {
    console.log("[Scheduler] Nenhuma pergunta pendente hoje.");
    return;
  }

  await enviarEmailDiario(perguntas);

  const ids = perguntas.map((p) => p.id);
  await marcarComoEnviadas(ids);

  console.log(`[Scheduler] ${perguntas.length} pergunta(s) enviadas por e-mail.`);
}

export async function limparRespondidas() {
  const resultado = await deletarRespondidas();
  console.log(`[Scheduler] ${resultado.count} pergunta(s) respondidas removidas.`);
}