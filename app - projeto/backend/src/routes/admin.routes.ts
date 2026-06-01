import { Router } from "express";
import {
  getUsuarios,
  cadastrarUsuario,
  removerUsuario,
  getLogs,
  getMembrosSecretaria,
  cadastrarMembroSecretaria,
  editarMembroSecretaria,
  removerMembroSecretaria,
  atualizarStatusMembroSecretaria,
  resetarSenhaMembroSecretaria,
} from "../controllers/adminController.js";
import {
  listarDocumentos,
  uploadDocumento,
  deletarDocumento,
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
import { autenticarToken, exigirSenhaAtualizada } from "../middlewares/auth.middleware.js";
import { exigirPerfil } from "../middlewares/rbac.middleware.js";

const router = Router();

router.use(autenticarToken);
router.use(exigirSenhaAtualizada);
router.use(exigirPerfil("administrador"));

// Usuários
router.get("/usuarios", getUsuarios);
router.post("/usuarios", cadastrarUsuario);
router.delete("/usuarios/:id", removerUsuario);
router.get("/secretaria/membros", getMembrosSecretaria);
router.post("/secretaria/membros", cadastrarMembroSecretaria);
router.put("/secretaria/membros/:id", editarMembroSecretaria);
router.patch("/secretaria/membros/:id/status", atualizarStatusMembroSecretaria);
router.patch("/secretaria/membros/:id/senha", resetarSenhaMembroSecretaria);
router.delete("/secretaria/membros/:id", removerMembroSecretaria);

// Documentos
router.get("/documentos", listarDocumentos);
router.post("/documentos", upload.single("pdf"), uploadDocumento);
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
