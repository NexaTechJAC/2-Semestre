import { Request, Response } from "express";
import {
  listarUsuarios,
  criarUsuario,
  desativarUsuario,
} from "../repositories/usuarioRepository.js";
import { criarHashSenha } from "../services/authService.js";
import { listarLogs } from "../repositories/logRepository.js";

export async function getUsuarios(req: Request, res: Response) {
  try {
    const usuarios = await listarUsuarios();
    res.json(usuarios);
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

export async function cadastrarUsuario(req: Request, res: Response) {
  const { nome, email, senha, perfil } = req.body;

  if (!nome || !email || !senha || !perfil) {
    res.status(400).json({ error: "nome, email, senha e perfil são obrigatórios." });
    return;
  }

  if (!["administrador", "secretaria"].includes(perfil)) {
    res.status(400).json({ error: "perfil deve ser 'administrador' ou 'secretaria'." });
    return;
  }

  try {
    const senha_hash = await criarHashSenha(senha);
    const usuario = await criarUsuario({ nome, email, senha_hash, perfil });
    res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

export async function removerUsuario(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await desativarUsuario(id);
    res.json({ message: "Usuário desativado com sucesso." });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(404).json({ error: mensagem });
  }
}

export async function getLogs(req: Request, res: Response) {
  try {
    const logs = await listarLogs();
    res.json(logs);
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}