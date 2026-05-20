CREATE TABLE documentos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    curso VARCHAR(50) NOT NULL, -- 'DSM', 'GEO', 'MARH' ou 'GERAL'
    categoria VARCHAR(100),     -- 'Horário', 'Calendário', 'Estágio', 'PPC'
    url_arquivo TEXT NOT NULL,  -- O caminho que salvamos no controller
    ano_referencia INTEGER DEFAULT 2026,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM documentos