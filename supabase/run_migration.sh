#!/usr/bin/env bash
set -euo pipefail

# Helper para executar a migração SQL criada em supabase/migrations/
SQL_FILE="$(dirname "$0")/migrations/20260507_migrate_tiers.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "Arquivo SQL não encontrado: $SQL_FILE"
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Variável DATABASE_URL não definida. Exemplo:"
  echo "  export DATABASE_URL=\"postgresql://user:pass@host:5432/dbname\""
  exit 1
fi

echo "Executando migração: $SQL_FILE"
psql "$DATABASE_URL" -f "$SQL_FILE"

echo "Migração finalizada. Verifique logs e confirmações no banco."
