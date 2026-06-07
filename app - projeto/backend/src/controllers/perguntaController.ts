import { Request, Response } from "express";
import {
  enviarPergunta,
  getPerguntas,
  responderPergunta,
} from "../services/perguntaService.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function criarPergunta(req: Request, res: Response) {
  const { nome_aluno, email_aluno, curso_sigla, texto } = req.body;

  if (!nome_aluno || !email_aluno || !texto) {
    res.status(400).json({ error: "nome_aluno, email_aluno e texto são obrigatórios." });
    return;
  }

  if (!EMAIL_REGEX.test(email_aluno)) {
    res.status(400).json({ error: "Formato de e-mail inválido." });
    return;
  }

  try {
    const pergunta = await enviarPergunta({ nome_aluno, email_aluno, curso_sigla, texto });
    res.status(201).json({ message: "Dúvida enviada com sucesso.", pergunta });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

export async function listarPerguntas(req: Request, res: Response) {
  const { data } = req.query;

  try {
    const perguntas = await getPerguntas(data as string | undefined);
    res.json(perguntas);
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

export async function marcarRespondida(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!id) {
    res.status(400).json({ error: "ID inválido." });
    return;
  }

  try {
    await responderPergunta(id);
    res.json({ message: "Pergunta marcada como respondida." });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(404).json({ error: mensagem });
  }
}