import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    return;
  }

  try {
    // Substituir pelo Prisma quando a task #3 estiver pronta
    // const user = await prisma.user.findUnique({ where: { email } });
    const user = null;

    if (!user) {
      res.status(401).json({ error: "Credenciais inválidas." });
      return;
    }

    // const senhaCorreta = await bcrypt.compare(password, user.passwordHash);
    // if (!senhaCorreta) {
    //   res.status(401).json({ error: "Credenciais inválidas." });
    //   return;
    // }

    // const token = jwt.sign(
    //   { id: user.id, role: user.role },
    //   process.env.JWT_SECRET ?? "secret",
    //   { expiresIn: "8h" }
    // );

    // res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch {
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}