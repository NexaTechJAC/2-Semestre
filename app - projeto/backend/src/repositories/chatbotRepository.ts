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

// Mapa de sigla para ícone (para o frontend)
const iconesPorSigla: Record<string, string> = {
  DSM: "MonitorPlay",
  GEO: "Globe",
  MARH: "Notebook",
  // Adicione outros cursos aqui conforme necessário
};

export async function listarCursosEstruturadoCompleto() {
  const cursos = await prisma.curso.findMany({
    where: { ativo: true },
    include: {
      topicos: {
        include: {
          resposta: true,
          sub_opcoes: true,
        },
      },
    },
    orderBy: { sigla: "asc" },
  });

  return cursos.map((curso) => ({
    id: curso.sigla.toLowerCase(),
    curso_id: curso.id,
    title: curso.sigla,
    icon: iconesPorSigla[curso.sigla] ?? "Notebook",
    categories: curso.topicos.map((topico) => ({
      id: String(topico.id),
      title: topico.chave,
      conteudo: topico.resposta?.conteudo || topico.resposta?.texto_informativo || "",
      subItems: topico.sub_opcoes.map((sub) => ({
        id: String(sub.id),
        title: sub.titulo,
        conteudo: sub.conteudo,
      })),
    })),
  }));
}