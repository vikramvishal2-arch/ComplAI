#!/usr/bin/env bash
# First-time EC2 host setup (Ubuntu 22.04+)
# Run as root or with sudo: bash deploy/ec2-bootstrap.sh

set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo: sudo bash deploy/ec2-bootstrap.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> Updating packages..."
apt-get update -y
apt-get upgrade -y

echo "==> Installing Docker..."
if ! command -v docker >/dev/null 2>&1; then
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

systemctl enable docker
systemctl start docker

echo "==> Installing Nginx + Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx git ufw

echo "==> Configuring firewall (SSH, HTTP, HTTPS)..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Creating app directory..."
mkdir -p /opt/complai
chown -R "${SUDO_USER:-ubuntu}:docker" /opt/complai 2>/dev/null || true

echo ""
echo "Bootstrap complete."
echo "Next steps:"
echo "  1. Clone the repo into /opt/complai (or use deploy/ec2-deploy.sh)"
echo "  2. cp .env.production.example .env.production && nano .env.production"
echo "  3. bash deploy/ec2-deploy.sh"
