# 🔐 Credenciais de Teste - ABP Portal

## Usuário Administrador
- **Email:** admin@fatec.sp.gov.br
- **Senha:** Admin@123456
- **Perfil:** administrador
- **Acesso:** Rota `/admin` (protegida)

## Usuário Secretaria
- **Email:** secretaria@fatec.sp.gov.br
- **Senha:** Secretaria@123456
- **Perfil:** secretaria
- **Acesso:** Rota `/secretaria` (se houver)

## Fluxo de Teste

### 1. Acesso à Rota Admin sem Login
- Tente acessar: `http://localhost:5173/admin`
- **Resultado esperado:** Redirecionar para `/login`

### 2. Login como Administrador
- Vá para: `http://localhost:5173/login`
- Email: `admin@fatec.sp.gov.br`
- Senha: `Admin@123456`
- **Resultado esperado:** Redirecionar para `/admin` com sucesso

### 3. Acessar Funcionalidade de Edição
- Clique no lápis (✏️) de uma categoria ou pergunta
- Edite o nome e a resposta
- Clique em "Salvar"
- **Resultado esperado:** Modal deve fechar e dados devem atualizar

### 4. Deletar um Item
- Clique no lixo (🗑️) de uma categoria ou pergunta
- Confirme a deleção
- **Resultado esperado:** Item é removido da lista

## API Endpoints Testados

### Editar Tópico (Categoria)
```bash
curl -X PUT http://localhost:3000/api/admin/topicos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "chave": "NOVO_NOME",
    "resposta": "Nova resposta aqui"
  }'
```

### Editar Sub-Opção (Pergunta)
```bash
curl -X PUT http://localhost:3000/api/admin/sub-opcoes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Nova pergunta",
    "conteudo": "Nova resposta"
  }'
```

### Deletar Tópico
```bash
curl -X DELETE http://localhost:3000/api/admin/topicos/1
```

### Deletar Sub-Opção
```bash
curl -X DELETE http://localhost:3000/api/admin/sub-opcoes/1
```

## Status da Implementação

✅ Backend - Endpoints de CRUD implementados
✅ Frontend - Componente PergResp com modais de edição
✅ Frontend - ProtectedRoute criada para proteger /admin
✅ Database - Usuários admin/secretaria inseridos
⏳ Teste completo - Aguardando teste do fluxo

