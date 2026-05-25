-- Inserir usuário administrador
-- Senha: Admin@123456
-- Hash gerado com bcrypt (10 rounds)
INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo, criado_em)
VALUES (
  'Administrador',
  'admin@fatec.sp.gov.br',
  '$2b$10$VPAxU9qsrYjYW2SElJ7P4ukVIque5SwZaIOKgp..rd.0mvEaraH7S', -- Admin@123456
  'administrador',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  nome = EXCLUDED.nome,
  senha_hash = EXCLUDED.senha_hash,
  perfil = EXCLUDED.perfil,
  ativo = EXCLUDED.ativo;

-- Inserir usuário secretaria
INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo, criado_em)
VALUES (
  'Secretaria Acadêmica',
  'secretaria@fatec.sp.gov.br',
  '$2b$10$xsiPgAWwkojO09aVBp1a3e3hpO66uuWeS7wmG.6JzTxm9RqDEXiUy',  -- Secretaria@123456
  'secretaria',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  nome = EXCLUDED.nome,
  senha_hash = EXCLUDED.senha_hash,
  perfil = EXCLUDED.perfil,
  ativo = EXCLUDED.ativo;
