-- SEÇÃO 1 – DDL (CREATE TABLE)

-- TABELA: cursos
CREATE TABLE cursos (
    id     SERIAL       PRIMARY KEY,
    sigla  VARCHAR(10)  NOT NULL UNIQUE,
    nome   TEXT         NOT NULL,
    ativo  BOOLEAN      NOT NULL DEFAULT TRUE
);

-- TABELA: topicos
-- Representa cada assunto navegável no chatbot
-- tipo 'simples'  → retorna texto direto
-- tipo 'menu'     → retorna sub-opções para o usuário escolher
-- tipo 'pdf'      → retorna um ou mais arquivos para download (sem texto fixo)
CREATE TABLE topicos (
    id        SERIAL      PRIMARY KEY,
    curso_id  INTEGER     NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    chave     VARCHAR(50) NOT NULL,
    tipo      VARCHAR(20) NOT NULL CHECK (tipo IN ('simples', 'menu', 'pdf')),
    UNIQUE (curso_id, chave)
);

-- TABELA: respostas
-- Resposta principal de cada tópico do tipo 'simples' ou 'menu'
CREATE TABLE respostas (
    id                SERIAL  PRIMARY KEY,
    topico_id         INTEGER NOT NULL UNIQUE REFERENCES topicos(id) ON DELETE CASCADE,
    texto_informativo TEXT,   -- Introdução dos menus: "Escolha a opção:"
    conteudo          TEXT    -- Texto final das respostas simples
);

-- TABELA: sub_opcoes
-- Sub-itens dos tópicos do tipo 'menu'
CREATE TABLE sub_opcoes (
    id         SERIAL  PRIMARY KEY,
    topico_id  INTEGER NOT NULL REFERENCES topicos(id) ON DELETE CASCADE,
    titulo     TEXT    NOT NULL,
    conteudo   TEXT    NOT NULL
);

-- TABELA: documentos
-- Arquivos PDF para download, vinculados a um tópico
-- Tópicos do tipo 'pdf' terão apenas documentos (sem resposta em texto)
-- Tópicos do tipo 'simples' ou 'menu' podem ter documentos complementares
CREATE TABLE documentos (
    id               SERIAL       PRIMARY KEY,
    topico_id        INTEGER      NOT NULL REFERENCES topicos(id) ON DELETE CASCADE,
    nome_exibicao    TEXT         NOT NULL,
    caminho_arquivo  TEXT         NOT NULL,
    ativo            BOOLEAN      NOT NULL DEFAULT TRUE
);

-- TABELA: usuarios
-- Administradores e Secretárias que gerenciam o sistema
CREATE TABLE usuarios (
    id          SERIAL      PRIMARY KEY,
    nome        TEXT        NOT NULL,
    email       TEXT        NOT NULL UNIQUE,
    senha_hash  TEXT        NOT NULL,  -- Armazenado com bcrypt (nunca texto puro)
    perfil      VARCHAR(20) NOT NULL CHECK (perfil IN ('administrador', 'secretaria')),
    ativo       BOOLEAN     NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- TABELA: perguntas_usuarios
-- Perguntas livres enviadas pelos usuários ao final do atendimento (RF05)
--
-- FLUXO:
--   1. Aluno preenche nome, e-mail e dúvida → status 'pendente'
--   2. Final do dia: job (node-cron) busca pendentes do dia ordenados por criado_em ASC,
--      gera arquivo .txt formatado, envia por e-mail à secretaria
--      e atualiza status para 'enviada' + registra enviada_em
--   3. Secretaria lê o e-mail, responde pelo e-mail corporativo e marca no painel como 'respondida'
--   4. Após 24h de respondida_em: job deleta automaticamente o registro do banco
--      (o registro formal já está no e-mail enviado)
CREATE TABLE perguntas_usuarios (
    id             SERIAL      PRIMARY KEY,
    nome_aluno     TEXT        NOT NULL,               -- Nome informado pelo aluno
    email_aluno    TEXT        NOT NULL,               -- E-mail para resposta (RF05)
    curso_sigla    VARCHAR(10),                        -- Curso selecionado no chatbot
    texto          TEXT        NOT NULL,               -- Texto da dúvida
    status         VARCHAR(20) NOT NULL DEFAULT 'pendente'
                   CHECK (status IN ('pendente', 'enviada', 'respondida')),
    criado_em      TIMESTAMP   NOT NULL DEFAULT NOW(), -- Momento do envio pelo aluno
    enviada_em     TIMESTAMP,                          -- Preenchido pelo job ao enviar o e-mail
    respondida_em  TIMESTAMP                           -- Preenchido pela secretaria ao marcar respondida
                                                       -- Após 24h desse campo → registro deletado
);

-- TABELA: logs_navegacao
-- Registra cada acesso/ação do chatbot (RF08)
CREATE TABLE logs_navegacao (
    id           SERIAL      PRIMARY KEY,
    curso_id     INTEGER     REFERENCES cursos(id),
    topico_id    INTEGER     REFERENCES topicos(id),
    acao         TEXT        NOT NULL,  -- 'acessou_menu', 'visualizou_resposta', 'baixou_pdf'
    satisfacao   VARCHAR(10) CHECK (satisfacao IN ('gostei', 'nao_gostei')),  -- RF07
    acessado_em  TIMESTAMP   NOT NULL DEFAULT NOW()
);


-- SEÇÃO 2 – DML: INSERT (dados iniciais)

-- Cursos
INSERT INTO cursos (sigla, nome) VALUES
    ('DSM',       'Desenvolvimento de Software Multiplataforma'),
    ('GEO',       'Geoprocessamento'),
    ('MARH',      'Meio Ambiente e Recursos Hídricos'),
    ('NAO_ALUNO', 'Visitante / Não aluno');

-- Usuários (senha_hash é um placeholder — substituir pelo hash bcrypt real no backend)
INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
    ('Administrador',    'admin@fatec.sp.gov.br',          '$2b$10$placeholder_hash_admin',     'administrador'),
    ('Ana Paula Ferreira','ana.ferreira@fatec.sp.gov.br',  '$2b$10$placeholder_hash_ana',       'secretaria'),
    ('Carlos Mendes',    'carlos.mendes@fatec.sp.gov.br',  '$2b$10$placeholder_hash_carlos',    'secretaria');


-- TÓPICOS – DSM
INSERT INTO topicos (curso_id, chave, tipo) VALUES
    ((SELECT id FROM cursos WHERE sigla = 'DSM'), 'AACC',       'simples'),
    ((SELECT id FROM cursos WHERE sigla = 'DSM'), 'DATAS',      'pdf'),      -- Calendário acadêmico
    ((SELECT id FROM cursos WHERE sigla = 'DSM'), 'EXTENSAO',   'simples'),
    ((SELECT id FROM cursos WHERE sigla = 'DSM'), 'REMOTO',     'simples'),
    ((SELECT id FROM cursos WHERE sigla = 'DSM'), 'DISPENSA',   'menu'),
    ((SELECT id FROM cursos WHERE sigla = 'DSM'), 'ESTAGIO',    'menu'),
    ((SELECT id FROM cursos WHERE sigla = 'DSM'), 'HORARIO',    'pdf'),      -- Horário do curso
    ((SELECT id FROM cursos WHERE sigla = 'DSM'), 'PORTIFOLIO', 'simples'),
    ((SELECT id FROM cursos WHERE sigla = 'DSM'), 'TG',         'simples');

-- Respostas de texto – DSM
INSERT INTO respostas (topico_id, texto_informativo, conteudo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'AACC'),
     NULL,
     'O curso de Desenvolvimento de Software Multiplataforma não possui Atividades Acadêmico Científico-Culturais (AACC) previstas em sua matriz curricular.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'EXTENSAO'),
     NULL,
     'No curso de DSM, as atividades de extensão estão vinculadas ao ABP e às seguintes disciplinas:

2º semestre:
• Engenharia de Software II
• Desenvolvimento Web II
• Banco de Dados Relacional
• Técnicas de Programação I

3º semestre:
• Gestão Ágil de Projetos
• Desenvolvimento Web III
• Técnicas de Programação II
• Interação Humano-Computador

4º semestre:
• Laboratório de Desenvolvimento Web
• Integração e Entrega Contínua
• Internet das Coisas e Aplicações

5º semestre:
• Laboratório de Desenvolvimento para Dispositivos Móveis
• Computação em Nuvem I
• Aprendizagem de Máquina

6º semestre:
• Laboratório de Desenvolvimento Multiplataforma
• Processamento de Linguagem Natural
• Computação em Nuvem II'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'REMOTO'),
     NULL,
     'Apenas essas disciplinas possuem aulas remotas:

No 5º semestre:
• Inglês III
• Fundamentos da Redação Técnica

No 6º semestre:
• Todas as disciplinas são remotas'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'DISPENSA'),
     'Atenção: Não é permitido solicitar aproveitamento em disciplinas que possuam atividades de extensão curricular. Escolha a modalidade desejada:',
     NULL),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'ESTAGIO'),
     'Escolha a opção:',
     NULL),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'PORTIFOLIO'),
     NULL,
     'O curso não possui Trabalho de Graduação (TG). O TG é substituído pela construção do Portfólio Digital.

