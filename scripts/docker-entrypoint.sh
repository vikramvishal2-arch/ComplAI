#!/bin/sh
set -e
echo "[entrypoint] Starting ComplAI..."

if [ -f ./prisma/schema.prisma ] && [ -d ./node_modules/prisma ]; then
  echo "[entrypoint] Ensuring database schema..."
  npx prisma db push --skip-generate || echo "[entrypoint] WARN: prisma db push failed (continuing)"
fi

exec "$@"
