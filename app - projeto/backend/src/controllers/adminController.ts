import { Request, Response } from "express";
import {
  listarUsuarios,
  criarUsuario,
  desativarUsuario,
  listarMembrosSecretaria,
  contarMembrosSecretaria,
  buscarMembroSecretariaPorId,
  criarMembroSecretaria,
  atualizarMembroSecretaria,
  alterarStatusMembroSecretaria,
  contarAdministradoresAtivos,
  atualizarSenhaUsuario,
} from "../repositories/usuarioRepository.js";
import { criarHashSenha } from "../services/authService.js";
import { listarLogs } from "../repositories/logRepository.js";
import { Prisma } from "../generated/prisma/index.js";
import { ZodError } from "zod";
import {
  membroQuerySchema,
  membroCreateBodySchema,
  membroUpdateBodySchema,
  membroStatusBodySchema,
  membroIdParamsSchema,
  membroResetSenhaBodySchema,
} from "../schemas/membroAdminSchema.js";

type PerfilAcesso = "administrador" | "secretaria";

function emailValido(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function parseAtivo(valor: unknown): boolean | undefined {
  if (valor === undefined) return undefined;
  if (valor === "true") return true;
  if (valor === "false") return false;
  return undefined;
}

function parseInteiroPositivo(valor: unknown, fallback: number) {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) return fallback;
  return n;
}

function isPerfilAcesso(valor: unknown): valor is PerfilAcesso {
  return valor === "administrador" || valor === "secretaria";
}

function tratarErroEmailDuplicado(err: unknown, res: Response) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    res.status(409).json({
      code: "EMAIL_ALREADY_EXISTS",
      message: "email ja cadastrado.",
      error: "email ja cadastrado.",
    });
    return true;
  }
  return false;
}

function respostaErro(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: Array<{ field: string; message: string }>
) {
  res.status(status).json({
    code,
    message,
    error: message,
    ...(details ? { details } : {}),
  });
}

function respostaErroValidacao(res: Response, error: ZodError) {
  const details = error.issues.map((issue) => ({
    field: issue.path.join(".") || "request",
    message: issue.message,
  }));

  respostaErro(res, 400, "VALIDATION_ERROR", "dados de entrada invalidos.", details);
}

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

export async function getMembrosSecretaria(req: Request, res: Response) {
  const parsedQuery = membroQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    respostaErroValidacao(res, parsedQuery.error);
    return;
  }

  const { search, ativo, page, limit, perfil } = parsedQuery.data;
  const perfilFiltro: PerfilAcesso | undefined = perfil;

  try {
    const [data, total] = await Promise.all([
      listarMembrosSecretaria({ busca: search, ativo, perfil: perfilFiltro, page, limit }),
      contarMembrosSecretaria({ busca: search, ativo, perfil: perfilFiltro }),
    ]);

    res.json({
      data,
      total,
      meta: {
        page,
        limit,
        total,
        total_pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    respostaErro(res, 500, "INTERNAL_ERROR", mensagem);
  }
}

export async function cadastrarMembroSecretaria(req: Request, res: Response) {
  const parsedBody = membroCreateBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    respostaErroValidacao(res, parsedBody.error);
    return;
  }

  const { nome, email, senha, perfil } = parsedBody.data;

  try {
    const senha_hash = await criarHashSenha(senha);
    const membro = await criarMembroSecretaria({ nome, email, senha_hash, perfil });
    res.status(201).json(membro);
  } catch (err: unknown) {
    if (tratarErroEmailDuplicado(err, res)) return;

    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    respostaErro(res, 500, "INTERNAL_ERROR", mensagem);
  }
}

export async function editarMembroSecretaria(req: Request, res: Response) {
  const parsedParams = membroIdParamsSchema.safeParse(req.params);
  const parsedBody = membroUpdateBodySchema.safeParse(req.body);

  if (!parsedParams.success) {
    respostaErroValidacao(res, parsedParams.error);
    return;
  }

  if (!parsedBody.success) {
    respostaErroValidacao(res, parsedBody.error);
    return;
  }

  const { id } = parsedParams.data;
  const { nome, email, perfil } = parsedBody.data;

  try {
    const membroExiste = await buscarMembroSecretariaPorId(id);

    if (!membroExiste) {
      respostaErro(res, 404, "MEMBER_NOT_FOUND", "membro da secretaria nao encontrado.");
      return;
    }

    const perfilBase = isPerfilAcesso(membroExiste.perfil) ? membroExiste.perfil : "secretaria";
    const perfilFinal: PerfilAcesso = perfil ?? perfilBase;

    if (req.usuario?.id === id && perfilFinal !== "administrador") {
      respostaErro(res, 400, "SELF_ROLE_DOWNGRADE_FORBIDDEN", "voce nao pode remover seu proprio perfil de administrador.");
      return;
    }

    if (membroExiste.perfil === "administrador" && perfilFinal !== "administrador" && membroExiste.ativo) {
      const totalAdminsAtivos = await contarAdministradoresAtivos();

      if (totalAdminsAtivos <= 1) {
        respostaErro(res, 400, "LAST_ADMIN_PROTECTED", "nao e permitido remover o ultimo administrador ativo.");
        return;
      }
    }

    const membro = await atualizarMembroSecretaria(id, { nome, email, perfil: perfilFinal });
    res.json(membro);
  } catch (err: unknown) {
    if (tratarErroEmailDuplicado(err, res)) return;

    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    respostaErro(res, 500, "INTERNAL_ERROR", mensagem);
  }
}

export async function removerMembroSecretaria(req: Request, res: Response) {
  const parsedParams = membroIdParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    respostaErroValidacao(res, parsedParams.error);
    return;
  }
  const { id } = parsedParams.data;

  try {
    const membroExiste = await buscarMembroSecretariaPorId(id);

    if (!membroExiste) {
      respostaErro(res, 404, "MEMBER_NOT_FOUND", "membro da secretaria nao encontrado.");
      return;
    }

    if (req.usuario?.id === id) {
      respostaErro(res, 400, "SELF_DEACTIVATION_FORBIDDEN", "voce nao pode desativar seu proprio usuario.");
      return;
    }

    if (membroExiste.perfil === "administrador" && membroExiste.ativo) {
      const totalAdminsAtivos = await contarAdministradoresAtivos();
      if (totalAdminsAtivos <= 1) {
        respostaErro(res, 400, "LAST_ADMIN_PROTECTED", "nao e permitido desativar o ultimo administrador ativo.");
        return;
      }
    }

    await alterarStatusMembroSecretaria(id, false);
    res.json({ message: "Membro da secretaria desativado com sucesso." });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    respostaErro(res, 500, "INTERNAL_ERROR", mensagem);
  }
}

