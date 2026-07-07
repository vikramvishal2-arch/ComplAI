/**
 * Generates ILL Malicious Traffic Detection architecture plan as Word (.docx).
 * Run: node scripts/generate-ill-plan-docx.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'docs', 'ill-threat-intel');
const OUT_FILE = path.join(OUT_DIR, 'ILL-Malicious-Traffic-Detection-Architecture-Plan.docx');

function text(content, opts = {}) {
  return new TextRun({ text: content, ...opts });
}

function heading(content, level) {
  return new Paragraph({ text: content, heading: level, spacing: { after: 200 } });
}

function body(content) {
  return new Paragraph({ children: [text(content)], spacing: { after: 120 } });
}

function bullet(content) {
  return new Paragraph({
    children: [text(content)],
    bullet: { level: 0 },
    spacing: { after: 80 },
  });
}

function tableRow(cells, header = false) {
  return new TableRow({
    children: cells.map(
      (c) =>
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [text(String(c), { bold: header })],
            }),
          ],
        })
    ),
  });
}

const doc = new Document({
  title: 'ILL Malicious Traffic Detection — Architecture & Implementation Plan',
  creator: 'Propel Ready Solutions',
  description: 'NSP edge solution for Internet Leased Line threat checking',
  sections: [
    {
      properties: {},
      children: [
        heading('ILL Malicious Traffic Detection', HeadingLevel.TITLE),
        heading('Architecture & Implementation Plan', HeadingLevel.HEADING_1),
        body(
          'Standalone telecom/NSP solution — independent of the ComplAI GRC platform. Deployed at the service provider edge (e.g. Bharti Airtel, Vodafone Idea) to protect Internet Leased Line (ILL) enterprise circuits.'
        ),

        heading('1. Problem Statement', HeadingLevel.HEADING_1),
        body(
          'When traffic flows over an ILL circuit, the NSP must determine whether the source IP or destination URL/domain is malicious. If the IP or URL appears on a threat intel blacklist, traffic is blocked; otherwise it is allowed.'
        ),

        heading('2. Context & Assumptions', HeadingLevel.HEADING_1),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(['Term', 'Meaning'], true),
            tableRow(['ILL', 'Internet Leased Line — dedicated business internet sold to enterprises']),
            tableRow(['NSP', 'Network Service Provider (Airtel, Vodafone, Jio, etc.)']),
            tableRow(['Deployment point', 'Provider edge — PE router, BNG/BRAS, or security appliance at POP']),
            tableRow(['Decision rule', 'Blacklisted → block; not blacklisted → allow']),
          ],
        }),
        new Paragraph({ spacing: { after: 200 } }),
        body('Recommended deployment model: Hybrid — local IOC cache at NSP edge for low latency, with Open API Gateway + REST API for cache misses and periodic feed sync from cloud-hosted threat intel DB.'),
        body('Inspection method (confirmed): Hybrid DPI + DNS'),
        bullet('DPI — extracts destination IP, HTTP Host, and TLS SNI from ILL flows at PE/BNG'),
        bullet('DNS — inspects DNS queries/responses for domain IOC matching'),
        bullet('Proxy (optional) — full URL path visibility for premium enterprise tiers'),

        heading('3. High-Level Architecture', HeadingLevel.HEADING_1),
        body('Enterprise CPE → PE/BNG → Traffic Inspection Engine (TIE) → Policy Enforcement Point (PEP)'),
        body('On cache miss: PEP → Open API Gateway → Threat Lookup REST API → Threat Intel DB (public cloud)'),
        body('Components at NSP edge: PE Router/BNG, TIE, Local IOC Cache, PEP, Open API Gateway, REST API'),
        body('Components in public cloud (ap-south-1): Threat Intel DB, Feed Ingestion Pipeline, Admin/SOC Portal'),
        body('External inputs: Commercial TI feeds, open-source feeds (AbuseIPDB, AlienVault OTX), NSP-internal SOC IOCs'),

        heading('4. NSP Deployment Topology', HeadingLevel.HEADING_1),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(['Layer', 'Components', 'Location'], true),
            tableRow(['Edge', 'PE router, security appliance, IOC cache', 'Each major POP serving ILL customers']),
            tableRow(['DMZ', 'Open API Gateway, REST API pods', 'NSP private cloud / co-located DC']),
            tableRow(['Cloud', 'Threat Intel DB, feed ETL', 'AWS/Azure/GCP — ap-south-1 for India']),
            tableRow(['Connectivity', 'IPSec/MPLS VPN or cloud private link', 'NSP DC ↔ public cloud']),
          ],
        }),
        new Paragraph({ spacing: { after: 200 } }),

        heading('5. Runtime Traffic Flow', HeadingLevel.HEADING_1),
        bullet('1. ILL traffic arrives at NSP edge (PE router)'),
        bullet('2. TIE mirrors or inline-inspects flow; extracts src_ip, dest_ip, url/domain'),
        bullet('3. PEP queries local IOC cache'),
        bullet('4a. Cache hit — blacklisted → DROP/REJECT + SOC alert'),
        bullet('4b. Cache hit — known clean → ALLOW forward'),
        bullet('4c. Cache miss → PEP calls Open API Gateway (auth, rate limit, audit)'),
        bullet('5. REST API queries Threat Intel DB; returns malicious or clean verdict'),
        bullet('6. PEP caches result with TTL; enforces allow or block on PE router'),

        heading('6. Decision Logic', HeadingLevel.HEADING_1),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(['Condition', 'Action'], true),
            tableRow(['IP or URL in blacklist', 'BLOCK — log + alert SOC']),
            tableRow(['Not in blacklist', 'ALLOW']),
            tableRow(['API timeout + fail_open circuit', 'ALLOW (business continuity)']),
            tableRow(['API timeout + fail_closed circuit', 'BLOCK']),
          ],
        }),
        new Paragraph({ spacing: { after: 200 } }),

        heading('7. Component Responsibilities', HeadingLevel.HEADING_1),

        heading('7.1 Traffic Inspection Engine (TIE)', HeadingLevel.HEADING_2),
        bullet('Sits on ILL path at provider POP where leased line terminates'),
        bullet('Extracts source IP, destination IP, URL/hostname via DPI, DNS, or proxy'),
        bullet('Hands IOC candidates to Policy Enforcement Point'),

        heading('7.2 Policy Enforcement Point (PEP)', HeadingLevel.HEADING_2),
        bullet('Core rule: allow if not blacklisted; block if blacklisted'),
        bullet('Queries local cache first; falls back to API on miss'),
        bullet('Enforces permit, drop, sinkhole, or quarantine VLAN'),
        bullet('Logs every decision for SOC and regulatory audit'),

        heading('7.3 Local IOC Cache', HeadingLevel.HEADING_2),
        bullet('Redis or in-memory store with Bloom filter for fast negative lookups'),
        bullet('Populated by periodic sync (every 5–15 min) and on-demand API responses'),
        bullet('TTL-based expiry; target < 5 ms on cache hit'),

        heading('7.4 Open API Gateway (NSP DMZ)', HeadingLevel.HEADING_2),
        bullet('Kong, Apigee, WSO2, or KrakenD'),
        bullet('mTLS or OAuth2 client credentials for NSP internal callers only'),
        bullet('Rate limiting, request validation, audit logging'),
        bullet('Routes: /v1/threat-check, /v1/bulk-check, /v1/feeds/sync, /v1/ill/inspect'),

        heading('7.5 Threat Lookup REST API', HeadingLevel.HEADING_2),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(['Method', 'Endpoint', 'Purpose'], true),
            tableRow(['GET', '/v1/threat-check?ip=&url=&domain=', 'Single IOC lookup']),
            tableRow(['POST', '/v1/bulk-check', 'Batch lookup (up to 100 items)']),
            tableRow(['GET', '/v1/feeds/sync?since=', 'Delta sync for edge cache']),
            tableRow(['POST', '/v1/ill/inspect', 'TIE + PEP inline decision']),
            tableRow(['GET', '/v1/ill/pilot/status', 'Pilot metrics and health']),
          ],
        }),
        new Paragraph({ spacing: { after: 200 } }),
        body('Example response fields: ip, url, status (malicious|clean|unknown), blacklisted, category, confidence, source_feed, checked_at'),

        heading('7.6 Threat Intel DB (Public Cloud)', HeadingLevel.HEADING_2),
        bullet('PostgreSQL in ap-south-1 (India data residency)'),
        bullet('Normalized IOCs: malicious IPs, URLs, domains, hashes'),
        bullet('Indexed on ip, url_hash, domain'),
        bullet('Fed by commercial TI, open feeds, and NSP-internal SOC findings'),
        bullet('Supports versioning and since cursor for delta sync to edge'),

        heading('8. Non-Functional Requirements', HeadingLevel.HEADING_1),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(['Requirement', 'Target'], true),
            tableRow(['Lookup latency (cache hit)', '< 5 ms']),
            tableRow(['Lookup latency (cache miss → API)', '< 50 ms']),
            tableRow(['Availability', '99.95% (active-active gateway + API)']),
            tableRow(['Throughput', 'Scale per POP by ILL subscriber count']),
            tableRow(['Fail mode', 'Configurable — default fail-open; fail-closed for strict tiers']),
            tableRow(['Data residency', 'India region; logs per TRAI / CERT-In guidelines']),
            tableRow(['Audit', 'Circuit ID, src/dest, verdict, timestamp']),
          ],
        }),
        new Paragraph({ spacing: { after: 200 } }),

        heading('9. Security Controls', HeadingLevel.HEADING_1),
        bullet('mTLS between NSP edge → API Gateway → REST API'),
        bullet('No direct public exposure of Threat Intel DB'),
        bullet('API Gateway as single controlled entry point'),
        bullet('RBAC for feed management and manual IOC add/remove'),
        bullet('Encryption at rest (DB) and in transit (TLS 1.3)'),
        bullet('DPDP Act compliance for metadata tied to enterprise customer circuits'),

        heading('10. Implementation Plan', HeadingLevel.HEADING_1),

        heading('Phase 1 — Foundation (Weeks 1–4)', HeadingLevel.HEADING_2),
        bullet('Stand up Threat Intel DB on public cloud with feed ingestion pipeline'),
        bullet('Build REST API with /threat-check, /bulk-check, /feeds/sync endpoints'),
        bullet('Deploy Open API Gateway with auth and rate limiting'),
        bullet('Seed sample IOCs for testing'),
        body('Exit criteria: API returns correct allow/block verdicts for known test IOCs via gateway.'),

        heading('Phase 2 — NSP Edge Integration (Weeks 5–8)', HeadingLevel.HEADING_2),
        bullet('Deploy local IOC cache and sync job at one pilot POP'),
        bullet('Integrate Traffic Inspection Engine with PEP on ILL handoff'),
        bullet('Connect edge to API Gateway over NSP DMZ (HTTPS mTLS)'),
        bullet('Implement /v1/ill/inspect for end-to-end inline decisions'),
        body('Exit criteria: Simulated ILL traffic blocked/allowed at pilot POP with < 50 ms API miss latency.'),

        heading('Phase 3 — Pilot & Scale (Weeks 9–12)', HeadingLevel.HEADING_2),
        bullet('Pilot with selected enterprise ILL customers at one metro POP'),
        bullet('Tune fail-open/fail-closed policy per customer SLA'),
        bullet('Integrate block events with NSP SOC SIEM (Splunk, QRadar, Chronicle)'),
        bullet('Roll out to additional POPs; add SOC dashboards and alerting'),
        new Paragraph({ spacing: { after: 120 } }),
        body('Example pilot circuits:'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            tableRow(['Circuit ID', 'NSP', 'POP', 'Fail Mode'], true),
            tableRow(['ILL-AIRTEL-DEL-001', 'Airtel', 'DEL-POP-01', 'fail_open']),
            tableRow(['ILL-AIRTEL-MUM-002', 'Airtel', 'MUM-POP-03', 'fail_open']),
            tableRow(['ILL-VODAFONE-BLR-003', 'Vodafone', 'BLR-POP-02', 'fail_closed']),
          ],
        }),
        new Paragraph({ spacing: { after: 200 } }),
        body('Exit criteria: Pilot customers live; SOC receiving alerts; SLA met for latency and availability.'),

        heading('Phase 4 — Operations (Ongoing)', HeadingLevel.HEADING_2),
        bullet('Automated feed updates, IOC expiry, false-positive review workflow'),
        bullet('Integration with NSP SOC SIEM'),
        bullet('SLA reporting per ILL customer'),
        bullet('Production hardening: HA gateway, DB replication, runbooks'),

        heading('11. Optional Extensions (Future)', HeadingLevel.HEADING_1),
        bullet('Per-customer ILL policy profiles (strict vs permissive)'),
        bullet('DNS sinkholing for malicious domains'),
        bullet('BGP FlowSpec or RTBH for large-scale malicious IP blocking'),
        bullet('Customer-facing portal showing blocked threat stats per circuit'),

        heading('12. Open Items for Stakeholder Confirmation', HeadingLevel.HEADING_1),
        bullet('Inspection method — inline DPI vs mirrored traffic vs DNS-only'),
        bullet('Fail-open vs fail-closed default for enterprise ILL SLAs'),
        bullet('Threat feed sources — commercial only, open source, or NSP-internal SOC feeds'),
        bullet('Gateway product — Kong, Apigee, WSO2, or cloud-managed (AWS API Gateway)'),

        new Paragraph({ spacing: { before: 400 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [text('Document generated for NSP ILL threat detection — independent of ComplAI GRC platform.', { italics: true })],
        }),
      ],
    },
  ],
});

fs.mkdirSync(OUT_DIR, { recursive: true });
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(OUT_FILE, buffer);
console.log(`Written: ${OUT_FILE}`);
