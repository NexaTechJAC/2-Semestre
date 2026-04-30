import { Router } from 'express';
import { upload, uploadDocumento, listarDocumentos } from '../controllers/UploadController.js';

const router = Router();

router.post('/admin/upload', upload.single('pdf'), uploadDocumento);
router.get('/documentos', listarDocumentos);

export default router;