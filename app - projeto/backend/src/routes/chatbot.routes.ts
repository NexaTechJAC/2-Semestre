import { Router } from "express";
import {
  listarCursos,
  listarTopicos,
  buscarResposta,
  avaliarResposta,
} from "../controllers/chatbotController.js";

const router = Router();

// Rotas públicas — sem autenticação
router.get("/cursos", listarCursos);
router.get("/cursos/:sigla/topicos", listarTopicos);
router.get("/cursos/:sigla/topicos/:chave", buscarResposta);
router.post("/avaliar", avaliarResposta);

export default router;