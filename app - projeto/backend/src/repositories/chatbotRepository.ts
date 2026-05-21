import prisma from "../database/prisma.js";

export async function listarCursos() {
  return prisma.curso.findMany({
    where: { ativo: true },
    select: { id: true, sigla: true, nome: true },
  });
}

export async function listarTopicosPorCurso(sigla: string) {
  return prisma.topico.findMany({
    where: {
      curso: { sigla },
    },
    select: { id: true, chave: true, tipo: true },
  });
}

export async function buscarResposta(sigla: string, chave: string) {
  return prisma.topico.findFirst({
    where: {
      chave,
      curso: { sigla },
    },
    include: {
      resposta: true,
      sub_opcoes: true,
      documentos: {
        where: { ativo: true },
        select: { id: true, nome_exibicao: true, caminho_arquivo: true },
      },
    },
  });
}