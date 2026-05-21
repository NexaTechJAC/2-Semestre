import { gerarTxt } from "../utils/gerarTxt.js";

// Instância do mailer configurada em infra/
import { transporter, emailDestino } from "../infra/mailer.js";

export async function enviarEmailDiario(perguntas: {
  nome_aluno: string;
  email_aluno: string;
  curso_sigla?: string | null;
  texto: string;
  criado_em: Date;
}[]) {
  const conteudoTxt = gerarTxt(perguntas);
  const dataHoje = new Date().toLocaleDateString("pt-BR");

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "chatbot@fatec.sp.gov.br",
    to: emailDestino,
    subject: `Dúvidas do Chatbot – ${dataHoje}`,
    text: `Segue em anexo a lista de dúvidas recebidas hoje (${dataHoje}).`,
    attachments: [
      {
        filename: `duvidas_${dataHoje.replace(/\//g, "-")}.txt`,
        content: conteudoTxt,
        encoding: "utf-8",
      },
    ],
  });
}