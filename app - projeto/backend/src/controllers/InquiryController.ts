import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const abrirDuvida = async (req: Request, res: Response) => {
  try {
    const { session_id, requester_name, requester_email, question } = req.body;

    if (!requester_name || !requester_email || !question) {
      return res.status(400).json({ error: 'Nome, e-mail e pergunta são obrigatórios.' });
    }

    const duvida = await prisma.inquiries.create({
      data: { requester_name, requester_email, question },
    });

    // Vincula a dúvida à sessão
    if (session_id) {
      const log = await prisma.interaction_logs.findFirst({
        where: { session_id },
      });

      if (log) {
        const idsAtuais = Array.isArray(log.inquiry_ids)
          ? log.inquiry_ids as number[]
          : [];

        await prisma.interaction_logs.update({
          where: { id: log.id },
          data: { inquiry_ids: [...idsAtuais, Number(duvida.id)] },
        });
      }
    }

    return res.status(201).json({
      message: 'Dúvida registrada com sucesso.',
      inquiry_id: Number(duvida.id),
    });

  } catch (error) {
    console.error('Erro ao abrir dúvida:', error);
    return res.status(500).json({ error: 'Erro ao registrar dúvida.' });
  }
};