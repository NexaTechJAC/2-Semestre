import { Request, Response, NextFunction } from "express";

export function exigirPerfil(...perfisPermitidos: ("administrador" | "secretaria")[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = req.usuario;

    if (!usuario) {
      res.status(401).json({ error: "Não autenticado." });
      return;
    }

    if (!perfisPermitidos.includes(usuario.perfil)) {
      res.status(403).json({ error: "Acesso negado. Permissão insuficiente." });
      return;
    }

    next();
  };
}