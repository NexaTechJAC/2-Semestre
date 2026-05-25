import { Request, Response } from "express";
import prisma from "../database/prisma.js";

// PUT /api/admin/topicos/:id
export async function atualizarTopico(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { chave, resposta } = req.body;

  if (!chave) {
    res.status(400).json({ error: "O campo 'chave' é obrigatório." });
    return;
  }

  try {
    const topico = await prisma.topico.update({
      where: { id },
      data: { chave },
    });

    // Salva em AMBOS os campos para garantir compatibilidade com o chatbot
    if (resposta !== undefined) {
      await prisma.resposta.upsert({
        where: { topico_id: id },
        update: { conteudo: resposta, texto_informativo: resposta },
        create: { topico_id: id, conteudo: resposta, texto_informativo: resposta },
      });
    }

    res.json({ message: "Tópico atualizado com sucesso.", topico });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

// DELETE /api/admin/topicos/:id
export async function deletarTopico(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    // Remove logs vinculados antes (sem CASCADE no Prisma para logs_navegacao)
    await prisma.logNavegacao.deleteMany({ where: { topico_id: id } });
    await prisma.topico.delete({ where: { id } });
    res.json({ message: "Tópico deletado com sucesso." });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

// POST /api/admin/topicos
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
    const topico = await prisma.topico.create({
      data: { curso_id: Number(curso_id), chave, tipo },
    });

    if (resposta && resposta.trim()) {
      await prisma.resposta.create({
        data: {
          topico_id: topico.id,
          conteudo: resposta.trim(),
          texto_informativo: resposta.trim(),
        },
      });
    }

    res.status(201).json({ message: "Tópico criado com sucesso.", topico });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

// PUT /api/admin/sub-opcoes/:id
export async function atualizarSubOpcao(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { titulo, conteudo } = req.body;

  if (!titulo) {
    res.status(400).json({ error: "O campo 'titulo' é obrigatório." });
    return;
  }

  try {
    const sub = await prisma.subOpcao.update({
      where: { id },
      data: { titulo, conteudo },
    });
    res.json({ message: "Sub-opção atualizada com sucesso.", sub });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}

// DELETE /api/admin/sub-opcoes/:id
export async function deletarSubOpcao(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await prisma.subOpcao.delete({ where: { id } });
    res.json({ message: "Sub-opção deletada com sucesso." });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(404).json({ error: mensagem });
  }
}

// POST /api/admin/sub-opcoes
// Quando uma sub-opção é criada, o tópico pai vira tipo 'menu' automaticamente
export async function criarSubOpcao(req: Request, res: Response) {
  const { topico_id, titulo, conteudo } = req.body;

  if (!topico_id || !titulo || !conteudo) {
    res.status(400).json({ error: "topico_id, titulo e conteudo são obrigatórios." });
    return;
  }

  try {
    const sub = await prisma.subOpcao.create({
      data: { topico_id: Number(topico_id), titulo, conteudo },
    });

    // Promove o tópico pai para 'menu' automaticamente
    await prisma.topico.update({
      where: { id: Number(topico_id) },
      data: { tipo: "menu" },
    });

    res.status(201).json({ message: "Sub-opção criada com sucesso.", sub });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    res.status(500).json({ error: mensagem });
  }
}