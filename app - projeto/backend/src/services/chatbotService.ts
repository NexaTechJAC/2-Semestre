import {
  listarCursos,
  listarTopicosPorCurso,
  buscarResposta,
  listarCursosEstruturadoCompleto,
} from "../repositories/chatbotRepository.js";
import { registrarLog } from "../repositories/logRepository.js";
import prisma from "../database/prisma.js";

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

  // Busca o curso_id a partir da sigla
  const curso = await prisma.curso.findFirst({
    where: { sigla },
    select: { id: true },
  });

  // Registra o acesso nos logs com curso_id
  await registrarLog({
    acao: topico.tipo === "pdf" ? "baixou_pdf" : topico.tipo === "menu" ? "acessou_menu" : "visualizou_resposta",
    topico_id: topico.id,
    curso_id: curso?.id,
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

// ✅ NOVA FUNÇÃO
export async function getCursosEstruturadoCompleto() {
  return listarCursosEstruturadoCompleto();
}