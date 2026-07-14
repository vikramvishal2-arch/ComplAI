#!/usr/bin/env bash
# Fast update on EC2 after code changes (pull + rebuild app only)
# Usage: bash deploy/ec2-update.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/complai}"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

cd "$APP_DIR"

echo "==> Pulling latest..."
git pull --ff-only

echo "==> Applying database schema..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile tools build tools
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile tools run --rm --entrypoint npx tools prisma db push --skip-generate

echo "==> Rebuilding app container..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build app

echo "==> Waiting for health (up to ~3 min after rebuild)..."
for i in $(seq 1 36); do
  if curl -sf http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
    echo "Update complete — app is healthy."
    curl -s http://127.0.0.1:3000/api/health
    echo ""
    exit 0
  fi
  sleep 5
done

echo "WARN: Health check timed out. The app may still be starting."
echo "Check: curl -s http://127.0.0.1:3000/api/health"
echo "Logs:  docker compose -f $COMPOSE_FILE --env-file $ENV_FILE logs app --tail 100"
exit 1
