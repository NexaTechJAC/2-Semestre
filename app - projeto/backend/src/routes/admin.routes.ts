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
  downloadDocumento,
  upload,
} from "../controllers/documentoController.js";
import {
  criarTopico,
  atualizarTopico,
  deletarTopico,
  criarSubOpcao,
  atualizarSubOpcao,
  deletarSubOpcao,
} from "../controllers/topicoController.js";
import { autenticarToken } from "../middlewares/auth.middleware.js";
import { exigirPerfil } from "../middlewares/rbac.middleware.js";

const router = Router();

router.use(autenticarToken);
router.use(exigirPerfil("administrador"));

// Usuários
router.get("/usuarios", getUsuarios);
router.post("/usuarios", cadastrarUsuario);
router.delete("/usuarios/:id", removerUsuario);

// Documentos
router.get("/documentos", listarDocumentos);
router.post("/documentos", upload.single("pdf"), uploadDocumento);
router.get("/documentos/:id/download", downloadDocumento);
router.delete("/documentos/:id", deletarDocumento);

// Logs
router.get("/logs", getLogs);

// Tópicos
router.post("/topicos", criarTopico);
router.put("/topicos/:id", atualizarTopico);
router.delete("/topicos/:id", deletarTopico);

// Sub-opções
router.post("/sub-opcoes", criarSubOpcao);
router.put("/sub-opcoes/:id", atualizarSubOpcao);
router.delete("/sub-opcoes/:id", deletarSubOpcao);

export default router;