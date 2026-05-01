// importa o tipo Menu para garantir que os dados seguem o formato correto
import type { Menu } from '../types/index'

// // calendário acadêmico reutilizado em todos os cursos (1º semestre de 2026)
const calendarioAcademico = `Inscrições para vagas remanescentes e transferências: 12 a 18/01/2026
Rematrícula de alunos veteranos: 12 a 18/01/2026
Início das aulas: 09/02/2026
Prazo para aproveitamento de estudos (Art. 76 – via SIGA): 19/02/2026
Prazo para reconhecimento de competências (Art. 80, §1º): 19/02/2026
Ajustes de matrícula (veteranos – Art. 26, §4º): 19/02/2026
Exame de nivelamento com ajuste de horário (Art. 87, §1º): 21/02/2026
Ajustes de matrícula (ingressantes – Art. 25, §2º): 23/02/2026
Exame de nivelamento sem ajuste de horário: 27/02/2026
Cancelamento por ausência de rematrícula (Art. 28): 02/03/2026
Prazo final para desistência de disciplina (Art. 30): 25/03/2026
Prazo final para trancamento (exceto ingressantes – Art. 31, §3º): 13/05/2026
Término das aulas: 27/06/2026
Período de exames finais (Art. 34): 06 a 08/07/2026`

// opcões de dispensa comuns a todos os cursos
// reutiliza com IDs diferentes para cada curso
const dispensaComum: Menu[] = [
  {
    id: 9901,
    texto: 'Aproveitamento de estudos (outra instituição)',
    resposta: `A solicitação deve ser realizada pelo SIGA, anexando: histórico escolar e ementas das disciplinas cursadas.\n\nRequisitos:\n• Disciplinas cursadas nos últimos 10 anos\n• Similaridade ≥ 70% → aprovação direta\n• Similaridade entre 50% e 70% → exame de proficiência\n• Similaridade < 50% → indeferimento\n\nReferência: Regulamento Geral dos Cursos Superiores das Fatecs – Seção I, p. 25`
  },
  {
    id: 9902,
    texto: 'Reconhecimento de competências (Etec)',
    resposta: `É possível solicitar reconhecimento de competências adquiridas em cursos técnicos da Etec, desde que estejam previamente mapeadas no sistema acadêmico.\n\nReferência: Regulamento Geral dos Cursos Superiores das Fatecs – Seção II, p. 27`
  },
  {
    id: 9903,
    texto: 'Aproveitamento de conhecimentos e experiências anteriores',
    resposta: `Para solicitar, é necessário:\n• Diploma(s) ou certificado(s)\n• Realizar exame de proficiência\n\nComprovantes aceitos:\n• Declaração da empresa (experiência profissional)\n• Certificados de cursos cuja soma de carga horária seja equivalente à disciplina\n• Cursos realizados em empresas ou plataformas digitais (ex.: Coursera, Udemy)\n• Cursos de inglês para habilitação às provas de Inglês II, III e IV\n\nA solicitação deve ser formalizada por e-mail à Secretaria Acadêmica, informando o nome da disciplina e anexando os documentos.\n\nReferência: Regulamento Geral dos Cursos Superiores das Fatecs – Seção III, p. 27`
  },
  {
    id: 9904,
    texto: 'Proficiência em Inglês',
    resposta: `No início do 3º semestre é aplicada a prova de proficiência em Inglês para todos os alunos.\n\n• Plataforma: NEPLE\n• Uso obrigatório de fones de ouvido\n• Aplicação exclusiva no início do 3º semestre\n\nNão é possível realizar a prova em outro período do curso.`
  }
]

