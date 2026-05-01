import { Router } from 'express';
import { 
  upload, 
  uploadDocumento, 
  listarDocumentos, 
  deletarDocumento,
  listarCursosDisponiveis, // Nova importação
  listarCategoriasPorCurso  // Nova importação
} from '../controllers/UploadController.js';
// Se você criar as funções de navegação no controller, importe-as aqui:
// import { listarCursos, listarCategoriasPorCurso } from '../controllers/DocumentoController.js';

const router = Router();

// --- Suas rotas atuais ---
router.post('/admin/upload', upload.single('pdf'), uploadDocumento);
router.get('/documentos', listarDocumentos);
router.delete('/admin/documentos/:id', deletarDocumento);

// --- Novas rotas para a lógica de "Pastas" (Navegação do Chat) ---

// Rota para o Nível 1: Listar cursos disponíveis (ex: DSM, GERAL)
router.get('/documentos', listarDocumentos);
router.get('/navegacao/cursos', listarCursosDisponiveis);
router.get('/navegacao/categorias/:curso', listarCategoriasPorCurso);

// Rota para o Nível 2: Listar categorias dentro de um curso (ex: Horários, Calendários)
router.get('/navegacao/categorias/:curso', async (req, res) => {
  // Filtra as categorias baseadas no curso que o aluno clicou
});

export default router;