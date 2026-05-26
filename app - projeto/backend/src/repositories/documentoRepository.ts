import prisma from "../database/prisma.js";

export async function listarDocumentos() {
  return prisma.documento.findMany({
    where: { ativo: true },
    include: {
      topico: {
        include: { curso: { select: { sigla: true } } },
      },
    },
  });
}

export async function buscarDocumentoPorId(id: number) {
  return prisma.documento.findUnique({ where: { id } });
}

export async function criarDocumento(dados: {
  topico_id: number;
  nome_exibicao: string;
  caminho_arquivo: string;
}) {
  return prisma.documento.create({ data: dados });
}

export async function desativarDocumento(id: number) {
  return prisma.documento.update({
    where: { id },
    data: { ativo: false },
  });
}