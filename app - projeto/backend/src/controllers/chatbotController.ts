import { Request, Response } from "express";
import {
  getCursos,
  getTopicosPorCurso,
  getResposta,
  registrarSatisfacao,
} from "../services/chatbotService.js";

export async function listarCursos(req: Request, res: Response) {
  try {
    const cursos = await getCursos();
    res.json(cursos);
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

export async function listarTopicos(req: Request, res: Response) {
  const { sigla } = req.params;

  try {
    const topicos = await getTopicosPorCurso(sigla);
    res.json(topicos);
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(404).json({ error: mensagem });
  }
}

export async function buscarResposta(req: Request, res: Response) {
  const { sigla, chave } = req.params;

  try {
    const resposta = await getResposta(sigla, chave);
    res.json(resposta);
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(404).json({ error: mensagem });
  }
}

export async function avaliarResposta(req: Request, res: Response) {
  const { topico_id, curso_id, satisfacao } = req.body;

  if (!topico_id || !curso_id || !satisfacao) {
    res.status(400).json({ error: "topico_id, curso_id e satisfacao são obrigatórios." });
    return;
  }

  if (!["gostei", "nao_gostei"].includes(satisfacao)) {
    res.status(400).json({ error: "satisfacao deve ser 'gostei' ou 'nao_gostei'." });
    return;
  }

  try {
    await registrarSatisfacao(topico_id, curso_id, satisfacao);
    res.json({ message: "Avaliação registrada." });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}