import { Router } from 'express';
import { upload, uploadDocumento, listarDocumentos, deletarDocumento, listarCursosDisponiveis, listarCategoriasPorCurso } from '../controllers/UploadController.js';
import { criarSessao } from '../controllers/SessionController.js';
import { buscarNosRaiz, navegarPorSlug } from '../controllers/NavigationController.js';
import { abrirDuvida } from '../controllers/InquiryController.js';

const router = Router();

// Uploads
router.post('/admin/upload', upload.single('pdf'), uploadDocumento);
router.get('/documentos', listarDocumentos);
router.delete('/admin/documentos/:id', deletarDocumento);
router.get('/navegacao/cursos', listarCursosDisponiveis);
router.get('/navegacao/categorias/:curso', listarCategoriasPorCurso);

// Chatbot
router.post('/sessao', criarSessao);
router.get('/nodes', buscarNosRaiz);
router.post('/nodes/:slug', navegarPorSlug);
router.post('/duvidas', abrirDuvida);

export default router;