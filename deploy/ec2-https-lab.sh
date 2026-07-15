#!/usr/bin/env bash
# Enable HTTPS for ComplAI Lab on a custom subdomain (no /complAI/Lab path).
# Usage: bash deploy/ec2-https-lab.sh [domain]
#
# Default: complai-lab.propelreadysolutions.in  (brand: ComplAI-Lab)
#
# Prerequisites:
#   - DNS A record for the domain → this EC2 public IP
#   - Security group allows inbound 80 and 443

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/complai}"
DOMAIN="${1:-complai-lab.propelreadysolutions.in}"
# DNS hostnames are case-insensitive; normalize to lowercase for certbot/nginx.
DOMAIN="$(echo "$DOMAIN" | tr '[:upper:]' '[:lower:]')"
PUBLIC_URL="https://${DOMAIN}"
ENV_FILE="${APP_DIR}/.env.production"
NGINX_SITE="complai-lab"
NGINX_SRC="${APP_DIR}/deploy/nginx-complai-lab-root.conf"
NGINX_DEST="/etc/nginx/sites-available/${NGINX_SITE}"

cd "$APP_DIR"

if [ "$(id -u)" -eq 0 ]; then
  echo "Run as ubuntu (not root). Script uses sudo where needed."
  exit 1
fi

echo "==> Installing Nginx site for ComplAI Lab (${DOMAIN})..."
tmp_conf="$(mktemp)"
sed "s/__DOMAIN__/${DOMAIN}/g" "$NGINX_SRC" > "$tmp_conf"

# First install: if cert files don't exist yet, serve HTTP proxy only so certbot can run.
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  cat > "$tmp_conf" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
fi

sudo cp "$tmp_conf" "$NGINX_DEST"
rm -f "$tmp_conf"
sudo ln -sf "$NGINX_DEST" "/etc/nginx/sites-enabled/${NGINX_SITE}"
sudo rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/complai
sudo nginx -t
sudo systemctl reload nginx

echo "==> Requesting TLS certificate for ${DOMAIN}..."
if ! sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect; then
  echo ""
  echo "Certbot failed. Ensure:"
  echo "  - AWS security group allows inbound 80 and 443"
  echo "  - DNS A record for ${DOMAIN} points to this server's public IP"
  echo "  - Check: dig +short ${DOMAIN}"
  exit 1
fi

# Re-apply templated HTTPS conf so proxy settings stay correct after certbot edits.
tmp_conf="$(mktemp)"
sed "s/__DOMAIN__/${DOMAIN}/g" "$NGINX_SRC" > "$tmp_conf"
sudo cp "$tmp_conf" "$NGINX_DEST"
rm -f "$tmp_conf"
sudo nginx -t
sudo systemctl reload nginx

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
  else
    echo "KIBANA_PUBLIC_URL=https://${DOMAIN}:5601" >> "$ENV_FILE"
  fi
fi

echo "==> Rebuilding app with updated NEXT_PUBLIC_* URLs..."
bash deploy/ec2-deploy.sh

echo ""
echo "ComplAI Lab is live at:"
echo "  ${PUBLIC_URL}/"
echo "  ${PUBLIC_URL}/demo/access"
echo ""
echo "DNS hostname: ${DOMAIN}"
echo "Brand label:  ComplAI-Lab.propelreadysolutions.in"
