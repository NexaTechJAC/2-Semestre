import { Router } from "express";
import {
  login,
  trocarSenhaPrimeiroAcessoController,
} from "../controllers/authController.js";
import { autenticarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.patch("/trocar-senha-primeiro-acesso", autenticarToken, trocarSenhaPrimeiroAcessoController);

export default router;
