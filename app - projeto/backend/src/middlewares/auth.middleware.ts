import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
    res.status(401).json({ error: "Token não fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Erro de configuração do servidor." });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
}