Os projetos do 4º, 5º e 6º semestres compõem o portfólio.
O portfólio deve ser hospedado em repositório privado.
Para orientações, contate: marcelo.sudo@fatec.sp.gov.br'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'TG'),
     NULL,
     'O curso de DSM não possui Trabalho de Graduação (TG/TCC). O TG é substituído pela construção do Portfólio Digital.

Os projetos do 4º, 5º e 6º semestres compõem o portfólio.
O portfólio deve ser hospedado em repositório privado.
Para orientações, contate: marcelo.sudo@fatec.sp.gov.br');

-- Sub-opções DISPENSA – DSM
INSERT INTO sub_opcoes (topico_id, titulo, conteudo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'DISPENSA'),
     'Aproveitamento de estudos',
     'A solicitação deve ser realizada pelo SIGA, anexando:
• Histórico escolar
• Ementas das disciplinas cursadas

Requisitos:
• Disciplinas cursadas nos últimos 10 anos
• Similaridade ≥ 70% → aprovação direta
• Similaridade entre 50% e 70% → exame de proficiência
• Similaridade < 50% → indeferimento

Referência: Regulamento Geral dos Cursos Superiores das Fatecs – Seção I, p. 25.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'DISPENSA'),
     'Reconhecimento de competências',
     'É possível solicitar reconhecimento de competências adquiridas em cursos técnicos da Etec, desde que estejam previamente mapeadas no sistema acadêmico.

Referência: Regulamento Geral dos Cursos Superiores das Fatecs – Seção II, p. 27.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'DISPENSA'),
     'Aproveitamento de conhecimentos e experiências anteriores',
     'Para solicitar, é necessário:
• Diploma(s) ou certificado(s);
• Realizar exame de proficiência.

Comprovantes aceitos:
• Declaração da empresa (experiência profissional);
• Certificados de cursos cuja soma de carga horária seja equivalente à disciplina;
• Cursos realizados em empresas ou plataformas digitais (ex.: Coursera, Udemy);
• Cursos de inglês para habilitação às provas de Inglês II, III e IV.

A solicitação deve ser formalizada por e-mail à Secretaria Acadêmica, informando o nome da disciplina e anexando os documentos.

Referência: Regulamento Geral dos Cursos Superiores das Fatecs – Seção III, p. 27.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'DISPENSA'),
     'Proficiência em Inglês',
     'No início do 3º semestre é aplicada a prova de proficiência em Inglês para todos os alunos.
• Plataforma: NEPLE
• Uso obrigatório de fones de ouvido
• Aplicação exclusiva no início do 3º semestre

Não é possível realizar a prova em outro período do curso.');

-- Sub-opções ESTAGIO – DSM
INSERT INTO sub_opcoes (topico_id, titulo, conteudo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'ESTAGIO'),
     'Duração do estágio supervisionado',
     'O estágio supervisionado tem uma carga horária obrigatória de 240 horas e pode ser iniciado a partir do 1º semestre.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'ESTAGIO'),
     'Início do estágio',
     'O estágio deve ser intermediado por empresa ou agente de integração conveniado ao Centro Paula Souza. Após conseguir a vaga, entre em contato com a Secretaria Administrativa: f258adm@cps.sp.gov.br'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'ESTAGIO'),
     'Comprovação',
     'Após concluir as 240 horas, o aluno deve elaborar o Relatório Final de Estágio, assinado pelo supervisor e encaminhado ao Professor Orientador.

