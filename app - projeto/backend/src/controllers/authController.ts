import { Request, Response } from "express";
import { autenticar } from "../services/authService.js";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    return;
  }

  try {
    const resultado = await autenticar(email, password);
    res.json(resultado);
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(401).json({ error: mensagem });
  }
}