import {
  listarCursos,
  listarTopicosPorCurso,
  buscarResposta,
} from "../repositories/chatbotRepository.js";
import { registrarLog } from "../repositories/logRepository.js";

export async function getCursos() {
  return listarCursos();
}

export async function getTopicosPorCurso(sigla: string) {
  const topicos = await listarTopicosPorCurso(sigla);

  if (!topicos.length) {
    throw new Error(`Curso '${sigla}' não encontrado ou sem tópicos.`);
  }

  return topicos;
}

export async function getResposta(sigla: string, chave: string) {
  const topico = await buscarResposta(sigla, chave);

  if (!topico) {
    throw new Error(`Tópico '${chave}' não encontrado para o curso '${sigla}'.`);
  }

  // Registra o acesso nos logs
  await registrarLog({
    acao: topico.tipo === "pdf" ? "baixou_pdf" : "visualizou_resposta",
    topico_id: topico.id,
  });

  return topico;
}

export async function registrarSatisfacao(
  topico_id: number,
  curso_id: number,
  satisfacao: "gostei" | "nao_gostei"
) {
  return registrarLog({ topico_id, curso_id, acao: "avaliou", satisfacao });
}