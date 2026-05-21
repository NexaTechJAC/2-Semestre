import prisma from "../database/prisma.js";

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