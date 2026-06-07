import nodemailer from "nodemailer";

const emailConfigurado =
  !!process.env.EMAIL_HOST &&
  !!process.env.EMAIL_USER &&
  !!process.env.EMAIL_PASS &&
  !!process.env.EMAIL_DESTINO;

if (!emailConfigurado) {
  console.warn(
    "[Mailer] Variáveis de e-mail não configuradas. " +
    "O envio de e-mail estará desativado até que EMAIL_HOST, " +
    "EMAIL_USER, EMAIL_PASS e EMAIL_DESTINO sejam definidos no .env"
  );
}

export const transporter = emailConfigurado
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT ?? 587),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

export const emailDestino = process.env.EMAIL_DESTINO ?? "";
export const mailerAtivo = emailConfigurado;