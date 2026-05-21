import prisma from "../database/prisma.js";

export async function criarPergunta(dados: {
  nome_aluno: string;
  email_aluno: string;
  curso_sigla?: string;
  texto: string;
}) {
  return prisma.perguntaUsuario.create({
    data: { ...dados, status: "pendente" },
  });
}

export async function listarPendentesHoje() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return prisma.perguntaUsuario.findMany({
    where: {
      status: "pendente",
      criado_em: { gte: hoje },
    },
    orderBy: { criado_em: "asc" },
  });
}

export async function listarEnviadas(data?: string) {
  const filtroData = data ? new Date(data) : undefined;

  return prisma.perguntaUsuario.findMany({
    where: {
      status: "enviada",
      ...(filtroData && {
        enviada_em: {
          gte: filtroData,
          lt: new Date(filtroData.getTime() + 86400000),
        },
      }),
    },
    orderBy: { criado_em: "asc" },
  });
}

export async function marcarComoEnviadas(ids: number[]) {
  return prisma.perguntaUsuario.updateMany({
    where: { id: { in: ids } },
    data: { status: "enviada", enviada_em: new Date() },
  });
}

export async function marcarComoRespondida(id: number) {
  return prisma.perguntaUsuario.update({
    where: { id },
    data: { status: "respondida", respondida_em: new Date() },
  });
}

export async function deletarRespondidas() {
  const limite = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return prisma.perguntaUsuario.deleteMany({
    where: {
      status: "respondida",
      respondida_em: { lt: limite },
    },
  });
}