Modelo: Anexos F e G do Manual de Estágio.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'ESTAGIO'),
     'Equiparação de estágio',
     'Pode ser comprovado por:
• Iniciação Científica
• Monitoria
• Atividade profissional na área

Consultar anexos correspondentes no Manual de Estágio.');


-- TÓPICOS – GEO
INSERT INTO topicos (curso_id, chave, tipo) VALUES
    ((SELECT id FROM cursos WHERE sigla = 'GEO'), 'AACC',       'simples'),
    ((SELECT id FROM cursos WHERE sigla = 'GEO'), 'DATAS',      'pdf'),
    ((SELECT id FROM cursos WHERE sigla = 'GEO'), 'EXTENSAO',   'simples'),
    ((SELECT id FROM cursos WHERE sigla = 'GEO'), 'REMOTO',     'simples'),
    ((SELECT id FROM cursos WHERE sigla = 'GEO'), 'DISPENSA',   'menu'),
    ((SELECT id FROM cursos WHERE sigla = 'GEO'), 'ESTAGIO',    'menu'),
    ((SELECT id FROM cursos WHERE sigla = 'GEO'), 'HORARIO',    'pdf'),
    ((SELECT id FROM cursos WHERE sigla = 'GEO'), 'PORTIFOLIO', 'simples'),
    ((SELECT id FROM cursos WHERE sigla = 'GEO'), 'TG',         'simples');

-- Respostas de texto – GEO
INSERT INTO respostas (topico_id, texto_informativo, conteudo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'AACC'),
     NULL,
     'É necessário cumprir 60 horas de Atividades Acadêmico Científico Culturais (AACC).

O aluno poderá utilizar cursos extracurriculares, cursos de inglês, leitura de livros, participação em feiras como a FEITEC, visitas a museus e exposições, teatro e cinema, trabalho voluntário, visitas técnicas etc.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'EXTENSAO'),
     NULL,
     'No curso de Geoprocessamento as atividades de extensão estão vinculadas as disciplinas de:
• Processamento Digital de Imagens
• Cartografia Aplicada
• Análise Ambiental por Geoprocessamento
• Projetos em Geoprocessamento I e II
• Geomarketing.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'REMOTO'),
     NULL,
     'O curso de Geoprocessamento não possui disciplinas remotas.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'DISPENSA'),
     'Atenção: Não é permitido solicitar aproveitamento em disciplinas que possuam atividades de extensão curricular. Escolha a modalidade desejada:',
     NULL),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'ESTAGIO'),
     'Escolha a opção:',
     NULL),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'PORTIFOLIO'),
     NULL,
     'O curso de Geoprocessamento não possui Portfólio, mas possui o Trabalho de Graduação (TG) que deverá ser iniciado no 5º semestre.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'TG'),
     NULL,
     'O Trabalho de Graduação (TG) deve ser iniciado no 5º semestre, na disciplina Projetos em Geoprocessamento I, e concluído no 6º semestre, na disciplina Projetos em Geoprocessamento II.

Para iniciar o TG, o aluno deve contar com um professor orientador. O aluno pode ter um coorientador externo (fora da Fatec Jacareí).

O TG deve ser elaborado no formato de artigo científico e apresentado perante uma banca examinadora composta por, no mínimo, três professores.

O aluno poderá ser dispensado da redação do TG caso apresente artigo científico já publicado em revista ou simpósio, desde que figure como primeiro autor.

Evidência: Manual de Trabalho de Graduação.');

-- Sub-opções DISPENSA – GEO
INSERT INTO sub_opcoes (topico_id, titulo, conteudo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'DISPENSA'),
     'Aproveitamento de estudos',
     'A solicitação deve ser realizada pelo SIGA, anexando:
• Histórico escolar
• Ementas das disciplinas cursadas

Requisitos:
• Disciplinas cursadas nos últimos 10 anos
• Similaridade ≥ 70% → aprovação direta
• Similaridade entre 50% e 70% → exame de proficiência
• Similaridade < 50% → indeferimento

Referência: Regulamento Geral dos Cursos Superiores das Fatecs – Seção I, p. 25.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'DISPENSA'),
     'Reconhecimento de competências',
     'É possível solicitar reconhecimento de competências adquiridas em cursos técnicos da Etec, desde que estejam previamente mapeadas no sistema acadêmico.

Referência: Regulamento Geral dos Cursos Superiores das Fatecs – Seção II, p. 27.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'DISPENSA'),
     'Aproveitamento de conhecimentos e experiências anteriores',
     'Para solicitar, é necessário:
• Diploma(s) ou certificado(s);
• Realizar exame de proficiência.

Comprovantes aceitos:
• Declaração da empresa (experiência profissional);
• Certificados de cursos cuja soma de carga horária seja equivalente à disciplina;
• Cursos realizados em empresas ou plataformas digitais (ex.: Coursera, Udemy);
• Cursos de inglês para habilitação às provas de Inglês II, III e IV.

A solicitação deve ser formalizada por e-mail à Secretaria Acadêmica.

Referência: Regulamento Geral dos Cursos Superiores das Fatecs – Seção III, p. 27.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'DISPENSA'),
     'Proficiência em Inglês',
     'No início do 3º semestre é aplicada a prova de proficiência em Inglês para todos os alunos.
• Plataforma: NEPLE
• Uso obrigatório de fones de ouvido
• Aplicação exclusiva no início do 3º semestre

Não é possível realizar a prova em outro período do curso.');

