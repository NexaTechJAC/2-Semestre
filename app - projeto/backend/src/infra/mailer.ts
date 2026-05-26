import nodemailer from "nodemailer";

if (!process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    !process.env.EMAIL_DESTINO) {
  throw new Error(
    "Variáveis de ambiente de e-mail não configuradas. " +
    "Verifique EMAIL_HOST, EMAIL_USER, EMAIL_PASS e EMAIL_DESTINO no .env"
  );
}

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT ?? 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const emailDestino = process.env.EMAIL_DESTINO;