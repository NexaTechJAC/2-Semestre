import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const criarSessao = async (req: Request, res: Response) => {
  try {
    const log = await prisma.interaction_logs.create({
      data: {
        navigation_flow: [],
        inquiry_ids: [],
      },
    });

    return res.status(201).json({ session_id: log.session_id });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    return res.status(500).json({ error: 'Erro ao iniciar sessão.' });
  }
};