-- Sub-opções ESTAGIO – GEO
INSERT INTO sub_opcoes (topico_id, titulo, conteudo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'ESTAGIO'),
     'Duração do estágio supervisionado',
     'O estágio supervisionado tem uma carga horária obrigatória de 180 horas e pode ser iniciado a partir do 4º semestre.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'ESTAGIO'),
     'Início do estágio',
     'O estágio deve ser intermediado por empresa ou agente de integração conveniado ao Centro Paula Souza. Após conseguir a vaga, entre em contato com a Secretaria Administrativa: f258adm@cps.sp.gov.br'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'ESTAGIO'),
     'Comprovação',
     'Após concluir as 180 horas, o aluno deve elaborar o Relatório Final de Estágio, assinado pelo supervisor e encaminhado ao Professor Orientador (adilson.neves@fatec.sp.gov.br).

Modelo: Anexos F e G do Manual de Estágio.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'ESTAGIO'),
     'Equiparação de estágio',
     'Pode ser comprovado por:
• Iniciação Científica
• Monitoria
• Atividade profissional na área

Consultar anexos correspondentes no Manual de Estágio.');


-- TÓPICOS – MARH
INSERT INTO topicos (curso_id, chave, tipo) VALUES
    ((SELECT id FROM cursos WHERE sigla = 'MARH'), 'AACC',       'simples'),
    ((SELECT id FROM cursos WHERE sigla = 'MARH'), 'DATAS',      'pdf'),
    ((SELECT id FROM cursos WHERE sigla = 'MARH'), 'EXTENSAO',   'simples'),
    ((SELECT id FROM cursos WHERE sigla = 'MARH'), 'REMOTO',     'simples'),
    ((SELECT id FROM cursos WHERE sigla = 'MARH'), 'DISPENSA',   'menu'),
    ((SELECT id FROM cursos WHERE sigla = 'MARH'), 'ESTAGIO',    'menu'),
    ((SELECT id FROM cursos WHERE sigla = 'MARH'), 'HORARIO',    'pdf'),
    ((SELECT id FROM cursos WHERE sigla = 'MARH'), 'PORTIFOLIO', 'simples'),
    ((SELECT id FROM cursos WHERE sigla = 'MARH'), 'TG',         'simples');

-- Respostas de texto – MARH
INSERT INTO respostas (topico_id, texto_informativo, conteudo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'AACC'),
     NULL,
     'É necessário cumprir 60 horas de Atividades Acadêmico Científico Culturais (AACC).

O aluno poderá utilizar cursos extracurriculares, cursos de inglês, leitura de livros, participação em feiras como a FEITEC, visitas a museus e exposições, teatro e cinema, trabalho voluntário, visitas técnicas etc.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'EXTENSAO'),
     NULL,
     'No curso de MARH, as atividades de extensão estão vinculadas às seguintes disciplinas:

1º semestre:
• Geociência Ambiental
• Biologia
• Química Geral

2º semestre:
• Hidrologia e Recursos Hídricos
• Climatologia e Meteorologia
• Microbiologia Ambiental

4º semestre:
• Educação Ambiental

5º semestre:
• Planejamento e Drenagem Urbana
• Avaliação de Impactos Ambientais e Análise de Ricos
• Projetos Ambientais I
• Sistemas de Gestão e Auditorias Ambientais

6º semestre:
• Energias Alternativas
• Turismo, Meio Ambiente e Recursos Hídricos
• Ecotecnologia
• Projetos Ambientais II'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'REMOTO'),
     NULL,
     'Configuração das disciplinas remotas no curso de MARH:

No 5º semestre:
• 20% da carga horária de cada disciplina é remota

No 6º semestre:
• Todas as disciplinas são remotas.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'DISPENSA'),
     'Atenção: Não é permitido solicitar aproveitamento em disciplinas que possuam atividades de extensão curricular. Escolha a modalidade desejada:',
     NULL),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'ESTAGIO'),
     'Escolha a opção:',
     NULL),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'PORTIFOLIO'),
     NULL,
     'O curso de Meio Ambiente e Recursos Hídricos não possui Portfólio, mas possui o Trabalho de Graduação (TG) que deverá ser iniciado no 5º semestre.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'TG'),
     NULL,
     'O Trabalho de Graduação (TG) deve ser iniciado no 5º semestre, na disciplina Projetos Ambientais I, e concluído no 6º semestre, na disciplina Projetos Ambientais II.

Para iniciar o TG, o aluno deve contar com um professor orientador. O aluno pode ter um coorientador externo (fora da Fatec Jacareí).

O TG deve ser elaborado no formato de artigo científico e apresentado perante uma banca examinadora composta por, no mínimo, três professores.

O aluno poderá ser dispensado da redação do TG caso apresente artigo científico já publicado em revista ou simpósio, desde que figure como primeiro autor.

Evidência: Manual de Trabalho de Graduação.');

-- Sub-opções DISPENSA – MARH
INSERT INTO sub_opcoes (topico_id, titulo, conteudo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'DISPENSA'),
     'Aproveitamento de estudos',
     'A solicitação deve ser realizada pelo SIGA, anexando:
• Histórico escolar
• Ementas das disciplinas cursadas

Requisitos:
• Disciplinas cursadas nos últimos 10 anos
• Similaridade ≥ 70% → aprovação direta
• Similaridade entre 50% e 70% → exame de proficiência
• Similaridade < 50% → indeferimento

Referência: Regulamento Geral dos Cursos Superiores das Fatecs – Seção I, p. 25.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'DISPENSA'),
     'Reconhecimento de competências',
     'É possível solicitar reconhecimento de competências adquiridas em cursos técnicos da Etec, desde que estejam previamente mapeadas no sistema acadêmico.

Referência: Regulamento Geral dos Cursos Superiores das Fatecs – Seção II, p. 27.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'DISPENSA'),
     'Aproveitamento de conhecimentos e experiências anteriores',
     'Para solicitar, é necessário:
• Diploma(s) ou certificado(s);
• Realizar exame de proficiência.

Comprovantes aceitos:
• Declaração da empresa (experiência profissional);
• Certificados de cursos cuja soma de carga horária seja equivalente à disciplina;
• Cursos realizados em empresas ou plataformas digitais (ex.: Coursera, Udemy);
• Cursos de inglês para habilitação às provas de Inglês II, III e IV.

A solicitação deve ser formalizada por e-mail à Secretaria Acadêmica.

