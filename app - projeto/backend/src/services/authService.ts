import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { encontrarPorEmail } from "../repositories/usuarioRepository.js";

export async function autenticar(email: string, password: string) {
  const usuario = await encontrarPorEmail(email);

  if (!usuario || !usuario.ativo) {
    throw new Error("Credenciais inválidas.");
  }

  const senhaCorreta = await bcrypt.compare(password, usuario.senha_hash);

  if (!senhaCorreta) {
    throw new Error("Credenciais inválidas.");
  }

  const token = jwt.sign(
    { id: usuario.id, perfil: usuario.perfil },
    process.env.JWT_SECRET ?? "secret",
    { expiresIn: "8h" }
  );

  return {
    token,
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