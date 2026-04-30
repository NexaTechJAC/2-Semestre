import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma.js'; // Importamos o cliente do prisma que configuramos

// Configuração dinâmica do local de salvamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pegamos o curso (subpasta) enviado no corpo da requisição
    const pastaCurso = req.body.curso || 'GERAL'; 
    const uploadPath = path.join(process.cwd(), 'src', 'uploads', pastaCurso);

    // Cria a pasta automaticamente caso ela não exista
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Padroniza o nome: ano atual + nome original do arquivo
    const ano = new Date().getFullYear();
    cb(null, `${ano}-${file.originalname}`);
  }
});

export const upload = multer({ storage });

// Transformamos em async para usar o await prisma
export const uploadDocumento = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  
  const pastaCurso = req.body.curso || 'GERAL';
  
  // URL relativa para salvar no banco
  const fileUrl = `/uploads/${pastaCurso}/${req.file.filename}`;
  
  try {
    // Salvando a referência do arquivo no PostgreSQL através do Prisma
    const novoDocumento = await prisma.documentos.create({
      data: {
        titulo: req.body.titulo || req.file.originalname,
        curso: pastaCurso,
        categoria: req.body.categoria || 'Geral',
        url_arquivo: fileUrl,
        ano_referencia: 2026 // Conforme o calendário do seu documento Word
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

// Adicionar no final do UploadController.ts

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