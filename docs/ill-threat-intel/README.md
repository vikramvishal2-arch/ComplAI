# ILL Malicious Traffic Detection — Deployment Guide

NSP-deployable solution for Internet Leased Line (ILL) threat checking at provider edge (Bharti Airtel, Vodafone Idea, etc.).

## Architecture

```
Enterprise CPE → PE/BNG → Traffic Inspector (TIE) → Policy Engine (PEP)
                              ↓ cache miss
                         Open API Gateway (Kong) → REST API → Threat Intel DB (PostgreSQL)
```

## Quick Start

### 1. Database and seed

```bash
npm run db:push
npm run ill:seed
```

### 2. Start the application

```bash
npm run dev
```

### 3. Optional: Kong gateway + Redis (NSP DMZ simulation)

```bash
docker compose -f docker-compose.yml -f services/ill-threat-intel/docker-compose.ill.yml up -d
```

Kong proxy: `http://localhost:8000`  
Direct API (dev): `http://localhost:3000/api/v1/...`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ILL_THREAT_ENABLED` | `true` | Enable ILL threat module |
| `ILL_INSPECTION_METHOD` | `hybrid_dpi_dns` | Traffic inspection method |
| `ILL_DEFAULT_FAIL_MODE` | `fail_open` | Allow on API failure by default |
| `ILL_API_GATEWAY_KEY` | `ill-dev-gateway-key` | Gateway API key |
| `ILL_CACHE_TTL_SECONDS` | `900` | Edge cache TTL |
| `ILL_SYNC_INTERVAL_MINUTES` | `10` | Feed sync interval |
| `ILL_GATEWAY_RATE_LIMIT` | `1000` | Requests per minute per client |
| `ILL_CLOUD_REGION` | `ap-south-1` | Threat DB cloud region |

## API Endpoints

All endpoints require header: `x-api-key: <ILL_API_GATEWAY_KEY>`

### Threat check

```bash
curl -H "x-api-key: ill-dev-gateway-key" \
  "http://localhost:3000/api/v1/threat-check?ip=203.0.113.45"
```

### Bulk check

```bash
curl -X POST -H "x-api-key: ill-dev-gateway-key" -H "Content-Type: application/json" \
  -d '{"items":[{"ip":"203.0.113.45"},{"url":"http://phish-login.example/steal"}]}' \
  http://localhost:3000/api/v1/bulk-check
```

### Feed sync (edge cache refresh)

```bash
curl -H "x-api-key: ill-dev-gateway-key" \
  "http://localhost:3000/api/v1/feeds/sync?since=2026-01-01T00:00:00Z"
```

### ILL traffic inspect (TIE + PEP)

```bash
curl -X POST -H "x-api-key: ill-dev-gateway-key" -H "Content-Type: application/json" \
  -d '{"circuit_id":"ILL-AIRTEL-DEL-001","src_ip":"10.1.1.50","dest_ip":"203.0.113.45","url":"http://example.com"}' \
  http://localhost:3000/api/v1/ill/inspect
```

### Pilot status

```bash
curl -H "x-api-key: ill-dev-gateway-key" \
  http://localhost:3000/api/v1/ill/pilot/status
```

## Inspection Method

**Hybrid DPI + DNS** (confirmed default):

- **DPI** extracts destination IP, HTTP Host, and TLS SNI from ILL flows at PE/BNG
- **DNS** inspection matches queried/responded domains against the threat intel DB
- **Proxy** optional for enterprise tiers requiring full URL path visibility

## Decision Logic

| Condition | Action |
|-----------|--------|
| IP or URL in blacklist | **BLOCK** — log + SOC alert |
| Not in blacklist | **ALLOW** |
| API timeout + fail_open circuit | **ALLOW** |
| API timeout + fail_closed circuit | **BLOCK** |

## Pilot Circuits (seeded)

| Circuit ID | NSP | POP | Fail Mode |
|------------|-----|-----|-----------|
| ILL-AIRTEL-DEL-001 | airtel | DEL-POP-01 | fail_open |
| ILL-AIRTEL-MUM-002 | airtel | MUM-POP-03 | fail_open |
| ILL-VODAFONE-BLR-003 | vodafone | BLR-POP-02 | fail_closed |

## NSP Production Checklist

- [ ] Deploy PostgreSQL threat intel DB in `ap-south-1` (or NSP private cloud)
- [ ] Configure mTLS between PE security appliance and Kong gateway
- [ ] Connect commercial TI feeds to ingestion pipeline
- [ ] Enable IPSec/MPLS VPN or cloud private link to threat DB
- [ ] Integrate PEP block events with NSP SOC SIEM
- [ ] Set per-circuit fail mode per enterprise SLA