Referência: Regulamento Geral dos Cursos Superiores das Fatecs – Seção III, p. 27.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'DISPENSA'),
     'Proficiência em Inglês',
     'No início do 3º semestre é aplicada a prova de proficiência em Inglês para todos os alunos.
• Plataforma: NEPLE
• Uso obrigatório de fones de ouvido
• Aplicação exclusiva no início do 3º semestre

Não é possível realizar a prova em outro período do curso.');

-- Sub-opções ESTAGIO – MARH
INSERT INTO sub_opcoes (topico_id, titulo, conteudo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'ESTAGIO'),
     'Duração do estágio supervisionado',
     'O estágio supervisionado tem uma carga horária obrigatória de 180 horas e pode ser iniciado a partir do 4º semestre.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'ESTAGIO'),
     'Início do estágio',
     'O estágio deve ser intermediado por empresa ou agente de integração conveniado ao Centro Paula Souza. Após conseguir a vaga, entre em contato com a Secretaria Administrativa: f258adm@cps.sp.gov.br'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'ESTAGIO'),
     'Comprovação',
     'Após concluir as 180 horas, o aluno deve elaborar o Relatório Final de Estágio, assinado pelo supervisor e encaminhado ao Professor Orientador.

Modelo: Anexos F e G do Manual de Estágio.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'ESTAGIO'),
     'Equiparação de estágio',
     'Pode ser comprovado por:
• Iniciação Científica
• Monitoria
• Atividade profissional na área

Consultar anexos correspondentes no Manual de Estágio.');


-- TÓPICOS – NAO_ALUNO
INSERT INTO topicos (curso_id, chave, tipo) VALUES
    ((SELECT id FROM cursos WHERE sigla = 'NAO_ALUNO'), 'DATAS', 'pdf'),
    ((SELECT id FROM cursos WHERE sigla = 'NAO_ALUNO'), 'GERAL', 'menu');

INSERT INTO respostas (topico_id, texto_informativo, conteudo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'NAO_ALUNO' AND t.chave = 'GERAL'),
     'Para qual assunto você gostaria de obter informações?',
     NULL);

INSERT INTO sub_opcoes (topico_id, titulo, conteudo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'NAO_ALUNO' AND t.chave = 'GERAL'),
     'A Fatec possui cursos técnicos?',
     'A Fatec oferece exclusivamente cursos de graduação tecnológica (ensino superior). Caso você esteja interessado em cursos técnicos de nível médio, recomendamos acessar o site da Etec Jacareí: https://vestibulinho.etec.sp.gov.br/unidades-cursos/escola.asp?c=77'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'NAO_ALUNO' AND t.chave = 'GERAL'),
     'Como ingressar na Fatec?',
     'O ingresso na Fatec ocorre por meio de vestibular. O processo seletivo é realizado duas vezes ao ano, com ingressos previstos para os meses de fevereiro e agosto. Para obter informações detalhadas sobre inscrições e datas, acesse o portal oficial do vestibular: https://vestibular.fatec.sp.gov.br/home/'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'NAO_ALUNO' AND t.chave = 'GERAL'),
     'Como realizar a matrícula?',
     'A matrícula dos candidatos aprovados no vestibular é realizada de forma totalmente online, por meio do portal oficial do vestibular, dentro do prazo estabelecido no calendário do processo seletivo.'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'NAO_ALUNO' AND t.chave = 'GERAL'),
     'Cursos oferecidos na Fatec Jacareí',
     'A Fatec Jacareí oferece os seguintes cursos de graduação tecnológica:
• Desenvolvimento de Software Multiplataforma
• Geoprocessamento
• Meio Ambiente e Recursos Hídricos

Todos os cursos são oferecidos no período noturno, das 18h45 às 23h05, e possuem 3 anos de duração (6 semestres).'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'NAO_ALUNO' AND t.chave = 'GERAL'),
     'Horários das aulas',
     'As aulas de todos os cursos da Fatec Jacareí ocorrem no período noturno, das 18h45 às 23h05.');


-- DOCUMENTOS PDF
-- Caminhos conforme estrutura real do backend

-- Calendário Acadêmico: compartilhado, vinculado ao tópico DATAS de cada curso
INSERT INTO documentos (topico_id, nome_exibicao, caminho_arquivo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM'       AND t.chave = 'DATAS'),
     'Calendário Acadêmico 2026', '/uploads/GERAL/Calendario Academico 2026.pdf'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO'       AND t.chave = 'DATAS'),
     'Calendário Acadêmico 2026', '/uploads/GERAL/Calendario Academico 2026.pdf'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH'      AND t.chave = 'DATAS'),
     'Calendário Acadêmico 2026', '/uploads/GERAL/Calendario Academico 2026.pdf'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'NAO_ALUNO' AND t.chave = 'DATAS'),
     'Calendário Acadêmico 2026', '/uploads/GERAL/Calendario Academico 2026.pdf');

-- Horários: cada curso tem o seu PDF próprio
INSERT INTO documentos (topico_id, nome_exibicao, caminho_arquivo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM'  AND t.chave = 'HORARIO'),
     'DSM - Horário 2026-1', '/uploads/DSM/DSM - Horario 2026-1.pdf'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO'  AND t.chave = 'HORARIO'),
     'Geo - Horário 2026-1', '/uploads/GEO/Geo - Horario 2026-1.pdf'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'HORARIO'),
     'MARH - Horário 2026-1', '/uploads/MARH/MARH - Horario 2026-1.pdf');

-- PPCs: vinculados ao tópico EXTENSAO de cada curso (referência curricular)
INSERT INTO documentos (topico_id, nome_exibicao, caminho_arquivo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM'  AND t.chave = 'EXTENSAO'),
     'DSM - PPC', '/uploads/DSM/DSM - PPC.pdf'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO'  AND t.chave = 'EXTENSAO'),
     'Geo - PPC', '/uploads/GEO/Geo - PPC.pdf'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'EXTENSAO'),
     'MARH - PPC', '/uploads/MARH/MARH - PPC.pdf');

