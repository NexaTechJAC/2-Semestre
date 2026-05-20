import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const buscarNosRaiz = async (req: Request, res: Response) => {
    try {
        const nos = await prisma.navigation_nodes.findMany({
            where: { parent_id: null, is_active: true },
            orderBy: { display_order: 'asc' },
            select: { id: true, title: true, slug: true, prompt: true },
        });

        return res.json({
            nos: nos.map(no => ({ ...no, id: no.id.toString() })),
        });
    } catch (error) {
        console.error('Erro ao buscar nós raiz:', error);
        return res.status(500).json({ error: 'Erro ao buscar menu.' });
    }
};

export const navegarPorSlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const { session_id } = req.body;

        // Busca o nó pelo slug
        const no = await prisma.navigation_nodes.findUnique({
            where: { slug },
        });

        if (!no) {
            return res.status(404).json({ error: 'Opção não encontrada.' });
        }

        // Atualiza o navigation_flow da sessão
        if (session_id) {
            const log = await prisma.interaction_logs.findFirst({
                where: { session_id },
            });

            if (log) {
                const flowAtual = Array.isArray(log.navigation_flow)
                    ? log.navigation_flow as string[]
                    : [];

                await prisma.interaction_logs.update({
                    where: { id: log.id },
                    data: { navigation_flow: [...flowAtual, slug] },
                });
            }
        }

        // Busca os filhos do nó
        const filhos = await prisma.navigation_nodes.findMany({
            where: { parent_id: no.id, is_active: true },
            orderBy: { display_order: 'asc' },
            select: { id: true, title: true, slug: true, prompt: true },
        });

        // Se tem filhos, retorna submenu
        if (filhos.length > 0) {
            return res.json({
                tipo: 'menu',
                prompt: no.prompt,
                opcoes: filhos.map(f => ({ ...f, id: f.id.toString() })),
            });
        }

        // Se não tem filhos, é folha — retorna a resposta
        return res.json({
            tipo: 'resposta',
            title: no.title,
            answer_summary: no.answer_summary,
            evidence_excerpt: no.evidence_excerpt,
            evidence_source: no.evidence_source,
        });

    } catch (error) {
        console.error('Erro na navegação:', error);
        return res.status(500).json({ error: 'Erro ao navegar.' });
    }
};