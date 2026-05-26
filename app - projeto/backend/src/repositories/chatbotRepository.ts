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
      tipo: topico.tipo,
      conteudo: topico.resposta?.conteudo || topico.resposta?.texto_informativo || "",
      subItems: topico.sub_opcoes.map((sub) => ({
        id: String(sub.id),
        title: sub.titulo,
        conteudo: sub.conteudo,
      })),
    })),
  }));
}

export async function atualizarTopicoRepo(id: number, chave: string) {
  return prisma.topico.update({
    where: { id },
    data: { chave },
  });
}

export async function upsertRespostaRepo(topico_id: number, resposta: string) {
  return prisma.resposta.upsert({
    where: { topico_id },
    update: { conteudo: resposta, texto_informativo: resposta },
    create: { topico_id, conteudo: resposta, texto_informativo: resposta },
  });
}

export async function deletarLogsDoTopico(topico_id: number) {
  return prisma.logNavegacao.deleteMany({ where: { topico_id } });
}

export async function deletarTopicoRepo(id: number) {
  return prisma.topico.delete({ where: { id } });
}

export async function criarTopicoRepo(dados: {
  curso_id: number;
  chave: string;
  tipo: string;
}) {
  return prisma.topico.create({ data: dados });
}

export async function criarRespostaRepo(topico_id: number, conteudo: string) {
  return prisma.resposta.create({
    data: { topico_id, conteudo, texto_informativo: conteudo },
  });
}

export async function atualizarSubOpcaoRepo(id: number, titulo: string, conteudo: string) {
  return prisma.subOpcao.update({
    where: { id },
    data: { titulo, conteudo },
  });
}

export async function deletarSubOpcaoRepo(id: number) {
  return prisma.subOpcao.delete({ where: { id } });
}

export async function criarSubOpcaoRepo(topico_id: number, titulo: string, conteudo: string) {
  return prisma.subOpcao.create({
    data: { topico_id, titulo, conteudo },
  });
}

export async function promoverTopicoParaMenu(topico_id: number) {
  return prisma.topico.update({
    where: { id: topico_id },
    data: { tipo: "menu" },
  });
}