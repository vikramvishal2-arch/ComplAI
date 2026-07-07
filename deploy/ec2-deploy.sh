#!/usr/bin/env bash
# Build and start ComplAI on EC2 (first deploy or full rebuild)
# Usage: bash deploy/ec2-deploy.sh [git-repo-url]

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/complai}"
REPO_URL="${1:-}"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

cd "$APP_DIR"

if [ -n "$REPO_URL" ] && [ ! -d .git ]; then
  echo "==> Cloning $REPO_URL into $APP_DIR..."
  git clone "$REPO_URL" .
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $APP_DIR/$ENV_FILE not found."
  echo "Copy and edit: cp .env.production.example .env.production"
  exit 1
fi

# shellcheck disable=SC1090
set -a && source "$ENV_FILE" && set +a

if [ -z "${POSTGRES_PASSWORD:-}" ] || [ "$POSTGRES_PASSWORD" = "change-me-to-a-long-random-password" ]; then
  echo "ERROR: Set a strong POSTGRES_PASSWORD in $ENV_FILE"
  exit 1
fi

if [ -z "${APP_URL:-}" ] || [ "$APP_URL" = "http://localhost:3000" ]; then
  echo "WARN: Set APP_URL and NEXT_PUBLIC_APP_URL to your public HTTPS URL in $ENV_FILE"
fi

echo "==> Pulling latest code..."
if [ -d .git ]; then
  git pull --ff-only
fi

echo "==> Building and starting containers..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

echo "==> Waiting for app health..."
for i in $(seq 1 30); do
  if docker compose -f "$COMPOSE_FILE" exec -T app curl -sf http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
    echo "App is healthy."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "WARN: Health check timed out. Check logs: docker compose -f $COMPOSE_FILE logs app"
  fi
  sleep 5
done

if [ "${SEED_ON_DEPLOY:-true}" = "true" ]; then
  echo "==> Seeding demo data (set SEED_ON_DEPLOY=false to skip)..."
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile tools run --rm tools prisma/demo-seed.ts \
    || docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile tools run --rm tools prisma/seed.ts
fi

echo ""
echo "Deploy complete."
echo "  App (local):  http://127.0.0.1:3000"
echo "  Health:       http://127.0.0.1:3000/api/health"
echo "  Logs:         docker compose -f $COMPOSE_FILE logs -f app"
echo ""
echo "Configure Nginx + TLS:"
echo "  sudo cp deploy/nginx-propelsite.conf /etc/nginx/sites-available/propelreadysolutions.in"
echo "  sudo ln -sf /etc/nginx/sites-available/propelreadysolutions.in /etc/nginx/sites-enabled/"
echo "  sudo nginx -t && sudo systemctl reload nginx"
echo "  sudo certbot --nginx -d propelreadysolutions.in -d www.propelreadysolutions.in"
