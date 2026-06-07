import "./database/prisma.js";
import app from "./app.js";
import dotenv from "dotenv";
import { garantirSchemaUsuarios } from "./infra/schemaCompat.js";

dotenv.config();

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  await garantirSchemaUsuarios();

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

bootstrap().catch((erro) => {
  console.error("Falha ao iniciar servidor:", erro);
  process.exit(1);
});
