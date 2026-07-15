# Deploy ComplAI to AWS EC2

Quick path to get the platform running on a single Ubuntu EC2 instance with Docker, Nginx, and HTTPS.

## EC2 instance sizing

| Use case | Instance | Notes |
|----------|----------|-------|
| Demo / pilot | `t3.small` (2 vCPU, 2 GB) | Minimum for app + Postgres |
| Production | `t3.medium`+ | More headroom for concurrent users |

Open inbound ports: **22** (SSH), **80** (HTTP), **443** (HTTPS). Do **not** expose port 3000 publicly — Nginx proxies to `127.0.0.1:3000`.

## One-time server setup

SSH into the instance:

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Clone and bootstrap:

```bash
git clone https://github.com/YOUR_ORG/grc-platform.git /opt/complai
cd /opt/complai
sudo bash deploy/ec2-bootstrap.sh
```

## Configure environment

```bash
cd /opt/complai
cp .env.production.example .env.production
nano .env.production
```

**Required changes:**

| Variable | Example |
|----------|---------|
| `POSTGRES_PASSWORD` | Long random password |
| `APP_URL` | `https://propelreadysolutions.in` |
| `NEXT_PUBLIC_APP_URL` | Same as `APP_URL` |
| `NEXT_PUBLIC_SITE_URL` | Same as `APP_URL` |
| `DEMO_PORTAL_ENABLED` | `true` — require sign-in at `/demo/access` |
| `DEMO_CUSTOMER_EMAIL` / `DEMO_CUSTOMER_PASSWORD` | Customer demo login (seeded by `demo:seed`) |
| `DEMO_ADMIN_EMAIL` / `DEMO_ADMIN_PASSWORD` | Full admin demo login |

## Deploy

```bash
cd /opt/complai
bash deploy/ec2-deploy.sh
```

This will:

1. Build the Docker image (Next.js standalone + Prisma)
2. Start Postgres + app containers
3. Auto-apply schema on app startup (`prisma db push`)
4. Seed demo data (disable with `SEED_ON_DEPLOY=false`)

## Nginx + HTTPS (ComplAI Lab subdomain)

Browsers mark plain **HTTP on port 80** as “Not secure”. Use **HTTPS on port 443** instead.

| Setting | Value |
|---------|--------|
| Brand URL | `https://complAI-Lab.propelreadysolutions.in/` |
| DNS hostname | `complai-lab.propelreadysolutions.in` (DNS is case-insensitive) |
| DNS record | **A** → EC2 public IP |

Open inbound ports **443** (HTTPS) and **80** (redirect + cert renewal) in the EC2 security group.

After DNS points at the instance:

```bash
cd /opt/complai
bash deploy/ec2-https-lab.sh complai-lab.propelreadysolutions.in
```

Your lab URL becomes:

```text
https://complai-lab.propelreadysolutions.in/
https://complai-lab.propelreadysolutions.in/demo/access
```

## Nginx + HTTPS (main site at domain root)

For production at `propelreadysolutions.in` (marketing + app on apex):

## Subsequent updates

After pushing code to GitHub:

```bash
cd /opt/complai
bash deploy/ec2-update.sh
```

## Useful commands

```bash
# Logs
docker compose -f docker-compose.prod.yml logs -f app

# Health
curl -s http://127.0.0.1:3000/api/health

# Re-seed demo data
docker compose -f docker-compose.prod.yml --profile tools run --rm tools prisma/demo-seed.ts

# Stop stack
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (destructive)
docker compose -f docker-compose.prod.yml down -v
```

## Push from your machine

On your dev machine, commit and push:

```bash
git add .
git commit -m "Prepare EC2 deployment"
git push origin main
```

On EC2, run `bash deploy/ec2-update.sh`.

## Pre-push checklist

- [ ] `npm run build` passes locally (or rely on Docker build on EC2)
- [ ] `.env.production` is on the server only — **never commit it**
- [ ] `APP_URL` / `NEXT_PUBLIC_APP_URL` set to production HTTPS URL
- [ ] `public/training-narration/` WAV files committed (for security learning)
- [ ] DNS A record points to EC2 IP
- [ ] `/api/health` returns `{"ok":true}` after deploy

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on EC2 | `docker compose -f docker-compose.prod.yml logs app` |
| 502 from Nginx | App not healthy — wait 90s or check `docker compose ps` |
| Database errors | `docker compose -f docker-compose.prod.yml exec app curl -s http://127.0.0.1:3000/api/health` |
| Agent bundle wrong URL | Set `APP_URL` in `.env.production` and redeploy |

See also [DEPLOYMENT.md](../DEPLOYMENT.md) for Vercel and general DNS guidance.