// lista principal de menus do chatbot
// cada item representa um curso ou opção inicial
export const menus: Menu[] = [
  {
    id: 1,
    texto: 'Desenvolvimento de Software Multiplataforma',
    filhos: [
      {
        id: 11,
        texto: 'Atividades Complementares (AACC)',
        resposta: 'O curso de Desenvolvimento de Software Multiplataforma não possui Atividades Acadêmico Científico-Culturais (AACC) previstas em sua matriz curricular.'
      },
      {
        id: 12,
        texto: 'Datas importantes do semestre',
        resposta: calendarioAcademico
      },
      {
        id: 13,
        texto: 'Disciplinas com atividades de extensão',
        resposta: `No curso de DSM, as atividades de extensão estão vinculadas ao ABP e às seguintes disciplinas:\n\n2º semestre: Engenharia de Software II, Desenvolvimento Web II, Banco de Dados Relacional, Técnicas de Programação I\n\n3º semestre: Gestão Ágil de Projetos, Desenvolvimento Web III, Técnicas de Programação II, Interação Humano-Computador\n\n4º semestre: Laboratório de Desenvolvimento Web, Integração e Entrega Contínua, Internet das Coisas e Aplicações\n\n5º semestre: Laboratório de Desenvolvimento para Dispositivos Móveis, Computação em Nuvem I, Aprendizagem de Máquina\n\n6º semestre: Laboratório de Desenvolvimento Multiplataforma, Processamento de Linguagem Natural, Computação em Nuvem II`
      },
      {
        id: 14,
        texto: 'Disciplinas remotas',
        resposta: `5º semestre:\n• Inglês III\n• Fundamentos da Redação Técnica\n\n6º semestre:\n• Todas as disciplinas são remotas`
      },
      {
        id: 15,
        texto: 'Dispensa de disciplinas',
        aviso: 'Atenção: Não é permitido solicitar aproveitamento em disciplinas que possuam atividades de extensão curricular.',
        filhos: dispensaComum.map(d => ({ ...d, id: 150 + d.id % 100 }))
      },
      {
        id: 16,
        texto: 'Estágio',
        filhos: [
          { id: 161, texto: 'Duração do estágio', resposta: 'Carga horária obrigatória: 240 horas\nPode iniciar: a partir do 1º semestre' },
          { id: 162, texto: 'Início do estágio', resposta: 'O estágio deve ser intermediado por empresa ou agente de integração conveniado ao Centro Paula Souza.\n\nApós conseguir a vaga, entre em contato com a Secretaria Administrativa: f258adm@cps.sp.gov.br' },
          { id: 163, texto: 'Comprovação', resposta: 'Após concluir as 240 horas, o aluno deve elaborar o Relatório Final de Estágio, assinado pelo supervisor e encaminhado ao Professor Orientador.\n\nModelo: Anexos F e G do Manual de Estágio.' },
          { id: 164, texto: 'Equiparação de estágio', resposta: 'Pode ser comprovado por:\n• Iniciação Científica\n• Monitoria\n• Atividade profissional na área\n\nConsultar anexos correspondentes no Manual de Estágio.' }
        ]
      },
      { id: 17, texto: 'Horário das aulas', resposta: 'Selecione o semestre desejado (1º ao 6º) para visualizar o horário correspondente.' },
      { id: 18, texto: 'Portfólio / TG', resposta: 'O curso de DSM não possui Trabalho de Graduação (TG). O TG é substituído pela construção do Portfólio Digital.\n\nOs projetos do 4º, 5º e 6º semestres compõem o portfólio.\nO portfólio deve ser hospedado em repositório privado.\n\nPara orientações, contate: marcelo.sudo@fatec.sp.gov.br' }
    ]
  },
  {
    id: 2,
    texto: 'Geoprocessamento',
    filhos: [
      { id: 21, texto: 'Atividades Complementares (AACC)', resposta: 'É necessário cumprir 60 horas de Atividades Acadêmico Científico Culturais (AACC).\n\nO aluno poderá utilizar cursos extracurriculares, cursos de inglês, leitura de livros, participação em feiras como a FEITEC, visitas a museus e exposições, teatro e cinema, trabalho voluntário, visitas técnicas etc.' },
      { id: 22, texto: 'Datas importantes do semestre', resposta: calendarioAcademico },
      { id: 23, texto: 'Disciplinas remotas', resposta: 'O curso de Geoprocessamento não possui disciplinas remotas.' },
      {
        id: 24,
        texto: 'Dispensa de disciplinas',
        aviso: 'Atenção: Não é permitido solicitar aproveitamento em disciplinas que possuam atividades de extensão curricular.',
        filhos: dispensaComum.map(d => ({ ...d, id: 240 + d.id % 100 }))
      },
      {
        id: 25,
        texto: 'Estágio',
        filhos: [
          { id: 251, texto: 'Duração do estágio', resposta: 'Carga horária obrigatória: 180 horas\nPode iniciar: a partir do 4º semestre' },
          { id: 252, texto: 'Início do estágio', resposta: 'O estágio deve ser intermediado por empresa ou agente de integração conveniado ao Centro Paula Souza.\n\nApós conseguir a vaga, entre em contato com a Secretaria Administrativa: f258adm@cps.sp.gov.br' },
          { id: 253, texto: 'Comprovação', resposta: 'Após concluir as 180 horas, o aluno deve elaborar o Relatório Final de Estágio, assinado pelo supervisor e encaminhado ao Professor Orientador (adilson.neves@fatec.sp.gov.br).\n\nModelo: Anexos F e G do Manual de Estágio.' },
          { id: 254, texto: 'Equiparação de estágio', resposta: 'Pode ser comprovado por:\n• Iniciação Científica\n• Monitoria\n• Atividade profissional na área\n\nConsultar anexos correspondentes no Manual de Estágio.' }
        ]
      },
      { id: 26, texto: 'Horário das aulas', resposta: 'Selecione o semestre desejado (1º ao 6º) para visualizar o horário correspondente.' },
      { id: 27, texto: 'Portfólio', resposta: 'O curso de Geoprocessamento não possui Portfólio, mas possui o Trabalho de Graduação (TG) que deverá ser iniciado no 5º semestre.' },
      { id: 28, texto: 'Trabalho de Graduação (TG)', resposta: 'O TG deve ser iniciado no 5º semestre (Projetos em Geoprocessamento I) e concluído no 6º semestre (Projetos em Geoprocessamento II).\n\nO aluno deve buscar um professor orientador e pode ter um coorientador externo.\n\nO TG deve ser elaborado no formato de artigo científico e apresentado perante banca com no mínimo três professores.\n\nO aluno poderá ser dispensado da redação caso apresente artigo já publicado como primeiro autor.\n\nEvidência: Manual de Trabalho de Graduação.' }
    ]
  },
  {
    id: 3,
    texto: 'Meio Ambiente e Recursos Hídricos',
    filhos: [
      { id: 31, texto: 'Atividades Complementares (AACC)', resposta: 'É necessário cumprir 60 horas de Atividades Acadêmico Científico Culturais (AACC).\n\nO aluno poderá utilizar cursos extracurriculares, cursos de inglês, leitura de livros, participação em feiras como a FEITEC, visitas a museus e exposições, teatro e cinema, trabalho voluntário, visitas técnicas etc.' },
      { id: 32, texto: 'Datas importantes do semestre', resposta: calendarioAcademico },
      { id: 33, texto: 'Disciplinas remotas', resposta: '5º semestre: 20% da carga horária de cada disciplina é remota.\n\n6º semestre: Todas as disciplinas são remotas.' },
      {
        id: 34,
        texto: 'Dispensa de disciplinas',
        aviso: 'Atenção: Não é permitido solicitar aproveitamento em disciplinas que possuam atividades de extensão curricular.',
        filhos: [
          {
            id: 341,
            texto: 'Disciplinas com atividades de extensão',
            resposta: `1º semestre: Geociência Ambiental, Biologia, Química Geral\n\n2º semestre: Hidrologia e Recursos Hídricos, Climatologia e Meteorologia, Microbiologia Ambiental\n\n4º semestre: Educação Ambiental\n\n5º semestre: Planejamento e Drenagem Urbana, Avaliação de Impactos Ambientais e Análise de Riscos, Projetos Ambientais I, Sistemas de Gestão e Auditorias Ambientais\n\n6º semestre: Energias Alternativas, Turismo, Meio Ambiente e Recursos Hídricos, Ecotecnologia, Projetos Ambientais II`
          },
          ...dispensaComum.map(d => ({ ...d, id: 340 + d.id % 100 }))
        ]
      },
      {
        id: 35,
        texto: 'Estágio',
        filhos: [
          { id: 351, texto: 'Duração do estágio', resposta: 'Carga horária obrigatória: 180 horas\nPode iniciar: a partir do 4º semestre' },
          { id: 352, texto: 'Início do estágio', resposta: 'O estágio deve ser intermediado por empresa ou agente de integração conveniado ao Centro Paula Souza.\n\nApós conseguir a vaga, entre em contato com a Secretaria Administrativa: f258adm@cps.sp.gov.br' },
          { id: 353, texto: 'Comprovação', resposta: 'Após concluir as 180 horas, o aluno deve elaborar o Relatório Final de Estágio, assinado pelo supervisor e encaminhado ao Professor Orientador.\n\nModelo: Anexos F e G do Manual de Estágio.' },
          { id: 354, texto: 'Equiparação de estágio', resposta: 'Pode ser comprovado por:\n• Iniciação Científica\n• Monitoria\n• Atividade profissional na área\n\nConsultar anexos correspondentes no Manual de Estágio.' }
        ]
      },
      { id: 36, texto: 'Horário das aulas', resposta: 'Selecione o semestre desejado (1º ao 6º) para visualizar o horário correspondente.' },
      { id: 37, texto: 'Portfólio', resposta: 'O curso de Meio Ambiente e Recursos Hídricos não possui Portfólio, mas possui o Trabalho de Graduação (TG) que deverá ser iniciado no 5º semestre.' },
      { id: 38, texto: 'Trabalho de Graduação (TG)', resposta: 'O TG deve ser iniciado no 5º semestre (Projetos Ambientais I) e concluído no 6º semestre (Projetos Ambientais II).\n\nO aluno deve buscar um professor orientador e pode ter um coorientador externo.\n\nO TG deve ser elaborado no formato de artigo científico e apresentado perante banca com no mínimo três professores.\n\nEvidência: Manual de Trabalho de Graduação.' }
    ]
  },
  {
    id: 4,
    texto: 'Não sou aluno',
    filhos: [
      { id: 41, texto: 'A Fatec possui cursos técnicos?', resposta: 'A Fatec oferece exclusivamente cursos de graduação tecnológica (ensino superior). Caso você esteja interessado em cursos técnicos de nível médio, acesse o site da Etec Jacareí: https://vestibulinho.etec.sp.gov.br/unidades-cursos/escola.asp?c=77' },
      { id: 42, texto: 'Como ingressar na Fatec?', resposta: 'O ingresso na Fatec ocorre por meio de vestibular, realizado duas vezes ao ano, com ingressos em fevereiro e agosto.\n\nAcesse: https://vestibular.fatec.sp.gov.br/home/' },
      { id: 43, texto: 'Como realizar a matrícula?', resposta: 'A matrícula dos candidatos aprovados é realizada de forma totalmente online, por meio do portal oficial do vestibular, dentro do prazo estabelecido no calendário do processo seletivo.' },
      { id: 44, texto: 'Cursos oferecidos na Fatec Jacareí', resposta: 'A Fatec Jacareí oferece os seguintes cursos:\n\n• Desenvolvimento de Software Multiplataforma\n• Geoprocessamento\n• Meio Ambiente e Recursos Hídricos\n\nTodos no período noturno, das 18h45 às 23h05, com duração de 3 anos (6 semestres).' },
      { id: 45, texto: 'Horários das aulas', resposta: 'As aulas de todos os cursos ocorrem no período noturno, das 18h45 às 23h05.' }
    ]
  }
]