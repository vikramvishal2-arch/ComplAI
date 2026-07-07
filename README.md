# ComplAI — GRC Compliance Platform



A platform for governance, risk, and compliance (GRC) — with broad framework coverage and **customer-defined compliance** for each control.



Built for **Propel Ready Solutions**.



## What's included



- **SOC 2 Type II**: **61 controls** — full Trust Services Criteria (Common Criteria CC1–CC9, Availability, Confidentiality, Processing Integrity, Privacy)

- **ISO/IEC 27001:2022**: **93 controls** — complete Annex A catalog

- **India DPDP Act 2023**: **25 controls** — Digital Personal Data Protection Act + DPDP Rules 2025

- **Middle East & GCC Privacy**: **28 controls** — UAE PDPL, KSA PDPL, Qatar, Bahrain, Oman, and Jordan

- **Google Security Operations (Chronicle)**: **24 controls** — SIEM ingestion, detection, investigation, response

- **24 security & privacy frameworks** (SOC 2, ISO 27001, GDPR, Chronicle, HIPAA, India DPDP, SEBI CSCRF, ME Privacy, DORA, NIS2, and more)

- Both SOC 2 and ISO 27001 are **enabled by default** for every customer tenant

- **Per-control compliance planning**: customers choose *how* they comply (policy, technical control, procedure, training, etc.)

- **Remediation workflows** with action items, links, and access-control integration placeholders

- **Implementation approach** narrative for audit readiness

- **Framework activation** — enable only what each customer needs

- **Dashboard** with readiness metrics

- **Compliance export** (JSON / CSV) for auditors

- **Intelligence hub** — AI copilot, gap analysis, questionnaire auto-fill

- **Continuous monitoring** — AWS & Azure lab checks mapped to SOC 2 / ISO controls

- **Vendor risk** — third-party register with AI-assisted questionnaires

- **PostgreSQL persistence** — compliance, remediation, and framework activations survive restarts



## Quick start



### 1. Install dependencies



```bash

cd grc-platform

npm install --legacy-peer-deps

```



### 2. Start PostgreSQL (localhost)



**Option A — Docker (recommended)**



Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), then:



```bash

npm run db:up      # starts postgres:16 on localhost:5432

npm run db:setup   # creates tables + seeds default org

```



Or use the helper script on Windows:



```powershell

.\scripts\setup-db.ps1

```



**Option B — Native PostgreSQL**



Install PostgreSQL 16 locally, then create the database and user:



```sql

CREATE USER grc WITH PASSWORD 'grc_dev_password';

CREATE DATABASE grc_platform OWNER grc;

```



Copy `.env.example` to `.env` (already configured for localhost):



```

DATABASE_URL="postgresql://grc:grc_dev_password@localhost:5432/grc_platform?schema=public"

```



Then run:



```bash

npm run db:setup

```



### 3. Run the app



```bash

npm run dev

```



