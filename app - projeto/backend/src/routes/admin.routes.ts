import { Router } from "express";
import {
  getUsuarios,
  cadastrarUsuario,
  removerUsuario,
  getLogs,
} from "../controllers/adminController.js";
import {
  listarDocumentos,
  uploadDocumento,
  deletarDocumento,
  upload,
} from "../controllers/documentoController.js";
import { autenticarToken } from "../middlewares/auth.middleware.js";
import { exigirPerfil } from "../middlewares/rbac.middleware.js";

const router = Router();

// Todas as rotas admin exigem autenticação e perfil administrador
router.use(autenticarToken);
router.use(exigirPerfil("administrador"));

// Usuários
router.get("/usuarios", getUsuarios);
router.post("/usuarios", cadastrarUsuario);
router.delete("/usuarios/:id", removerUsuario);

// Documentos
router.get("/documentos", listarDocumentos);
router.post("/documentos", upload.single("pdf"), uploadDocumento);
router.delete("/documentos/:id", deletarDocumento);

// Logs
router.get("/logs", getLogs);

export default router;