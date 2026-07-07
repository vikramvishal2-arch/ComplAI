# PrivyCore — Privacy Management Platform

A **standalone** privacy operations platform by [Propel Ready Solutions](https://propelreadysolutions.in), separate from ComplAI GRC.

PrivyCore implements a mature Privacy Management Framework aligned with:

- **NIST Privacy Framework** (Identify-P, Govern-P, Control-P, Communicate-P, Protect-P)
- **ISO/IEC 27701:2019** (Privacy Information Management System)
- **GDPR** (EU General Data Protection Regulation)
- **Digital Personal Data Protection Act, 2023** (India) + DPDP Rules 2025

## Privacy modules

| Module | NIST Function | Focus |
|--------|---------------|-------|
| Governance & Accountability | Govern-P | Program charter, DPO, policies |
| Data Inventory & RoPA | Identify-P | Records of processing, data flows |
| Privacy Risk & DPIA | Identify-P | Risk assessments, DPIA, LIA |
| Consent & Legal Basis | Control-P | Consent, lawful basis, purpose limitation |
| Transparency & Notices | Communicate-P | Privacy notices, cookies |
| Data Subject Rights | Control-P | DSAR workflows |
| Privacy by Design & Default | Control-P | SDLC reviews, minimization |
| Processors & Vendors | Govern-P | DPAs, sub-processors |
| Cross-Border Transfers | Control-P | SCCs, TIA, adequacy |
| Breach Response & Notification | Protect-P | Detection, 72h notification |
| Retention & Disposal | Control-P | Schedules, secure deletion |
| Training & Awareness | Govern-P | Workforce privacy training |
| Monitoring & Audit | Govern-P | KPIs, internal audit, accountability |

## Quick start

```bash
cd privacy-platform
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) — runs on port **3001** so it does not conflict with ComplAI on port 3000.

## Project structure

```
privacy-platform/
  src/
    app/                  # Next.js App Router pages
    components/           # UI components
    lib/
      data/
        controls/         # Unified privacy control catalog (47 controls)
        frameworks.ts     # NIST, ISO 27701, GDPR, DPDP
        modules.ts        # 13 privacy program modules
```

## Relationship to ComplAI

PrivyCore is intentionally **decoupled** from the ComplAI GRC platform:

- Separate `package.json`, dev server (port 3001), and branding
- Privacy-specific module taxonomy (not generic GRC frameworks)
- Unified control catalog mapped across four privacy regulations in one place

ComplAI continues to cover broad security and compliance frameworks (SOC 2, ISO 27001, etc.). PrivyCore is the dedicated privacy program tool.

## License

Private — Propel Ready Solutions.
