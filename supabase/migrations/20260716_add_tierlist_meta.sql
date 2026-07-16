-- Conteúdo editável do painel "Informações da Tierlist" (aba "Última Atualização").
-- Linha única (id fixo = 1); leitura é feita pela página pública, escrita pelo admin.
CREATE TABLE IF NOT EXISTS tierlist_meta (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  latest_update_month text NOT NULL DEFAULT '',
  latest_update_description text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO tierlist_meta (id, latest_update_month, latest_update_description)
VALUES (1, 'Abril 2026', 'As listas são atualizadas continuamente com novos lançamentos, revisões de firmware e mudanças de preço.')
ON CONFLICT (id) DO NOTHING;