-- Documentos gerais: vinculados ao tópico ESTAGIO (manual) e DISPENSA (regulamento)
INSERT INTO documentos (topico_id, nome_exibicao, caminho_arquivo) VALUES
    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM'  AND t.chave = 'ESTAGIO'),
     'Manual de Estágio Supervisionado', '/uploads/GERAL/Manual de orientacoes de Estagio Supervisionado.pdf'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO'  AND t.chave = 'ESTAGIO'),
     'Manual de Estágio Supervisionado', '/uploads/GERAL/Manual de orientacoes de Estagio Supervisionado.pdf'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'ESTAGIO'),
     'Manual de Estágio Supervisionado', '/uploads/GERAL/Manual de orientacoes de Estagio Supervisionado.pdf'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM'  AND t.chave = 'DISPENSA'),
     'Regulamento Geral dos Cursos', '/uploads/GERAL/Regulamento Geral dos Cursos.pdf'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO'  AND t.chave = 'DISPENSA'),
     'Regulamento Geral dos Cursos', '/uploads/GERAL/Regulamento Geral dos Cursos.pdf'),

    ((SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'DISPENSA'),
     'Regulamento Geral dos Cursos', '/uploads/GERAL/Regulamento Geral dos Cursos.pdf');

-- Logs simulados para as consultas analíticas funcionarem
INSERT INTO logs_navegacao (curso_id, topico_id, acao) VALUES
    ((SELECT id FROM cursos WHERE sigla = 'DSM'),
     (SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'ESTAGIO'),
     'acessou_menu'),
    ((SELECT id FROM cursos WHERE sigla = 'DSM'),
     (SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'DATAS'),
     'baixou_pdf'),
    ((SELECT id FROM cursos WHERE sigla = 'DSM'),
     (SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'HORARIO'),
     'baixou_pdf'),
    ((SELECT id FROM cursos WHERE sigla = 'GEO'),
     (SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'TG'),
     'visualizou_resposta'),
    ((SELECT id FROM cursos WHERE sigla = 'GEO'),
     (SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'GEO' AND t.chave = 'DATAS'),
     'baixou_pdf'),
    ((SELECT id FROM cursos WHERE sigla = 'MARH'),
     (SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'MARH' AND t.chave = 'EXTENSAO'),
     'visualizou_resposta'),
    ((SELECT id FROM cursos WHERE sigla = 'DSM'),
     (SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'DISPENSA'),
     'acessou_menu'),
    ((SELECT id FROM cursos WHERE sigla = 'DSM'),
     (SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'AACC'),
     'visualizou_resposta');

-- Perguntas simuladas de usuários
INSERT INTO perguntas_usuarios (nome_aluno, email_aluno, curso_sigla, texto, status, enviada_em) VALUES
    ('João Silva',    'joao.silva@fatec.sp.gov.br',   'DSM',  'Como funciona o ABP no DSM?',                      'respondida', NOW() - INTERVAL '2 days'),
    ('Maria Souza',   'maria.souza@fatec.sp.gov.br',  'DSM',  'Posso fazer estágio no 1º semestre?',              'respondida', NOW() - INTERVAL '2 days'),
    ('Pedro Lima',    'pedro.lima@fatec.sp.gov.br',   'GEO',  'Quais são os pré-requisitos para o TG?',           'enviada',    NOW() - INTERVAL '1 day'),
    ('Ana Costa',     'ana.costa@fatec.sp.gov.br',    'MARH', 'O PPC do curso de MARH está atualizado?',          'enviada',    NOW() - INTERVAL '1 day'),
    ('Carlos Nunes',  'carlos.nunes@fatec.sp.gov.br',  NULL,  'Como funciona a matrícula para calouros?',         'pendente',   NULL),
    ('Beatriz Reis',  'beatriz.reis@fatec.sp.gov.br', 'DSM',  'Posso transferir disciplinas de outra faculdade?', 'pendente',   NULL);


-- SEÇÃO 3 – DML: UPDATE

-- Secretaria marca uma pergunta como respondida
UPDATE perguntas_usuarios
SET status = 'respondida',
    respondida_em = NOW()
WHERE texto = 'Quais são os pré-requisitos para o TG?';

-- Job do final do dia marca perguntas pendentes como enviadas
UPDATE perguntas_usuarios
SET status = 'enviada',
    enviada_em = NOW()
WHERE status = 'pendente'
  AND criado_em::date = CURRENT_DATE;

-- Desativa temporariamente um documento (ex: PDF sendo atualizado)
UPDATE documentos
SET ativo = FALSE
WHERE nome_exibicao = 'Calendário Acadêmico 2026'
  AND topico_id = (SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'DATAS');

-- Reativa após atualização
UPDATE documentos
SET ativo = TRUE
WHERE nome_exibicao = 'Calendário Acadêmico 2026'
  AND topico_id = (SELECT t.id FROM topicos t JOIN cursos c ON t.curso_id = c.id WHERE c.sigla = 'DSM' AND t.chave = 'DATAS');

-- Desativa um usuário que saiu da instituição
UPDATE usuarios
SET ativo = FALSE
WHERE email = 'carlos.mendes@fatec.sp.gov.br';


-- SEÇÃO 4 – DML: DELETE

-- Job automático: deleta perguntas respondidas há mais de 24h
-- (registro formal já está no e-mail enviado à secretaria)
DELETE FROM perguntas_usuarios
WHERE status = 'respondida'
  AND respondida_em < NOW() - INTERVAL '24 hours';

-- Remove log de teste inserido durante desenvolvimento
DELETE FROM logs_navegacao
WHERE acao = 'teste_sistema';


-- SEÇÃO 5 – CONTROLE DE TRANSAÇÕES

-- COMMIT: nova pergunta confirmada
BEGIN;
    INSERT INTO perguntas_usuarios (nome_aluno, email_aluno, curso_sigla, texto, status)
    VALUES ('Lucas Fernandes', 'lucas.fernandes@fatec.sp.gov.br', NULL, 'Quando começa o semestre 2026-2?', 'pendente');
COMMIT;

-- ROLLBACK: inserção cancelada (ex: dado inválido detectado antes de salvar)
BEGIN;
    INSERT INTO usuarios (nome, email, senha_hash, perfil)
    VALUES ('Teste Temp', 'teste@fatec.sp.gov.br', '$2b$10$placeholder', 'secretaria');
ROLLBACK;

