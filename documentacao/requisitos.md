# Requisitos e User Stories


## Requisitos Funcionais (RF)


| Requisito | Sub-Requisito | User Story |
|-----------|---------------|------------|
| RF01 - Cadastro de Alunos | RF01.1 – Permitir cadastro de alunos com dados pessoais e acadêmicos. | US01 Como administrador, quero cadastrar alunos com dados pessoais e acadêmicos, para que eles possam ser registrados no sistema. |
| RF01 - Cadastro de Alunos | RF01.2 – Permitir edição de dados do aluno. | US02 Como administrador, quero editar os dados de um aluno já cadastrado, para manter as informações atualizadas. |
| RF01 - Cadastro de Alunos | RF01.3 – Permitir inativação ou desligamento de alunos. | US03 Como administrador, quero cancelar a inscrição de um aluno, para registrar desligamentos ou inativações. |
| RF01 - Cadastro de Alunos | RF01.4 – Permitir consulta de alunos por nome, matrícula, curso ou CPF. | US04 Como administrador, quero consultar alunos por nome, matrícula, curso ou CPF, para localizar rapidamente informações. |
| RF01 - Cadastro de Alunos | RF01.5 – Gerar número de matrícula automaticamente. | US05 Como administrador, quero que o sistema gere automaticamente o número de matrícula, para garantir padronização e evitar duplicidade. |
---
| RF02 - Cadastro de Professores | RF02.1 – Permitir cadastro e edição de professores com dados pessoais e profissionais. | US06 Como administrador, quero cadastrar e editar dados de professores, para manter o corpo docente atualizado. |
| RF02 - Cadastro de Professores | RF02.2 – Permitir vincular professores às disciplinas. | US07 Como coordenador, quero atribuir disciplinas a professores, para organizar a distribuição de aulas. |
| RF02 - Cadastro de Professores | RF02.3 – Permitir consulta de professores por nome, departamento ou disciplina. | US08 Como administrador, quero consultar professores por nome, departamento ou disciplina, para localizar docentes rapidamente. |
---
| RF03 - Cadastro de Cursos | RF03.1 – Permitir cadastro de cursos oferecidos pela instituição. | US09 Como administrador, quero cadastrar cursos com nome, carga horária e descrição, para disponibilizar novas formações. |
| RF03 - Cadastro de Cursos | RF03.2 – Permitir vincular disciplinas aos cursos. | US10 Como administrador, quero vincular disciplinas a cursos, para estruturar a grade curricular. |
| RF03 - Cadastro de Cursos | RF03.3 – Permitir definir carga horária total do curso. | US11 Como administrador, quero definir a carga horária total de um curso, para garantir conformidade acadêmica. |
| RF03 - Cadastro de Cursos | RF03.4 – Permitir ativar ou desativar cursos. | US12 Como administrador, quero ativar ou desativar cursos, para controlar sua disponibilidade. |
---
| RF04 - Cadastro de Disciplinas | RF04.1 – Permitir cadastro de disciplinas. | US13 Como administrador, quero cadastrar disciplinas com nome e descrição, para compor a grade curricular. |
| RF04 - Cadastro de Disciplinas | RF04.2 – Permitir definir carga horária da disciplina. | US14 Como administrador, quero definir a carga horária de uma disciplina, para registrar corretamente sua duração. |
| RF04 - Cadastro de Disciplinas | RF04.3 – Permitir definir pré-requisitos entre disciplinas. | US15 Como administrador, quero definir pré-requisitos entre disciplinas, para garantir a sequência correta de aprendizagem. |
| RF04 - Cadastro de Disciplinas | RF04.4 – Permitir vincular disciplina ao curso correspondente. | US16 Como administrador, quero vincular disciplinas a cursos, para estruturar o currículo. |
---
| RF05 - Matrículas | RF05.1 – Permitir matrícula de alunos em cursos. | US17 Como administrador, quero matricular alunos em cursos, para registrar sua participação acadêmica. |
| RF05 - Matrículas | RF05.2 – Permitir matrícula em disciplinas por período letivo. | US18 Como administrador, quero matricular alunos em disciplinas por período, para organizar o calendário acadêmico. |
| RF05 - Matrículas | RF05.3 – Impedir matrícula em disciplinas sem pré-requisitos atendidos. | US19 Como administrador, quero que o sistema verifique pré-requisitos antes da matrícula, para evitar inconsistências. |
| RF05 - Matrículas | RF05.4 – Permitir cancelamento de matrícula em disciplinas. | US20 Como administrador, quero cancelar matrículas em disciplinas, para registrar desistências. |
| RF05 - Matrículas | RF05.5 – Registrar histórico de matrículas do aluno. | US21 Como administrador, quero manter o histórico de matrículas do aluno, para consulta futura. |
---
| RF06 - Controle Acadêmico | RF06.1 – Permitir lançamento de notas pelos professores. | US22 Como professor, quero lançar notas dos alunos, para registrar seu desempenho. |
| RF06 - Controle Acadêmico | RF06.2 – Calcular média final automaticamente. | US23 Como sistema, quero calcular médias automaticamente, para agilizar o processo de avaliação. |
| RF06 - Controle Acadêmico | RF06.3 – Indicar situação do aluno (aprovado, reprovado ou recuperação). | US24 Como sistema, quero indicar a situação acadêmica do aluno, para informar seu status. |
| RF06 - Controle Acadêmico | RF06.4 – Permitir consulta do histórico escolar do aluno. | US25 Como aluno, quero consultar meu histórico escolar, para acompanhar meu desempenho. |
---
| RF07 - Emissão de Documentos | RF07.1 – Permitir geração de histórico escolar. | US26 Como administrador, quero emitir histórico escolar, para fornecer documentação oficial. |
| RF07 - Emissão de Documentos | RF07.2 – Permitir emissão de declaração de matrícula. | US27 Como administrador, quero emitir declaração de matrícula, para comprovar vínculo acadêmico. |
| RF07 - Emissão de Documentos | RF07.3 – Permitir emissão de boletim acadêmico. | US28 Como administrador, quero emitir boletim acadêmico, para registrar notas e frequência. |
| RF07 - Emissão de Documentos | RF07.4 – Permitir emissão de certificados ou declarações acadêmicas. | US29 Como administrador, quero emitir certificados ou declarações, para validar conquistas acadêmicas. |


