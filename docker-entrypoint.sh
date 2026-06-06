#!/bin/sh
set -e

echo "→ Applying database migrations…"
npx prisma migrate deploy

# Seed only when the store is empty (first boot). Never overwrites existing data.
if [ "${SUBLY_SEED:-true}" = "true" ]; then
  echo "→ Seeding if empty…"
  npx tsx prisma/seed-if-empty.ts || echo "  (seed step skipped — continuing)"
fi

echo "→ Starting Subly…"
exec "$@"
