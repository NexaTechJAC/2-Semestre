import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração dinâmica do local de salvamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pegamos o curso (subpasta) enviado no corpo da requisição
    // Ex: 'DSM', 'GEO', 'GERAL'. Se não enviar, vai pra raiz de uploads.
    const pastaCurso = req.body.curso || ''; 
    const uploadPath = path.join(process.cwd(), 'src', 'uploads', pastaCurso);

    // Cria a pasta automaticamente caso ela não exista (garante robustez)
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

export const uploadDocumento = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  
  // Pegamos a subpasta para gerar a URL correta
  const pastaCurso = req.body.curso || '';
  
  // URL que o bot usará para o download (mantendo a estrutura de pastas)
  const fileUrl = `http://localhost:3001/uploads/${pastaCurso}/${req.file.filename}`.replace('//', '/');
  
  return res.json({ 
    message: `Arquivo para ${pastaCurso || 'Geral'} enviado com sucesso!`,
    url: fileUrl 
  });
};