---


## Requisitos Não Funcionais (RNF)


| Requisito | Sub-Requisito | User Story |
|-----------|---------------|------------|
| RNF01 - Responsividade | O sistema deve ser totalmente responsivo (funcionar em celulares, tablets e computadores). | RNF01 Como usuário, quero que o sistema se adapte automaticamente a diferentes tamanhos de tela, para ter navegação fluida e confortável em qualquer dispositivo. |
| RNF02 - Facilidade de Atualização | O conteúdo deve ser fácil de atualizar por administradores. | RNF02 Como administrador, quero que o sistema possua um painel simples e intuitivo, para atualizar informações sem necessidade de conhecimentos técnicos avançados. |
| RNF03 - Tempo de Carregamento | O sistema deve carregar rapidamente (preferência por imagens e consultas otimizadas). | RNF03 Como usuário, quero que o sistema carregue rapidamente, para não perder tempo e ter uma boa experiência de uso. |
| RNF04 - Idiomas | O sistema deve ter versão em português e inglês. | RNF04 Como usuário, quero acessar o sistema em português ou inglês, para facilitar o entendimento por públicos nacionais e internacionais. |
| RNF05 - Segurança | O sistema deve garantir autenticação e autorização adequadas. | RNF05 Como administrador, quero que o sistema tenha autenticação segura e controle de acesso, para proteger dados sensíveis de alunos e professores. |
| RNF06 - Disponibilidade | O sistema deve estar disponível 24/7 com alta confiabilidade. | RNF06 Como usuário, quero que o sistema esteja disponível a qualquer momento, para acessar informações sem interrupções. |
| RNF07 - Escalabilidade | O sistema deve suportar aumento de usuários e dados sem perda de desempenho. | RNF07 Como administrador, quero que o sistema seja escalável, para acompanhar o crescimento da instituição sem falhas. |
| RNF08 - Identidade Visual | O sistema deve seguir identidade visual definida pela instituição. | RNF08 Como usuário, quero que o sistema tenha uma identidade visual consistente, para transmitir profissionalismo e credibilidade. |
---