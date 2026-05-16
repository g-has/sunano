-- Migration: amplia a lista de categorias aceitas em `peripherals.category`.
--
-- A constraint original (ver ADMIN_SETUP.md) aceitava apenas 6 valores:
--   keyboard, mouse, mousepad, glasspad, iem, headset
--
-- O sistema evoluiu e hoje usa 11 categorias canônicas (ver
-- lib/db-errors.ts → ALLOWED_PERIPHERAL_CATEGORIES e o formulário em
-- app/admin/tierlist/form.tsx → CATEGORIES). As novas categorias são:
--   feet, chairs, monitors, switches, dac_amp
--
-- Esta migration:
--   1) Faz backup das linhas que terão `category` normalizada
--   2) Normaliza variantes que podem ter sido inseridas (singular/plural,
--      pt-BR, abreviações) para a forma canônica
--   3) Recria a CHECK constraint com a lista completa
--
-- Idempotente: pode ser re-executada sem causar inconsistências.

BEGIN;

-- 0) Remove a constraint antiga antes de alterar valores
ALTER TABLE peripherals
  DROP CONSTRAINT IF EXISTS peripherals_category_check;

-- 1) Backup das linhas cuja category será modificada
--    Inclui o valor original para auditoria/rollback manual.
CREATE TABLE IF NOT EXISTS backup_peripherals_category_migration AS
SELECT id, category AS original_category, name, brand, created_at
FROM peripherals
WHERE category IN (
  -- Variantes em pt-BR
  'cadeira', 'cadeiras',
  'pé', 'pés', 'foot',
  -- Singular/plural
  'monitor',
  'switch',
  -- Variantes de DAC/AMP
  'dac', 'amp', 'amplifier', 'amplificador', 'dac-amp', 'dacamp', 'dac/amp',
  -- Espaços ou caixa diferente
  'DAC_AMP', 'DAC/AMP'
)
WITH NO DATA;

INSERT INTO backup_peripherals_category_migration (id, original_category, name, brand, created_at)
SELECT id, category, name, brand, created_at
FROM peripherals
WHERE category IN (
  'cadeira', 'cadeiras',
  'pé', 'pés', 'foot',
  'monitor',
  'switch',
  'dac', 'amp', 'amplifier', 'amplificador', 'dac-amp', 'dacamp', 'dac/amp',
  'DAC_AMP', 'DAC/AMP'
);

-- 2) Normaliza valores existentes para a forma canônica.
--    Usa CASE única para que cada linha seja atualizada no máximo uma vez
--    e LOWER() para tratar diferenças de caixa em variantes DAC/AMP.
UPDATE peripherals
SET category = CASE
  WHEN category IN ('cadeira', 'cadeiras')                                        THEN 'chairs'
  WHEN category IN ('pé', 'pés', 'foot')                                          THEN 'feet'
  WHEN category = 'monitor'                                                       THEN 'monitors'
  WHEN category = 'switch'                                                        THEN 'switches'
  WHEN LOWER(category) IN ('dac', 'amp', 'amplifier', 'amplificador',
                           'dac-amp', 'dacamp', 'dac/amp', 'dac_amp')             THEN 'dac_amp'
  ELSE category
END
WHERE category IN (
  'cadeira', 'cadeiras',
  'pé', 'pés', 'foot',
  'monitor',
  'switch',
  'dac', 'amp', 'amplifier', 'amplificador',
  'dac-amp', 'dacamp', 'dac/amp',
  'DAC_AMP', 'DAC/AMP'
);

-- 3) Sanity check: nenhuma linha pode ter NULL em category (NOT NULL existente)
--    e nenhuma pode estar fora da lista canônica antes de recriar a constraint.
--    Aborta a transação se houver valores fora do esperado.
DO $$
DECLARE
  invalid_count integer;
BEGIN
  SELECT count(*) INTO invalid_count
  FROM peripherals
  WHERE category NOT IN (
    'mouse', 'keyboard', 'mousepad', 'glasspad', 'iem', 'headset',
    'feet', 'chairs', 'monitors', 'switches', 'dac_amp'
  );

  IF invalid_count > 0 THEN
    RAISE EXCEPTION
      'Migração abortada: % linha(s) em peripherals com category fora da lista canônica. '
      'Verifique a tabela peripherals e ajuste manualmente antes de re-executar.',
      invalid_count;
  END IF;
END $$;

-- 4) Recria a CHECK constraint com a lista completa de categorias canônicas
ALTER TABLE peripherals
  ADD CONSTRAINT peripherals_category_check
  CHECK (category IN (
    'mouse', 'keyboard', 'mousepad', 'glasspad', 'iem', 'headset',
    'feet', 'chairs', 'monitors', 'switches', 'dac_amp'
  ));

COMMIT;

-- Consultas úteis para conferência pós-execução:
-- SELECT count(*) FROM backup_peripherals_category_migration;
-- SELECT category, count(*) FROM peripherals GROUP BY category ORDER BY count DESC;
-- SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint
--   WHERE conname = 'peripherals_category_check';

-- Nota: execute este arquivo no Supabase SQL editor ou via psql conectado à sua DB.
