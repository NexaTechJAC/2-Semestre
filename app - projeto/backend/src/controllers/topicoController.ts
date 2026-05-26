import { Request, Response } from "express";
import {
  atualizarTopicoRepo,
  upsertRespostaRepo,
  deletarLogsDoTopico,
  deletarTopicoRepo,
  criarTopicoRepo,
  criarRespostaRepo,
  atualizarSubOpcaoRepo,
  deletarSubOpcaoRepo,
  criarSubOpcaoRepo,
  promoverTopicoParaMenu,
} from "../repositories/chatbotRepository.js";

export async function atualizarTopico(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { chave, resposta } = req.body;

  if (!chave) {
    res.status(400).json({ error: "O campo 'chave' é obrigatório." });
    return;
  }

  try {
    const topico = await atualizarTopicoRepo(id, chave);

    if (resposta !== undefined) {
      await upsertRespostaRepo(id, resposta);
    }

    res.json({ message: "Tópico atualizado com sucesso.", topico });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

export async function deletarTopico(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await deletarLogsDoTopico(id);
    await deletarTopicoRepo(id);
    res.json({ message: "Tópico deletado com sucesso." });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

export async function criarTopico(req: Request, res: Response) {
  const { curso_id, chave, tipo, resposta } = req.body;

  if (!curso_id || !chave || !tipo) {
    res.status(400).json({ error: "curso_id, chave e tipo são obrigatórios." });
    return;
  }

  if (!["simples", "menu", "pdf"].includes(tipo)) {
    res.status(400).json({ error: "tipo deve ser 'simples', 'menu' ou 'pdf'." });
    return;
  }

  try {
    const topico = await criarTopicoRepo({
      curso_id: Number(curso_id),
      chave,
      tipo,
    });

    if (resposta && resposta.trim()) {
      await criarRespostaRepo(topico.id, resposta.trim());
    }

    res.status(201).json({ message: "Tópico criado com sucesso.", topico });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

export async function atualizarSubOpcao(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { titulo, conteudo } = req.body;

  if (!titulo) {
    res.status(400).json({ error: "O campo 'titulo' é obrigatório." });
    return;
  }

  try {
    const sub = await atualizarSubOpcaoRepo(id, titulo, conteudo);
    res.json({ message: "Sub-opção atualizada com sucesso.", sub });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

export async function deletarSubOpcao(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await deletarSubOpcaoRepo(id);
    res.json({ message: "Sub-opção deletada com sucesso." });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(404).json({ error: mensagem });
  }
}

export async function criarSubOpcao(req: Request, res: Response) {
  const { topico_id, titulo, conteudo } = req.body;

  if (!topico_id || !titulo || !conteudo) {
    res.status(400).json({ error: "topico_id, titulo e conteudo são obrigatórios." });
    return;
  }

  try {
    const sub = await criarSubOpcaoRepo(Number(topico_id), titulo, conteudo);
    await promoverTopicoParaMenu(Number(topico_id));
    res.status(201).json({ message: "Sub-opção criada com sucesso.", sub });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}