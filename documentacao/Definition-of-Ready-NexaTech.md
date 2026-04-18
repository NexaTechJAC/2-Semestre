# Definition of Ready (DoR) - NexaTech

Este documento define os critérios que uma User Story ou tarefa deve atender antes de ser incluída em uma Sprint (coluna "To Do").

---

## 1. Descrição e Contexto
- [ ] **Título Claro:** A tarefa possui um título objetivo que resume a funcionalidade.
- [ ] **User Story Estruturada:** A funcionalidade segue o formato: "Como [perfil], quero [ação], para [valor de negócio]".
- [ ] **Critérios de Aceite:** A tarefa lista exatamente o que será testado para ser aprovada (ex: "O botão deve abrir um modal", "A senha deve ser criptografada").

## 2. Requisitos de Design (Figma)
- [ ] **Protótipo Visual:** O design da interface no Figma está finalizado e o link está acessível na tarefa.
- [ ] **Fluxo de Navegação:** Para o chatbot, o nó da árvore de decisão correspondente está mapeado (quem é o pai e quais são os filhos do nó).

## 3. Requisitos Técnicos e Dados
- [ ] **Modelo de Dados:** Se a tarefa exige persistência, as tabelas e colunas necessárias no PostgreSQL já foram identificadas (conforme o diagrama de BD).
- [ ] **Definição de API:** Para tarefas de Backend, os endpoints (URL, Método HTTP e Formato do JSON) já estão definidos.
- [ ] **Dependências:** Todas as dependências externas ou de outras tarefas foram resolvidas (ex: "Para fazer o RF06, o banco do RF02 já deve estar pronto").

## 4. Estimativa e Divisão
- [ ] **Tamanho Adequado:** A tarefa é pequena o suficiente para ser completada dentro de uma única Sprint. Caso contrário, foi dividida em subtarefas.
- [ ] **Esforço Estimado:** A equipe discutiu e concorda com o nível de complexidade da tarefa.

## 5. Infraestrutura (Docker)
- [ ] **Ambiente:** A tarefa pode ser desenvolvida e testada localmente utilizando o ambiente atual do `docker-compose`.

---