export async function atualizarStatusMembroSecretaria(req: Request, res: Response) {
  const parsedParams = membroIdParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    respostaErroValidacao(res, parsedParams.error);
    return;
  }

  const parsedBody = membroStatusBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    respostaErroValidacao(res, parsedBody.error);
    return;
  }

  const { id } = parsedParams.data;
  const { ativo } = parsedBody.data;

  try {
    const membroExiste = await buscarMembroSecretariaPorId(id);

    if (!membroExiste) {
      respostaErro(res, 404, "MEMBER_NOT_FOUND", "membro da secretaria nao encontrado.");
      return;
    }

    if (req.usuario?.id === id && ativo === false) {
      respostaErro(res, 400, "SELF_DEACTIVATION_FORBIDDEN", "voce nao pode desativar seu proprio usuario.");
      return;
    }

    if (membroExiste.perfil === "administrador" && membroExiste.ativo && ativo === false) {
      const totalAdminsAtivos = await contarAdministradoresAtivos();

      if (totalAdminsAtivos <= 1) {
        respostaErro(res, 400, "LAST_ADMIN_PROTECTED", "nao e permitido desativar o ultimo administrador ativo.");
        return;
      }
    }

    const membro = await alterarStatusMembroSecretaria(id, ativo);
    res.json(membro);
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    respostaErro(res, 500, "INTERNAL_ERROR", mensagem);
  }
}

export async function resetarSenhaMembroSecretaria(req: Request, res: Response) {
  const parsedParams = membroIdParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    respostaErroValidacao(res, parsedParams.error);
    return;
  }

  const parsedBody = membroResetSenhaBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    respostaErroValidacao(res, parsedBody.error);
    return;
  }

  const { id } = parsedParams.data;
  const { nova_senha } = parsedBody.data;

  try {
    const membroExiste = await buscarMembroSecretariaPorId(id);
    if (!membroExiste) {
      respostaErro(res, 404, "MEMBER_NOT_FOUND", "membro da secretaria nao encontrado.");
      return;
    }

    const senha_hash = await criarHashSenha(nova_senha);
    await atualizarSenhaUsuario(id, senha_hash, true);

    res.json({ message: "Senha redefinida com sucesso. Usuario deve trocar a senha no proximo login." });
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : "Erro interno.";
    respostaErro(res, 500, "INTERNAL_ERROR", mensagem);
  }
}
