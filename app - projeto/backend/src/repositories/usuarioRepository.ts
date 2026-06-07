import prisma from "../database/prisma.js";
import { Prisma } from "../generated/prisma/index.js";

type PerfilAcesso = "administrador" | "secretaria";

const selectMembro = {
  id: true,
  nome: true,
  email: true,
  perfil: true,
  ativo: true,
  troca_senha_obrigatoria: true,
  criado_em: true,
} satisfies Prisma.UsuarioSelect;

export async function encontrarPorEmail(email: string) {
  return prisma.usuario.findUnique({
    where: { email },
  });
}

export async function listarUsuarios() {
  return prisma.usuario.findMany({
    where: { ativo: true },
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      criado_em: true,
    },
  });
}

export async function criarUsuario(dados: {
  nome: string;
  email: string;
  senha_hash: string;
  perfil: "administrador" | "secretaria";
}) {
  return prisma.usuario.create({ data: dados });
}

export async function desativarUsuario(id: number) {
  return prisma.usuario.update({
    where: { id },
    data: { ativo: false },
  });
}

function montarFiltroMembrosSecretaria(filtros?: {
  busca?: string;
  ativo?: boolean;
  perfil?: PerfilAcesso;
}) {
  const where: Prisma.UsuarioWhereInput = {
    perfil: filtros?.perfil ?? {
      in: ["secretaria", "administrador"],
    },
  };

  if (typeof filtros?.ativo === "boolean") {
    where.ativo = filtros.ativo;
  }

  const busca = filtros?.busca?.trim();
  if (busca) {
    where.OR = [
      { nome: { contains: busca, mode: "insensitive" } },
      { email: { contains: busca, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listarMembrosSecretaria(filtros?: {
  busca?: string;
  ativo?: boolean;
  perfil?: PerfilAcesso;
  page?: number;
  limit?: number;
}) {
  const where = montarFiltroMembrosSecretaria(filtros);
  const page = filtros?.page ?? 1;
  const limit = filtros?.limit ?? 10;
  const skip = (page - 1) * limit;

  return prisma.usuario.findMany({
    where,
    skip,
    take: limit,
    orderBy: { criado_em: "desc" },
    select: selectMembro,
  });
}

export async function contarMembrosSecretaria(filtros?: {
  busca?: string;
  ativo?: boolean;
  perfil?: PerfilAcesso;
}) {
  const where = montarFiltroMembrosSecretaria(filtros);
  return prisma.usuario.count({ where });
}

export async function buscarMembroSecretariaPorId(id: number) {
  return prisma.usuario.findFirst({
    where: { id, perfil: { in: ["secretaria", "administrador"] } },
    select: selectMembro,
  });
}

export async function criarMembroSecretaria(dados: {
  nome: string;
  email: string;
  senha_hash: string;
  perfil: PerfilAcesso;
}) {
  return prisma.usuario.create({
    data: {
      ...dados,
      ativo: true,
      troca_senha_obrigatoria: true,
    },
    select: selectMembro,
  });
}

export async function atualizarMembroSecretaria(
  id: number,
  dados: { nome: string; email: string; perfil: PerfilAcesso }
) {
  return prisma.usuario.update({
    where: { id },
    data: dados,
    select: selectMembro,
  });
}

export async function alterarStatusMembroSecretaria(id: number, ativo: boolean) {
  return prisma.usuario.update({
    where: { id },
    data: { ativo },
    select: selectMembro,
  });
}

export async function contarAdministradoresAtivos() {
  return prisma.usuario.count({
    where: {
      perfil: "administrador",
      ativo: true,
    },
  });
}

export async function buscarUsuarioParaAutenticacao(id: number) {
  return prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      perfil: true,
      ativo: true,
      senha_hash: true,
      troca_senha_obrigatoria: true,
    },
  });
}

export async function atualizarSenhaUsuario(id: number, senha_hash: string, trocaObrigatoria: boolean) {
  return prisma.usuario.update({
    where: { id },
    data: {
      senha_hash,
      troca_senha_obrigatoria: trocaObrigatoria,
    },
  });
}

export async function definirTrocaSenhaObrigatoria(id: number, trocaObrigatoria: boolean) {
  return prisma.usuario.update({
    where: { id },
    data: {
      troca_senha_obrigatoria: trocaObrigatoria,
    },
  });
}
