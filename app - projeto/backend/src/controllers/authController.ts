import { Request, Response } from "express";
import { autenticar, trocarSenhaPrimeiroAcesso } from "../services/authService.js";
import { primeiroAcessoTrocaSenhaBodySchema } from "../schemas/membroAdminSchema.js";

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

export async function trocarSenhaPrimeiroAcessoController(req: Request, res: Response) {
  if (!req.usuario?.id) {
    res.status(401).json({ error: "Nao autenticado." });
    return;
  }

  const parsed = primeiroAcessoTrocaSenhaBodySchema.safeParse(req.body);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      field: issue.path.join(".") || "request",
      message: issue.message,
    }));
    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "dados de entrada invalidos.",
      error: "dados de entrada invalidos.",
      details,
    });
    return;
  }

  const { senha_atual, nova_senha } = parsed.data;

  try {
    await trocarSenhaPrimeiroAcesso(req.usuario.id, senha_atual, nova_senha);
    res.json({ message: "Senha alterada com sucesso." });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";

    if (mensagem === "Senha atual invalida.") {
      res.status(400).json({
        code: "INVALID_CURRENT_PASSWORD",
        message: mensagem,
        error: mensagem,
      });
      return;
    }

    if (mensagem === "Usuario nao encontrado ou inativo.") {
      res.status(404).json({
        code: "USER_NOT_FOUND",
        message: mensagem,
        error: mensagem,
      });
      return;
    }

    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: mensagem,
      error: mensagem,
    });
  }
}
