import { Router } from 'express';
import { upload, uploadDocumento } from '../controllers/UploadController.js';

const router = Router();

// Rota para a secretaria fazer o upload (POST)
router.post('/admin/upload', upload.single('pdf'), uploadDocumento);

export default router;