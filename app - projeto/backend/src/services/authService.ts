import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  encontrarPorEmail,
  buscarUsuarioParaAutenticacao,
  atualizarSenhaUsuario,
} from "../repositories/usuarioRepository.js";

export async function autenticar(email: string, password: string) {
  const usuario = await encontrarPorEmail(email);

  if (!usuario || !usuario.ativo) {
    throw new Error("Credenciais inválidas.");
  }

  const senhaCorreta = await bcrypt.compare(password, usuario.senha_hash);

  if (!senhaCorreta) {
    throw new Error("Credenciais inválidas.");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não configurado no servidor.");
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "8h") as jwt.SignOptions["expiresIn"];

  const token = jwt.sign(
    { id: usuario.id, perfil: usuario.perfil },
    secret,
    { expiresIn }
  );

  return {
    token,
    mustChangePassword: usuario.troca_senha_obrigatoria,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    },
  };
}

export async function criarHashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export async function trocarSenhaPrimeiroAcesso(
  userId: number,
  senhaAtual: string,
  novaSenha: string
) {
  const usuario = await buscarUsuarioParaAutenticacao(userId);

  if (!usuario || !usuario.ativo) {
    throw new Error("Usuario nao encontrado ou inativo.");
  }

  const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha_hash);
  if (!senhaCorreta) {
    throw new Error("Senha atual invalida.");
  }

  const novaSenhaHash = await criarHashSenha(novaSenha);
  await atualizarSenhaUsuario(userId, novaSenhaHash, false);
}
