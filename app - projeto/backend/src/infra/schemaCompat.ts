import prisma from "../database/prisma.js";

export async function garantirSchemaUsuarios() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS troca_senha_obrigatoria BOOLEAN NOT NULL DEFAULT FALSE;
  `);
}
