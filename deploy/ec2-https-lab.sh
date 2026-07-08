#!/usr/bin/env bash
# Enable HTTPS and serve ComplAI at /complAI/Lab on EC2.
# Usage: bash deploy/ec2-https-lab.sh [domain]
#
# Examples:
#   bash deploy/ec2-https-lab.sh 13-233-254-149.sslip.io
#   bash deploy/ec2-https-lab.sh lab.propelreadysolutions.in

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/complai}"
DOMAIN="${1:-13-233-254-149.sslip.io}"
LAB_PATH="/complAI/Lab"
PUBLIC_URL="https://${DOMAIN}${LAB_PATH}"
ENV_FILE="${APP_DIR}/.env.production"

cd "$APP_DIR"

if [ "$(id -u)" -eq 0 ]; then
  echo "Run as ubuntu (not root). Script uses sudo where needed."
  exit 1
fi

echo "==> Installing Nginx site for ComplAI Lab..."
sudo cp deploy/nginx-complai-lab.conf /etc/nginx/sites-available/complai-lab
sudo ln -sf /etc/nginx/sites-available/complai-lab /etc/nginx/sites-enabled/complai-lab
sudo rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/complai
sudo nginx -t
sudo systemctl reload nginx

echo "==> Requesting TLS certificate for ${DOMAIN}..."
if ! sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect; then
  echo ""
  echo "Certbot failed. Ensure:"
  echo "  - AWS security group allows inbound 80 and 443"
  echo "  - DNS A record for ${DOMAIN} points to this server (if not using sslip.io)"
  exit 1
fi

if [ -f "$ENV_FILE" ]; then
  echo "==> Updating public URLs in .env.production..."
  for key in APP_URL NEXT_PUBLIC_APP_URL NEXT_PUBLIC_SITE_URL; do
    if grep -q "^${key}=" "$ENV_FILE"; then
      sed -i "s|^${key}=.*|${key}=${PUBLIC_URL}|" "$ENV_FILE"
    else
      echo "${key}=${PUBLIC_URL}" >> "$ENV_FILE"
    fi
  done
  if grep -q "^KIBANA_PUBLIC_URL=" "$ENV_FILE"; then
    sed -i "s|^KIBANA_PUBLIC_URL=.*|KIBANA_PUBLIC_URL=https://${DOMAIN}:5601|" "$ENV_FILE"
  fi
fi

echo "==> Rebuilding app with updated NEXT_PUBLIC_* URLs..."
bash deploy/ec2-deploy.sh

echo ""
echo "ComplAI Lab is live at:"
echo "  ${PUBLIC_URL}/"
echo ""
echo "Old http://${DOMAIN}/ and http://13.233.254.149/ redirect to HTTPS + ${LAB_PATH}."
