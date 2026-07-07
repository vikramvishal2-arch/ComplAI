#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "[entrypoint] Applying database schema..."
  node ./node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss=false 2>/dev/null \
    || node ./node_modules/prisma/build/index.js db push --skip-generate
fi

echo "[entrypoint] Starting ComplAI..."
exec "$@"
