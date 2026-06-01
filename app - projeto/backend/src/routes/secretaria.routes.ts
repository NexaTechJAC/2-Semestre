import { Router } from "express";
import {
  listarPerguntas,
  marcarRespondida,
} from "../controllers/perguntaController.js";
import {
  listarDocumentos,
} from "../controllers/documentoController.js";
import { autenticarToken, exigirSenhaAtualizada } from "../middlewares/auth.middleware.js";
import { exigirPerfil } from "../middlewares/rbac.middleware.js";

const router = Router();

// Todas as rotas da secretaria exigem autenticação e perfil correto
router.use(autenticarToken);
router.use(exigirSenhaAtualizada);
router.use(exigirPerfil("secretaria", "administrador"));

// Perguntas
router.get("/perguntas", listarPerguntas);
router.patch("/perguntas/:id/respondida", marcarRespondida);

// Documentos (somente leitura)
router.get("/documentos", listarDocumentos);

export default router;
