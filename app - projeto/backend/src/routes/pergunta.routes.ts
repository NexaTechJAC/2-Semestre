import { Router } from "express";
import { criarPergunta } from "../controllers/perguntaController.js";

const router = Router();

// Rota pública — aluno envia dúvida sem autenticação
router.post("/", criarPergunta);

export default router;