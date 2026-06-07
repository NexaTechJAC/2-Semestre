import { Router } from "express";
import {
  listarPerguntas,
  marcarRespondida,
} from "../controllers/perguntaController.js";
import {
  listarDocumentos,
} from "../controllers/documentoController.js";
import { getLogs } from "../controllers/adminController.js";
import { autenticarToken } from "../middlewares/auth.middleware.js";
import { exigirPerfil } from "../middlewares/rbac.middleware.js";

const router = Router();

router.use(autenticarToken);
router.use(exigirPerfil("secretaria", "administrador"));

// Perguntas
router.get("/perguntas", listarPerguntas);
router.patch("/perguntas/:id/respondida", marcarRespondida);

// Documentos (somente leitura)
router.get("/documentos", listarDocumentos);

// Logs (para o dashboard da secretaria)
router.get("/logs", getLogs);

export default router;