# Definition of Done (DoD) - NexaTech

Este documento estabelece os critérios obrigatórios para que uma funcionalidade seja considerada concluída e pronta para entrega.

---

## 1. Requisitos de Código e Qualidade
- [ ] **TypeScript:** Código 100% tipado, sem o uso de `any`, tanto no Frontend quanto no Backend.
- [ ] **Arquitetura:** Backend estruturado seguindo padrões de organização (MVC/Clean Architecture) para facilitar a manutenção.
- [ ] **Segurança (Backend):** - Senhas armazenadas com hash seguro (bcrypt).
    - Variáveis sensíveis configuradas via `.env`.
    - Rotas protegidas com Middleware de autenticação JWT e verificação de nível de acesso (RBAC).

## 2. Banco de Dados (PostgreSQL)
- [ ] **Persistência:** Scripts DDL/DML atualizados e testados conforme o diagrama de classes.
- [ ] **Integridade:** Consultas respeitando as chaves estrangeiras (FKs) e relacionamentos entre tabelas 

## 3. Frontend e Experiência do Usuário (UX/UI)
- [ ] **Fidelidade ao Design:** Interface implementada rigorosamente conforme o protótipo do Figma.
- [ ] **Responsividade:** Testado e funcional em resoluções Desktop e Mobile.
- [ ] **Feedback ao Usuário:** Exibição clara de estados de carregamento (loading), sucesso e tratamento de erros.

## 4. Infraestrutura e Docker
- [ ] **Containerização:** Dockerfile configurado corretamente para o serviço em questão.
- [ ] **Orquestração:** Testado via `docker-compose up`, garantindo comunicação entre Banco, API e Web.

## 5. Documentação Técnica
- [ ] **API:** Rotas documentadas (Swagger ou Markdown) especificando métodos, parâmetros e retornos.
- [ ] **Diagramas:** Atualização dos diagramas UML (Sequência/Classes) se a funcionalidade alterar a lógica do sistema.
- [ ] **Repositório:** README local atualizado com instruções de execução específicas, se houver.

## 6. Validação de Entrega
- [ ] **Code Review:** Pull Request revisado e aprovado por pelo menos um membro do grupo.
- [ ] **Demo:** Funcionalidade apresentada e validada dentro do fluxo principal do chatbot.

---