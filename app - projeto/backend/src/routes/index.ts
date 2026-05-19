import { Router } from 'express';
import { 
  upload, 
  uploadDocumento, 
  listarDocumentos, 
  deletarDocumento,
  listarCursosDisponiveis,
  listarCategoriasPorCurso
} from '../controllers/UploadController.js';
import authRouter from './auth.js';

const router = Router();

// --- Autenticação ---
router.use('/api/auth', authRouter);

// --- Documentos ---
router.post('/admin/upload', upload.single('pdf'), uploadDocumento);
router.get('/documentos', listarDocumentos);
router.delete('/admin/documentos/:id', deletarDocumento);

// --- Navegação do Chat ---
router.get('/navegacao/cursos', listarCursosDisponiveis);
router.get('/navegacao/categorias/:curso', listarCategoriasPorCurso);

export default router;