Open [http://localhost:3000](http://localhost:3000)



## Database commands



| Command | Description |

|---------|-------------|

| `npm run db:up` | Start PostgreSQL via Docker Compose |

| `npm run db:down` | Stop PostgreSQL container |

| `npm run db:push` | Apply Prisma schema to the database |

| `npm run db:generate` | Regenerate Prisma client (run after `db:push` if dev server was stopped) |

| `npm run db:seed` | Seed default organization + sample data |

| `npm run db:setup` | `db:push` + `db:seed` |

| `npm run db:studio` | Open Prisma Studio (DB browser) |



### `db:push` troubleshooting (Windows)



Run these from the **`grc-platform`** folder (where `package.json` lives):



```cmd
cd C:\Users\Vikram Vishal\Projects\grc-platform
npm run db:push
```



**Can't reach database / `P1001`** — PostgreSQL is not running:



```cmd
npm run db:up
```



(Ensure Docker Desktop is running first.)



**`EPERM: operation not permitted, rename ... query_engine-windows.dll.node`** — the dev server (`npm run dev`) is locking Prisma files. Either:



1. Stop the dev server (Ctrl+C in that terminal), then run `npm run db:push`, or  
2. Ignore the warning if you see **“The database is now in sync”** — tables were updated; restart `npm run dev` to refresh the client.



## Key flows



1. **Framework Library** → Browse 26 frameworks → Activate the ones you need (SOC 2, ISO 27001, ISO 22301, ISO 31000, Chronicle, SEBI CSCRF, ME Privacy, HIPAA, …)

2. **Controls** → Filter by framework/status → Open any control

3. **Control detail** → Compliance tab: method + implementation approach; Remediation tab: action items + access integrations

4. **Dashboard** → Track overall and per-framework readiness

5. **Settings** → Export compliance plans as JSON or CSV

6. **Intelligence** → Gap analysis, AI copilot, questionnaire auto-fill



## Intelligence (AI)



Open **Intelligence** in the sidebar (`/intelligence`).



| Capability | Status | Config |
|------------|--------|--------|
| Policy & evidence gap analysis | Active (no API key) | — |
| Security questionnaire auto-fill | Active (rule-based) | Optional `OPENAI_API_KEY` for AI polish |
| AI Copilot | Requires API key | `OPENAI_API_KEY` in `.env` |
| AI remediation suggestions | Requires API key | `OPENAI_API_KEY` |
| Google Chronicle intelligence | Active (framework-based) | Optional `CHRONICLE_*` env vars |
| Continuous cloud monitoring | Roadmap | — |
| AI vendor risk assessments | Roadmap | — |



Copy `.env.example` to `.env` and set `OPENAI_API_KEY` for full AI features.



## Customer value proposition



Unlike rigid checklist tools, **ComplAI lets each customer decide how they satisfy every control**:



| Field | Purpose |

|-------|---------|

| Compliance method | Policy, technical control, SOP, training, third-party attestation, custom, etc. |

| Implementation approach | Audit narrative — tools, processes, teams |

| Owner & target date | Accountability |

| Evidence notes | What proof will be collected |

| N/A justification | When a control doesn't apply |



## Architecture



- **Frontend**: Next.js 16, TypeScript, Tailwind CSS

- **Backend**: Next.js API routes

- **Database**: PostgreSQL 16 (Docker) + Prisma ORM

- **Data**: Framework/control seed library in `src/lib/data/`; tenant state in Postgres



### Database schema



- `organizations` — tenant (single default org)

- `framework_activations` — which frameworks are enabled

- `control_compliance` — per-control compliance plans

- `control_remediations` — remediation actions + access connections (JSON)



## Next phase (roadmap)



- Multi-tenant auth (SSO)

- Evidence file upload

- Unified Control Framework (UCF) cross-mapping UI

- Automated integrations and continuous monitoring

- Auditor portal with read-only access



## AWS / Azure lab monitoring



Enable read-only cloud checks from **Intelligence → Monitoring** or `POST /api/monitoring/run`.



### AWS



```env
AWS_MONITOR_ENABLED=true
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```



Recommended IAM policy (read-only): `iam:List*`, `iam:GetAccountPasswordPolicy`, `iam:GetAccountSummary`, `cloudtrail:DescribeTrails`, `cloudtrail:GetTrailStatus`, `s3:ListAllMyBuckets`, `s3:GetPublicAccessBlock`, `s3:GetBucketPolicyStatus`.



### Azure



Create a service principal with **Reader** and **Security Reader** on the subscription:



```env
AZURE_MONITOR_ENABLED=true
AZURE_SUBSCRIPTION_ID=...
AZURE_TENANT_ID=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
```



After schema changes, run `npm run db:push` before starting the dev server.



## Customer demo (live walkthroughs)

Use this flow when sharing ComplAI with prospects — either on a call or via a password-protected link.

### 1. Prepare demo data

```bash
npm run db:setup    # first time only
npm run demo:seed   # rich sample org: Acme Industries (Demo)
```

Reset between customer sessions:

```bash
npm run demo:reset
```

### 2. Password-protect the app (recommended for hosted demos)

In `.env` or `.env.production`:

```bash
DEMO_ACCESS_PASSWORD=your-shared-demo-password
NEXT_PUBLIC_DEMO_MODE=true   # shows demo banner; rebuild after changing
```

Marketing pages stay public. App routes (`/dashboard`, `/controls`, `/audits`, etc.) require the password via `/demo/access`.

### 3. Suggested 15-minute walkthrough

1. **Leadership** (`/dashboard`) — readiness RAG and attention items  
2. **Controls** (`/controls`) — open CC6.1, show compliance + remediation + evidence  
3. **Policies** (`/policies`) — ISMS policy and approval workflow  
4. **Audits** → Risk assessment — click a row for gap detail  
5. **Vendors** — third-party register and AI assessment scores  
6. **Intelligence** — gap analysis (if AI enabled)

Share the demo entry link: `/demo/access` (or **Try live demo** on the marketing site).

### 4. Docker demo host

See comments in `docker-compose.prod.yml`. After `up --build`, run `db push` and `demo:seed`. Set `DEMO_ACCESS_PASSWORD` and rebuild with `NEXT_PUBLIC_DEMO_MODE=true`.

---

## Project structure



```

grc-platform/

├── docker-compose.yml

├── prisma/

│   ├── schema.prisma

│   └── seed.ts

├── src/

│   ├── app/

│   │   ├── dashboard/

│   │   ├── frameworks/

│   │   ├── controls/

│   │   ├── settings/

│   │   └── api/

│   ├── components/

│   └── lib/

│       ├── data/       # Framework & control library

│       ├── db/         # Prisma client + repository

│       ├── store.ts    # Re-exports db repository

│       └── types.ts

```


