import { Request, Response } from "express";
import {
  getDocumentos,
  getDocumento,
  salvarDocumento,
  removerDocumento,
  getCaminhoAbsoluto,
} from "../services/documentoService.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configuração do multer para upload de PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const curso = req.body.curso ?? "GERAL";
    const pasta = path.join(process.cwd(), "src", "uploads", curso);

    if (!fs.existsSync(pasta)) {
      fs.mkdirSync(pasta, { recursive: true });
    }

    cb(null, pasta);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos PDF são permitidos."));
    }
  },
});

export async function listarDocumentos(req: Request, res: Response) {
  try {
    const documentos = await getDocumentos();
    res.json(documentos);
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

export async function downloadDocumento(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    const doc = await getDocumento(id);
    const caminhoAbsoluto = getCaminhoAbsoluto(doc.caminho_arquivo);

    if (!fs.existsSync(caminhoAbsoluto)) {
      res.status(404).json({ error: "Arquivo não encontrado no servidor." });
      return;
    }

    res.download(caminhoAbsoluto, doc.nome_exibicao + ".pdf");
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(404).json({ error: mensagem });
  }
}

export async function uploadDocumento(req: Request, res: Response) {
  const { topico_id, nome_exibicao, curso } = req.body;

  if (!req.file || !topico_id || !nome_exibicao) {
    res.status(400).json({ error: "arquivo, topico_id e nome_exibicao são obrigatórios." });
    return;
  }

  try {
    const curso_pasta = curso ?? "GERAL";
    const filename = `${curso_pasta}/${req.file.originalname}`;
    const doc = await salvarDocumento({
      topico_id: Number(topico_id),
      nome_exibicao,
      filename,
    });
    res.status(201).json(doc);
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

export async function deletarDocumento(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await removerDocumento(id);
    res.json({ message: "Documento desativado com sucesso." });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(404).json({ error: mensagem });
  }
}