-- TRUNCATE (limpa logs — usar apenas em ambiente de desenvolvimento!)
-- TRUNCATE TABLE logs_navegacao RESTART IDENTITY;


-- SEÇÃO 6 – CONSULTAS BÁSICAS

-- Todos os tópicos do DSM em ordem alfabética
SELECT t.chave, t.tipo
FROM topicos t
JOIN cursos c ON c.id = t.curso_id
WHERE c.sigla = 'DSM'
ORDER BY t.chave ASC;

-- Tópicos do tipo PDF (sem texto fixo, apenas arquivos)
SELECT c.sigla, t.chave
FROM topicos t
JOIN cursos c ON c.id = t.curso_id
WHERE t.tipo = 'pdf'
ORDER BY c.sigla, t.chave;

-- 5 logs mais recentes
SELECT l.acao, l.acessado_em, c.sigla AS curso
FROM logs_navegacao l
JOIN cursos c ON c.id = l.curso_id
ORDER BY l.acessado_em DESC
LIMIT 5;

-- Perguntas ainda pendentes (não enviadas hoje)
SELECT nome_aluno, email_aluno, curso_sigla, texto, criado_em
FROM perguntas_usuarios
WHERE status = 'pendente'
ORDER BY criado_em ASC;

-- Painel da secretaria: perguntas enviadas ainda não respondidas, filtro por data
SELECT nome_aluno, email_aluno, curso_sigla, texto, enviada_em
FROM perguntas_usuarios
WHERE status = 'enviada'
  AND enviada_em::date = CURRENT_DATE   -- trocar pela data desejada no backend
ORDER BY criado_em ASC;

-- Todas as perguntas do dia para gerar o .txt do e-mail (job final do dia)
SELECT nome_aluno, email_aluno, curso_sigla, texto, criado_em
FROM perguntas_usuarios
WHERE status = 'pendente'
  AND criado_em::date = CURRENT_DATE
ORDER BY criado_em ASC;

-- Documentos ativos por curso
SELECT c.sigla, d.nome_exibicao, d.caminho_arquivo
FROM documentos d
JOIN topicos t ON t.id = d.topico_id
JOIN cursos c ON c.id = t.curso_id
WHERE d.ativo = TRUE
ORDER BY c.sigla, d.nome_exibicao;


-- SEÇÃO 7 – FUNÇÕES DE AGREGAÇÃO

-- Quantidade de tópicos por tipo em cada curso
SELECT c.sigla, t.tipo, COUNT(*) AS total
FROM topicos t
JOIN cursos c ON c.id = t.curso_id
GROUP BY c.sigla, t.tipo
ORDER BY c.sigla, t.tipo;

-- Cursos com mais documentos cadastrados
SELECT c.sigla, COUNT(d.id) AS total_docs
FROM documentos d
JOIN topicos t ON t.id = d.topico_id
JOIN cursos c ON c.id = t.curso_id
GROUP BY c.sigla
ORDER BY total_docs DESC;

-- Tópicos com mais de 1 sub-opção
SELECT c.sigla, t.chave, COUNT(s.id) AS total_sub_opcoes
FROM topicos t
JOIN cursos c ON c.id = t.curso_id
JOIN sub_opcoes s ON s.topico_id = t.id
GROUP BY c.sigla, t.chave
HAVING COUNT(s.id) > 1
ORDER BY total_sub_opcoes DESC;

-- Total de acessos por curso
SELECT c.sigla, COUNT(l.id) AS total_acessos
FROM logs_navegacao l
JOIN cursos c ON c.id = l.curso_id
GROUP BY c.sigla
ORDER BY total_acessos DESC;

-- Perguntas por status
SELECT status, COUNT(*) AS total
FROM perguntas_usuarios
GROUP BY status
ORDER BY total DESC;

-- Perguntas por curso com breakdown de status
SELECT
    COALESCE(curso_sigla, 'Sem curso') AS curso,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'pendente'   THEN 1 ELSE 0 END) AS pendentes,
    SUM(CASE WHEN status = 'enviada'    THEN 1 ELSE 0 END) AS enviadas,
    SUM(CASE WHEN status = 'respondida' THEN 1 ELSE 0 END) AS respondidas
FROM perguntas_usuarios
GROUP BY curso_sigla
ORDER BY total DESC;


-- SEÇÃO 8 – JOINs

-- INNER JOIN: tópicos simples com suas respostas
SELECT c.sigla AS curso, t.chave AS topico, r.conteudo
FROM topicos t
INNER JOIN cursos c ON c.id = t.curso_id
INNER JOIN respostas r ON r.topico_id = t.id
WHERE t.tipo = 'simples'
ORDER BY c.sigla, t.chave;

-- LEFT JOIN: todos os tópicos com seus documentos (inclusive sem documento)
SELECT c.sigla AS curso, t.chave AS topico, t.tipo, d.nome_exibicao AS documento
FROM topicos t
LEFT JOIN cursos c ON c.id = t.curso_id
LEFT JOIN documentos d ON d.topico_id = t.id
ORDER BY c.sigla, t.chave;

-- JOIN com 3 tabelas: logs com curso e tópico
SELECT l.acessado_em, c.sigla AS curso, t.chave AS topico, l.acao
FROM logs_navegacao l
INNER JOIN cursos c ON c.id = l.curso_id
INNER JOIN topicos t ON t.id = l.topico_id
ORDER BY l.acessado_em DESC;

-- JOIN com 4 tabelas: sub-opções com seu menu, curso e texto introdutório
SELECT c.sigla AS curso, t.chave AS topico, r.texto_informativo, s.titulo
FROM sub_opcoes s
INNER JOIN topicos t ON t.id = s.topico_id
INNER JOIN cursos c ON c.id = t.curso_id
INNER JOIN respostas r ON r.topico_id = t.id
ORDER BY c.sigla, t.chave, s.id;


-- SEÇÃO 9 – SUBCONSULTAS (BDR.02)

-- Subquery no SELECT: quantidade de documentos por tópico
SELECT
    c.sigla AS curso,
    t.chave AS topico,
    t.tipo,
    (SELECT COUNT(*) FROM documentos d WHERE d.topico_id = t.id AND d.ativo = TRUE) AS total_docs
