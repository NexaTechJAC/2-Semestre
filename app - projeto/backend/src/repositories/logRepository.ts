import prisma from "../database/prisma.js";

export async function registrarLog(dados: {
  curso_id?: number;
  topico_id?: number;
  acao: string;
  satisfacao?: "gostei" | "nao_gostei";
}) {
  return prisma.logNavegacao.create({ data: dados });
}

export async function listarLogs() {
  return prisma.logNavegacao.findMany({
    orderBy: { acessado_em: "desc" },
    include: {
      curso: { select: { sigla: true } },
      topico: { select: { chave: true } },
    },
  });
}