import { Router } from "express";
import authRouter from "./auth.js";
import chatbotRouter from "./chatbot.routes.js";
import perguntaRouter from "./pergunta.routes.js";
import secretariaRouter from "./secretaria.routes.js";
import adminRouter from "./admin.routes.js";

const router = Router();

router.use("/api/auth",       authRouter);       // público: login
router.use("/api/chatbot",    chatbotRouter);    // público: navegação do chat
router.use("/api/perguntas",  perguntaRouter);   // público: envio de dúvidas
router.use("/api/secretaria", secretariaRouter); // protegido: secretaria + admin
router.use("/api/admin",      adminRouter);      // protegido: apenas admin

export default router;