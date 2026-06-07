import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { buscarUsuarioParaAutenticacao } from "../repositories/usuarioRepository.js";

export interface TokenPayload {
  id: number;
  perfil: "administrador" | "secretaria";
}

declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

export function autenticarToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token nao fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ error: "Erro de configuracao do servidor." });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token invalido ou expirado." });
  }
}

export async function exigirSenhaAtualizada(req: Request, res: Response, next: NextFunction) {
  if (!req.usuario?.id) {
    res.status(401).json({
      code: "NOT_AUTHENTICATED",
      message: "Nao autenticado.",
      error: "Nao autenticado.",
    });
    return;
  }

  try {
    const usuario = await buscarUsuarioParaAutenticacao(req.usuario.id);

    if (!usuario || !usuario.ativo) {
      res.status(401).json({
        code: "USER_NOT_FOUND",
        message: "Usuario nao encontrado ou inativo.",
        error: "Usuario nao encontrado ou inativo.",
      });
      return;
    }

    if (usuario.troca_senha_obrigatoria) {
      res.status(403).json({
        code: "PASSWORD_CHANGE_REQUIRED",
        message: "Troca de senha obrigatoria antes de acessar esta rota.",
        error: "Troca de senha obrigatoria antes de acessar esta rota.",
      });
      return;
    }

    next();
  } catch {
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Erro interno.",
      error: "Erro interno.",
    });
  }
}