FROM topicos t
JOIN cursos c ON c.id = t.curso_id
ORDER BY total_docs DESC;

-- Subquery no WHERE com IN: tópicos que possuem ao menos um documento ativo
SELECT t.chave, c.sigla, t.tipo
FROM topicos t
JOIN cursos c ON c.id = t.curso_id
WHERE t.id IN (
    SELECT DISTINCT topico_id FROM documentos WHERE ativo = TRUE
)
ORDER BY c.sigla, t.chave;

-- Subquery com EXISTS: cursos que têm pelo menos um log registrado
SELECT c.sigla, c.nome
FROM cursos c
WHERE EXISTS (
    SELECT 1 FROM logs_navegacao l WHERE l.curso_id = c.id
);

-- Subquery com NOT IN: tópicos que nunca foram acessados nos logs
SELECT t.chave, c.sigla, t.tipo
FROM topicos t
JOIN cursos c ON c.id = t.curso_id
WHERE t.id NOT IN (
    SELECT DISTINCT topico_id FROM logs_navegacao WHERE topico_id IS NOT NULL
)
ORDER BY c.sigla, t.chave;


-- SEÇÃO 10 – CONSULTAS ANALÍTICAS (BDR.02)

-- Relatório 1: Tópicos mais acessados
SELECT c.sigla AS curso, t.chave AS topico, t.tipo, COUNT(l.id) AS total_acessos
FROM logs_navegacao l
JOIN cursos c ON c.id = l.curso_id
JOIN topicos t ON t.id = l.topico_id
GROUP BY c.sigla, t.chave, t.tipo
ORDER BY total_acessos DESC
LIMIT 10;

-- Relatório 2: Perguntas por curso e status
SELECT
    COALESCE(curso_sigla, 'Sem curso') AS curso,
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'pendente'   THEN 1 ELSE 0 END) AS pendentes,
    SUM(CASE WHEN status = 'enviada'    THEN 1 ELSE 0 END) AS enviadas,
    SUM(CASE WHEN status = 'respondida' THEN 1 ELSE 0 END) AS respondidas
FROM perguntas_usuarios
GROUP BY curso_sigla
ORDER BY total DESC;

-- Relatório 3: PDFs mais baixados
SELECT t.chave AS topico, c.sigla AS curso, COUNT(l.id) AS downloads
FROM logs_navegacao l
JOIN topicos t ON t.id = l.topico_id
JOIN cursos c ON c.id = l.curso_id
WHERE l.acao = 'baixou_pdf'
GROUP BY t.chave, c.sigla
ORDER BY downloads DESC;

-- Relatório 4: Documentos de tópicos mais acessados (subquery + JOIN)
SELECT d.nome_exibicao, d.caminho_arquivo, acessos.total_acessos
FROM documentos d
JOIN (
    SELECT topico_id, COUNT(*) AS total_acessos
    FROM logs_navegacao
    WHERE topico_id IS NOT NULL
    GROUP BY topico_id
) acessos ON acessos.topico_id = d.topico_id
WHERE d.ativo = TRUE
ORDER BY acessos.total_acessos DESC;


-- SEÇÃO 11 – ÍNDICES (BDR.02)

-- Índice 1: curso_id em topicos
-- Motivo: campo de JOIN em todas as consultas que filtram por curso.
-- Resolve: evita varredura completa da tabela topicos ao buscar tópicos de um curso.
CREATE INDEX idx_topicos_curso_id ON topicos(curso_id);

-- Índice 2: tipo em topicos
-- Motivo: backend filtra frequentemente por tipo ('pdf', 'simples', 'menu').
-- Resolve: acelera a separação entre tópicos que retornam PDF e os que retornam texto.
CREATE INDEX idx_topicos_tipo ON topicos(tipo);

-- Índice 3: topico_id em sub_opcoes
-- Motivo: JOIN mais frequente ao carregar as opções de um menu no chatbot.
-- Resolve: acelera a busca das sub-opções exibidas ao usuário.
CREATE INDEX idx_sub_opcoes_topico_id ON sub_opcoes(topico_id);

-- Índice 4: topico_id em documentos
-- Motivo: JOIN ao buscar PDFs vinculados a um tópico para exibir link de download.
-- Resolve: evita full scan em documentos ao filtrar por tópico.
CREATE INDEX idx_documentos_topico_id ON documentos(topico_id);

-- Índice 5: topico_id em logs_navegacao
-- Motivo: usado nos relatórios de tópicos mais acessados.
-- Resolve: acelera GROUP BY e COUNT por tópico nos logs.
CREATE INDEX idx_logs_topico_id ON logs_navegacao(topico_id);

-- Índice 6: curso_id em logs_navegacao
-- Motivo: relatórios filtrados por curso.
-- Resolve: acelera consultas de acesso agregadas por curso.
CREATE INDEX idx_logs_curso_id ON logs_navegacao(curso_id);

-- Índice 7: acessado_em em logs_navegacao
-- Motivo: consultas com ORDER BY data e filtros por período.
-- Resolve: evita ordenação custosa sem índice em tabelas de log que crescem rapidamente.
CREATE INDEX idx_logs_acessado_em ON logs_navegacao(acessado_em);

-- Índice 8: status em perguntas_usuarios
-- Motivo: secretaria filtra constantemente por status = 'enviada' ou 'pendente'.
-- Resolve: evita varredura total ao listar a fila de trabalho do dia.
CREATE INDEX idx_perguntas_status ON perguntas_usuarios(status);

-- Índice 9: criado_em em perguntas_usuarios
-- Motivo: job do final do dia filtra por criado_em::date = CURRENT_DATE.
-- Resolve: acelera a busca das perguntas do dia para gerar o .txt do e-mail.
CREATE INDEX idx_perguntas_criado_em ON perguntas_usuarios(criado_em);

-- Índice 10: respondida_em em perguntas_usuarios
-- Motivo: job de limpeza filtra por respondida_em < NOW() - INTERVAL '24 hours'.
-- Resolve: evita full scan ao deletar perguntas expiradas automaticamente.
CREATE INDEX idx_perguntas_respondida_em ON perguntas_usuarios(respondida_em);