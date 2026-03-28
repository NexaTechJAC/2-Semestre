# Requisitos e User Stories


## Requisitos Funcionais (RF)


| Requisito | Sub-Requisito | User Story |
|-----------|---------------|------------|
| RF01 - Navegação Conversacional | Disponibilizar menus e submenus hierárquicos em modelo de chatbot. | US01 Como aluno, quero navegar por menus e perguntas guiadas, para encontrar informações de forma simples e rápida. |
| RF02 - Repositório de Conhecimento | Manter repositório estruturado com perguntas, respostas, documentos oficiais e trechos indexados. | US02 Como administrador, quero organizar perguntas e documentos em um repositório, para garantir respostas padronizadas e confiáveis |
| RF03 - Perfis de Usuário | Definir perfis: Aluno (público), Secretária Acadêmica (autenticado), Administrador (autenticado). | US03 Como administrador, quero gerenciar perfis de acesso, para controlar permissões e responsabilidades. |
| RF04 - Gestão de Conteúdo (Administrador) | Criar, editar e excluir nós de navegação; gerenciar documentos e usuários; visualizar logs. | US04 Como administrador, quero gerenciar menus e documentos, para manter o sistema atualizado. |
| RF05 - Encaminhamento de Perguntas | Permitir envio de dúvidas à Secretaria Acadêmica com texto e e-mail institucional. | US05 Como aluno, quero enviar minha dúvida à secretaria, para receber resposta oficial |
| RF06 - Gestão de Perguntas (Secretária Acadêmica) | Listar e atualizar status das perguntas (em aberto, respondida). | US06 Como secretária, quero gerenciar perguntas recebidas, para acompanhar e responder solicitações. |
| RF07 - Avaliação de Satisfação | Permitir registro de satisfação ("Gostei"/"Não gostei"). | US07 Como aluno, quero avaliar o atendimento, para melhorar a qualidade do serviço. |
| RF08 - Registro de Logs | Registrar fluxo de navegação, perguntas enviadas, satisfação e data/hora. | US08 Como administrador, quero acessar os logs, para monitorar o uso do sistema. |
| RF09 - Autenticação | Implementar login e senha para perfis autenticados | US09 Como secretária, quero acessar o sistema com login e senha, para garantir segurança. |
| RF10 - Autorização por Papel (RBAC) | Controlar acesso baseado em papéis. | US10 Como administrador, quero que apenas perfis autorizados acessem rotas administrativas, para proteger dados. |
| RF11 - Proteção de Rotas | Middleware de autenticação e autorização com validação de token. | US11 Como sistema, quero validar tokens antes de liberar acesso, para garantir segurança. |
---

## Requisitos Não Funcionais (RNF)


| Requisito | Sub-Requisito | User Story |
|-----------|---------------|------------|
| RNF01 - Usabilidade e Responsividade | Interface simples, clara e responsiva para web e mobile. | US12 Como aluno, quero acessar o sistema em qualquer dispositivo, para ter praticidade. |
| RNF02 - Desempenho | Respostas rápidas, incluindo consultas ao banco e recuperação de documentos. | US13 Como usuário, quero que o sistema responda rapidamente, para não perder tempo. |
| RNF03 - Documentação Técnica | Incluir visão geral, modelo de dados, arquitetura, instruções de execução e rotas da API. | US14 Como desenvolvedor, quero ter documentação completa, para facilitar manutenção e evolução. |
| RNF04 - Modelagem UML | Incluir casos de uso, classes, sequência e componentes. | US15 Como desenvolvedor, quero diagramas UML, para entender melhor o sistema. |
| RNF05 - Containerização | Executar via Docker com PostgreSQL, Backend e Frontend. | US16 Como administrador, quero rodar o sistema em containers, para facilitar implantação. |
| RNF06 - Orquestração | Utilizar Docker Compose para inicialização única. | US17 Como administrador, quero subir todo o ambiente com um comando, para simplificar configuração |
| RNF07 - Documentação do Repositório | README principal e específicos em cada pasta, com estrutura e instruções. | US18 Como usuário, quero encontrar documentação clara no repositório, para entender o projeto. |
| RNF08 - Autenticação com JWT | Token com identificador, papel e expiração. | US19 Como sistema, quero autenticar via JWT, para garantir segurança. |
| RNF09 - Segurança | Hash seguro de senhas, variáveis de ambiente, expiração de token e proteção de dados. | US20 Como administrador, quero que o sistema siga boas práticas de segurança, para proteger informações. |
---