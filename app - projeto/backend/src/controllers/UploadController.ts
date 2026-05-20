import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma.js';

// Configuração do Multer para receber o arquivo em memória
const storage = multer.memoryStorage();
export const upload = multer({ storage });

/**
 * Gerencia a navegação inteligente do Chatbot.
 * Prioriza mensagens fixas e depois busca arquivos no curso específico ou em GERAL.
 */

export const uploadDocumento = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const pastaCurso = req.body.curso || 'GERAL';
  const uploadPath = path.join(process.cwd(), 'src', 'uploads', pastaCurso);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const ano = new Date().getFullYear();
  const nomeArquivo = `${ano}-${req.file.originalname}`;
  const caminhoCompleto = path.join(uploadPath, nomeArquivo);

  fs.writeFileSync(caminhoCompleto, req.file.buffer);

  const fileUrl = `/uploads/${pastaCurso}/${nomeArquivo}`;

  try {
    const novoDocumento = await prisma.documentos.create({
      data: {
        titulo: req.body.titulo || req.file.originalname,
        curso: pastaCurso,
        categoria: req.body.categoria || 'Geral',
        url_arquivo: fileUrl,
        ano_referencia: 2026
      }
    });

    return res.json({
      message: `Arquivo para ${pastaCurso} enviado e registrado no banco!`,
      documento: novoDocumento
    });

  } catch (error) {
    console.error("Erro ao salvar no banco:", error);
    return res.status(500).json({ error: 'Erro ao registrar documento no banco de dados.' });
  }
};

export const listarDocumentos = async (req: Request, res: Response) => {
  try {
    const { curso, categoria } = req.query;

    const documentos = await prisma.documentos.findMany({
      where: {
        ...(curso ? { curso: String(curso) } : {}),
        ...(categoria ? { categoria: String(categoria) } : {}),
      },
      orderBy: { updated_at: 'desc' },
    });

    return res.json({ documentos });

  } catch (error) {
    console.error("Erro ao listar documentos:", error);
    return res.status(500).json({ error: 'Erro ao buscar documentos.' });
  }
};

export const deletarDocumento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const documento = await prisma.documentos.findUnique({
      where: { id: Number(id) }
    });

    if (!documento) {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    const caminhoArquivo = path.join(process.cwd(), 'src', documento.url_arquivo);
    if (fs.existsSync(caminhoArquivo)) {
      fs.unlinkSync(caminhoArquivo);
    }

    await prisma.documentos.delete({
      where: { id: Number(id) }
    });

    return res.json({ message: `Documento ${id} deletado com sucesso.` });

  } catch (error) {
    console.error("Erro ao deletar documento:", error);
    return res.status(500).json({ error: 'Erro ao deletar documento.' });
  }
};

export const listarCursosDisponiveis = async (req: Request, res: Response) => {
  try {
    const cursos = await prisma.documentos.findMany({
      distinct: ['curso'],
      select: { curso: true },
    });
    return res.json({ cursos: cursos.map(c => c.curso) });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar cursos.' });
  }
};

export const listarCategoriasPorCurso = async (req: Request, res: Response) => {
  try {
    const { curso } = req.params;
    const categorias = await prisma.documentos.findMany({
      where: { curso: String(curso) },
      distinct: ['categoria'],
      select: { categoria: true },
    });
    return res.json({ categorias: categorias.map(c => c.categoria) });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar categorias.' });
  }
};