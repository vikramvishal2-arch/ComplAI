# Deploy ComplAI to https://propelreadysolutions.in

Your domain currently shows a **"Launching Soon"** placeholder. This guide replaces it with the ComplAI marketing site (and optional full GRC app on the same deployment).

## What you are deploying

| URL | Content |
|-----|---------|
| `https://propelreadysolutions.in/` | Marketing site (Platform, Solutions, Resources, Company) |
| `https://propelreadysolutions.in/dashboard` | ComplAI app (requires PostgreSQL) |
| `https://propelreadysolutions.in/api/contact` | Contact form (requires PostgreSQL) |

The contact form saves enquiries to PostgreSQL, so you need a database even for a marketing launch.

---

## Recommended: Vercel + Neon (fastest, no server admin)

Best if you want HTTPS, auto-deploys, and minimal DevOps.

### Step 1 — Push code to GitHub

```bash
cd grc-platform
git init
git add .
git commit -m "Initial ComplAI deployment"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/grc-platform.git
git push -u origin main
```

### Step 2 — Create a PostgreSQL database (Neon)

1. Go to [https://neon.tech](https://neon.tech) and create a free project.
2. Copy the **connection string** (starts with `postgresql://...`).
3. In the Neon SQL console, you do not need to create tables manually — Prisma will push the schema.

### Step 3 — Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo.
2. **Framework preset:** Next.js (auto-detected).
3. **Environment variables** (Project → Settings → Environment Variables):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `NEXT_PUBLIC_INTEGRATION_HELP_BASE_URL` | `https://propelreadysolutions.in/help/integrations` |
| `AI_ENABLED` | `false` (for marketing launch) |

4. Click **Deploy**.

### Step 4 — Initialize the database

After the first deploy, run locally (or use Vercel CLI):

```bash
# Set DATABASE_URL to the same Neon URL, then:
npx prisma db push
npx tsx prisma/seed.ts
```

Or add a one-time **Build Command** override is not ideal — run `db push` from your machine once against the production `DATABASE_URL`.

### Step 5 — Connect propelreadysolutions.in

In **Vercel → Project → Settings → Domains**, add:

- `propelreadysolutions.in`
- `www.propelreadysolutions.in`

Vercel shows the DNS records to add. At your domain registrar (GoDaddy, Hostinger, Namecheap, etc.):

| Type | Name | Value |
|------|------|-------|
| `A` | `@` | `76.76.21.21` (Vercel IP — confirm in Vercel UI) |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Remove any old **parking page** or **"Launching Soon"** A/CNAME records.

SSL is automatic on Vercel (usually live within minutes).

---

## Alternative: VPS + Docker (full control)

Use this if you already have a Linux server (AWS EC2, DigitalOcean, Hostinger VPS, etc.).

### Requirements

- Ubuntu 22.04+ (or similar)
- Docker & Docker Compose
- Ports 80 and 443 open

### Step 1 — Copy project to the server

```bash
git clone https://github.com/YOUR_ORG/grc-platform.git
cd grc-platform
cp .env.production.example .env.production
# Edit .env.production — set POSTGRES_PASSWORD and other values
nano .env.production
```

### Step 2 — Build and start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml exec app npx prisma db push
docker compose -f docker-compose.prod.yml exec app npx tsx prisma/seed.ts
```

The app listens on `127.0.0.1:3000` on the server.

### Step 3 — Nginx + HTTPS

```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx-propelsite.conf /etc/nginx/sites-available/propelreadysolutions.in
sudo ln -sf /etc/nginx/sites-available/propelreadysolutions.in /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d propelreadysolutions.in -d www.propelreadysolutions.in
```

### Step 4 — DNS at your registrar

Point the domain to your VPS **public IP**:

| Type | Name | Value |
|------|------|-------|
| `A` | `@` | Your VPS IP |
| `A` or `CNAME` | `www` | Your VPS IP or `@` |

---

## Optional: split marketing and app

| Subdomain | Purpose |
|-----------|---------|
| `propelreadysolutions.in` | Marketing only |
| `app.propelreadysolutions.in` | ComplAI dashboard |

Both can run on the **same** Vercel project or VPS — no code split required. Add `app.propelreadysolutions.in` as an extra domain in Vercel/nginx.

---

## Pre-launch checklist

- [ ] `DATABASE_URL` set and `prisma db push` run on production DB
- [ ] Contact form tested at `/company?contact=1`
- [ ] DNS propagated (`nslookup propelreadysolutions.in`)
- [ ] HTTPS working (padlock in browser)
- [ ] Old "Launching Soon" page removed from registrar parking

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Contact form returns 503 | Run `npx prisma db push` on production database |
| Site still shows "Launching Soon" | DNS still points to registrar parking — update A/CNAME to Vercel or VPS |
| Build fails on Vercel | Ensure `postinstall` script runs; check build logs for Prisma errors |
| `EPERM` on Windows during deploy prep | Normal locally — production Linux/Vercel builds do not hit this |

---

## Need help with a specific step?

Tell us:

1. Where you bought **propelreadysolutions.in** (registrar name)
2. Whether you prefer **Vercel** (managed) or a **VPS** you already have
3. Whether the first launch is **marketing only** or **marketing + app**

We can then give registrar-specific DNS screenshots and exact values.
