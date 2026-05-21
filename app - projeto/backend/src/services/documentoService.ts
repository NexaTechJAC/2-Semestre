import path from "path";
import {
  listarDocumentos,
  buscarDocumentoPorId,
  criarDocumento,
  desativarDocumento,
} from "../repositories/documentoRepository.js";

export async function getDocumentos() {
  return listarDocumentos();
}

export async function getDocumento(id: number) {
  const doc = await buscarDocumentoPorId(id);

  if (!doc || !doc.ativo) {
    throw new Error("Documento não encontrado.");
  }

  return doc;
}

export async function salvarDocumento(dados: {
  topico_id: number;
  nome_exibicao: string;
  filename: string;
}) {
  const caminho_arquivo = `/uploads/${dados.filename}`;

  return criarDocumento({
    topico_id: dados.topico_id,
    nome_exibicao: dados.nome_exibicao,
    caminho_arquivo,
  });
}

export async function removerDocumento(id: number) {
  const doc = await buscarDocumentoPorId(id);

  if (!doc) {
    throw new Error("Documento não encontrado.");
  }

  return desativarDocumento(id);
}

export function getCaminhoAbsoluto(caminho_arquivo: string): string {
  return path.join(process.cwd(), "src", caminho_arquivo);
}