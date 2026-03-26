#!/bin/sh
# QFSE Backend Entrypoint
# - Waits for PostgreSQL to be ready
# - Runs Prisma migrations (idempotent)
# - Seeds database if empty
# - Starts the Express server

set -e

echo "[QFSE] Waiting for PostgreSQL..."
until npx prisma db execute --stdin <<'SQL'
SELECT 1;
SQL
do
  echo "[QFSE]   PostgreSQL not ready — retrying in 2s..."
  sleep 2
done
echo "[QFSE] PostgreSQL ready."

echo "[QFSE] Running migrations..."
npx prisma migrate deploy
echo "[QFSE] Migrations complete."

echo "[QFSE] Checking if seed is needed..."
CUSTOMER_COUNT=$(npx prisma db execute --stdin <<'SQL'
SELECT COUNT(*)::text FROM "Customer";
SQL
)

if echo "$CUSTOMER_COUNT" | grep -q "^0$\| 0 "; then
  echo "[QFSE] Seeding database (first boot)..."
  node -e "require('./dist/prisma/seed.js')" 2>/dev/null || \
  npx tsx prisma/seed.ts
  echo "[QFSE] Seed complete."
else
  echo "[QFSE] Database already seeded — skipping."
fi

echo "[QFSE] Starting QFSE Backend..."
exec node dist/index.js
