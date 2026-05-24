-- Migration: adiciona coluna sub_opcao_id na tabela documentos
-- Permite vincular um documento diretamente a uma sub-opção

ALTER TABLE documentos
  ADD COLUMN IF NOT EXISTS sub_opcao_id INTEGER REFERENCES sub_opcoes(id) ON DELETE SET NULL;

-- Índice para facilitar buscas por sub-opção
CREATE INDEX IF NOT EXISTS idx_documentos_sub_opcao_id ON documentos(sub_opcao_id);
