export function gerarTxt(perguntas: {
  nome_aluno: string;
  email_aluno: string;
  curso_sigla?: string | null;
  texto: string;
  criado_em: Date;
}[]): string {
  const dataHoje = new Date().toLocaleDateString("pt-BR");
  const linhas: string[] = [];

  linhas.push("========================================");
  linhas.push(`DÚVIDAS RECEBIDAS – ${dataHoje}`);
  linhas.push("========================================");
  linhas.push("");

  perguntas.forEach((p, index) => {
    const horario = p.criado_em.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const curso = p.curso_sigla ?? "Não informado";

    linhas.push(`[${index + 1}] ${horario} – ${p.nome_aluno} (${p.email_aluno})`);
    linhas.push(`Curso: ${curso}`);
    linhas.push(`Dúvida: ${p.texto}`);
    linhas.push("");
  });

  linhas.push("========================================");
  linhas.push(`Total de dúvidas: ${perguntas.length}`);
  linhas.push("========================================");

  return linhas.join("\n");
}