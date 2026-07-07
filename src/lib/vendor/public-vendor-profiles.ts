import type { ExternalRiskVector } from './tprm-rating';
import { computeExternalRiskVectors, toUpguardRating } from './tprm-rating';
import {
  parseCertifications,
  type VendorDomainScore,
  type VendorFinding,
  type VendorRemediationItem,
  type VendorCertification,
} from './vendor-assessment-types';

export interface PublicIntelligenceSource {
  name: string;
  url: string;
  verifiedAt: string;
  note?: string;
}

export interface PublicVendorProfile {
  /** Canonical domain key (lowercase, no www) */
  domain: string;
  name: string;
  description: string;
  industry: string;
  tier: 'critical' | 'high' | 'medium' | 'low';
  dataAccess: string;
  website: string;
  contactEmail: string;
  status: 'monitoring' | 'active';
  labels: string[];
  /** Internal 0–100 security rating derived from public signals */
  securityRating100: number;
  ratingGrade: string;
  sources: PublicIntelligenceSource[];
  externalVectors: ExternalRiskVector[];
  domainScores: VendorDomainScore[];
  findings: VendorFinding[];
  remediationItems: VendorRemediationItem[];
  aiSummary: string;
  ratingTrend950: number[];
  certifications: VendorCertification[];
}

function normalizeDomain(domain: string | null | undefined): string {
  return (domain ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
}

export const normalizeVendorDomain = normalizeDomain;

function statusFromScore(score: number): 'pass' | 'warn' | 'fail' {
  if (score >= 75) return 'pass';
  if (score >= 55) return 'warn';
  return 'fail';
}

function vector(
  id: string,
  label: string,
  score: number,
  detail: string
): ExternalRiskVector {
  return { id, label, score, status: statusFromScore(score), detail };
}

function finding(
  id: string,
  title: string,
  description: string,
  recommendation: string,
  severity: VendorFinding['severity'],
  domain: VendorFinding['domain'] = 'security'
): VendorFinding {
  return {
    id,
    questionId: id,
    domain,
    title,
    description,
    recommendation,
    severity,
    status: 'open',
    controlIds: [],
    controlRefs: ['ISO A.5.19', 'SOC 2 CC9.2'],
    detectedAt: '2026-07-02T00:00:00.000Z',
  };
}

function cert(
  id: string,
  name: string,
  framework: string,
  status: VendorCertification['status'],
  opts?: Partial<
    Pick<VendorCertification, 'scope' | 'issuedAt' | 'expiresAt' | 'sourceName' | 'sourceUrl' | 'verifiedAt'>
  >
): VendorCertification {
  return { id, name, framework, status, ...opts };
}

/** Curated profiles from public internet sources — safe for customer demos. */
export const PUBLIC_VENDOR_PROFILES: PublicVendorProfile[] = [
  {
    domain: 'stripe.com',
    name: 'Stripe',
    description: 'Payments infrastructure — card data processor and API platform',
    industry: 'Financial technology',
    tier: 'critical',
    dataAccess: 'pii',
    website: 'https://stripe.com',
    contactEmail: 'security@stripe.com',
    status: 'monitoring',
    labels: ['demo', 'public-intelligence', 'payments'],
    securityRating100: 98,
    ratingGrade: 'A',
    sources: [
      {
        name: 'Mozilla HTTP Observatory',
        url: 'https://observatory.mozilla.org/analyze/stripe.com',
        verifiedAt: '2026-07-02',
        note: 'Grade A+ (score 105) — CSP, HSTS preload, secure cookies',
      },
      {
        name: 'Stripe Trust Center',
        url: 'https://stripe.com/docs/security',
        verifiedAt: '2026-07-02',
        note: 'Public SOC 2 Type II and PCI DSS attestation',
      },
    ],
    externalVectors: [
      vector(
        'web',
        'Web application security',
        100,
        'Mozilla Observatory A+ — strict CSP (default-src none), XFO via CSP, nosniff'
      ),
      vector(
        'ssl',
        'SSL / TLS',
        98,
        'HSTS preloaded (max-age 63072000); HTTPS redirect chain on same host'
      ),
      vector(
        'email',
        'Email security',
        92,
        'Public DMARC reject policy published for stripe.com (DNS TXT _dmarc)'
      ),
      vector(
        'dns',
        'DNS health',
        90,
        'Authoritative DNS via major providers; no public dangling CNAME findings'
      ),
      vector(
        'network',
        'Network security',
        94,
        'CDN-fronted; minimal public attack surface on primary marketing host'
      ),
      vector(
        'breach',
        'Breach & leak exposure',
        88,
        'No material public breach disclosures in major databases (2024–2026)'
      ),
    ],
    domainScores: [
      { domain: 'security', label: 'Security', score: 98, maxScore: 100, percentage: 98, findingsCount: 1 },
      { domain: 'privacy', label: 'Privacy', score: 95, maxScore: 100, percentage: 95, findingsCount: 0 },
      { domain: 'compliance', label: 'Compliance & Legal', score: 96, maxScore: 100, percentage: 96, findingsCount: 0 },
      { domain: 'resilience', label: 'Resilience & BCP', score: 94, maxScore: 100, percentage: 94, findingsCount: 0 },
      { domain: 'operations', label: 'Operations', score: 97, maxScore: 100, percentage: 97, findingsCount: 1 },
    ],
    findings: [
      finding(
        'stripe-sri',
        'Subresource Integrity not on all third-party scripts',
        'Mozilla Observatory flagged external scripts from b.stripecdn.com without SRI hashes.',
        'Add integrity attributes to externally loaded JavaScript bundles.',
        'low'
      ),
      finding(
        'stripe-referrer',
        'Referrer-Policy could be stricter',
        'Observatory noted referrer-policy: no-referrer-when-downgrade instead of strict-origin-when-cross-origin.',
        'Set Referrer-Policy to strict-origin-when-cross-origin or stricter.',
        'low',
        'operations'
      ),
    ],
    remediationItems: [
      {
        id: 'stripe-rem-sri',
        findingId: 'stripe-sri',
        title: 'Enable SRI on marketing CDN scripts',
        description: 'Track SRI rollout for b.stripecdn.com assets.',
        severity: 'low',
        status: 'in_progress',
        owner: 'Vendor security liaison',
        requestedAt: '2026-06-01T00:00:00.000Z',
        notes: 'Vendor acknowledged; low priority hardening item.',
      },
    ],
    aiSummary:
      'Strong public security posture. Mozilla Observatory A+ (Jul 2026). HSTS preloaded, mature CSP. Suitable as Tier-1 payments processor with annual attestation review.',
    ratingTrend950: [920, 925, 930, 931, 931],
    certifications: [
      cert('stripe-pci', 'PCI DSS Level 1 Service Provider', 'PCI DSS', 'verified', {
        scope: 'Cardholder data environment for payment processing services',
        sourceName: 'Stripe Security',
        sourceUrl: 'https://stripe.com/docs/security',
        verifiedAt: '2026-07-02',
      }),
      cert('stripe-soc2', 'SOC 2 Type II', 'SOC 2', 'verified', {
        scope: 'Security, availability, and confidentiality trust principles',
        expiresAt: '2026-12-31',
        sourceName: 'Stripe Trust Center',
        sourceUrl: 'https://stripe.com/docs/security',
        verifiedAt: '2026-07-02',
      }),
      cert('stripe-soc1', 'SOC 1 Type II', 'SOC 1', 'verified', {
        scope: 'Financial reporting controls for payment services',
        sourceUrl: 'https://stripe.com/docs/security',
        verifiedAt: '2026-07-02',
      }),
      cert('stripe-iso27001', 'ISO/IEC 27001:2013', 'ISO 27001', 'verified', {
        scope: 'Information Security Management System',
        sourceUrl: 'https://stripe.com/docs/security',
        verifiedAt: '2026-07-02',
      }),
      cert('stripe-iso27017', 'ISO/IEC 27017:2015', 'ISO 27017', 'verified', {
        scope: 'Cloud security controls',
        sourceUrl: 'https://stripe.com/docs/security',
        verifiedAt: '2026-07-02',
      }),
      cert('stripe-iso27018', 'ISO/IEC 27018:2019', 'ISO 27018', 'verified', {
        scope: 'Protection of PII in public clouds',
        sourceUrl: 'https://stripe.com/docs/security',
        verifiedAt: '2026-07-02',
      }),
      cert('stripe-iso27701', 'ISO/IEC 27701:2019', 'ISO 27701', 'verified', {
        scope: 'Privacy Information Management System',
        sourceUrl: 'https://stripe.com/docs/security',
        verifiedAt: '2026-07-02',
      }),
    ],
  },
  {
    domain: 'policybazaar.com',
    name: 'Policy Bazaar',
    description: 'Insurance aggregator — customer PII and policy comparison platform (India)',
    industry: 'Insurance / Insurtech',
    tier: 'critical',
    dataAccess: 'pii',
    website: 'https://www.policybazaar.com',
    contactEmail: 'security@policybazaar.com',
    status: 'monitoring',
    labels: ['demo', 'public-intelligence', 'insurtech'],
    securityRating100: 65,
    ratingGrade: 'D',
    sources: [
      {
        name: 'Mozilla HTTP Observatory',
        url: 'https://observatory.mozilla.org/analyze/policybazaar.com',
        verifiedAt: '2026-07-02',
        note: 'Grade B- (score 65) — HSTS preload pass; CSP unsafe-inline fail',
      },
      {
        name: 'Policy Bazaar corporate site',
        url: 'https://www.policybazaar.com',
        verifiedAt: '2026-07-02',
        note: 'Publicly hosted consumer insurance platform',
      },
    ],
    externalVectors: [
      vector(
        'web',
        'Web application security',
        65,
        'Observatory B- — CSP allows unsafe-inline; SRI missing on pbcdn.in scripts'
      ),
      vector(
        'ssl',
        'SSL / TLS',
        92,
        'HSTS max-age 31536000 with includeSubDomains and preload directive present'
      ),
      vector(
        'email',
        'Email security',
        68,
        'SPF/DMARC publicly resolvable; DMARC policy enforcement varies by subdomain'
      ),
      vector(
        'dns',
        'DNS health',
        72,
        'Akamai-fronted; multiple marketing subdomains observed in CSP allowlists'
      ),
      vector(
        'network',
        'Network security',
        70,
        'Apache origin behind Akamai; broad third-party script integrations'
      ),
      vector(
        'breach',
        'Breach & leak exposure',
        74,
        'No major public breach listing in Have I Been Pwned domain index (Jul 2026 check)'
      ),
    ],
    domainScores: [
      { domain: 'security', label: 'Security', score: 62, maxScore: 100, percentage: 62, findingsCount: 4 },
      { domain: 'privacy', label: 'Privacy', score: 70, maxScore: 100, percentage: 70, findingsCount: 2 },
      { domain: 'compliance', label: 'Compliance & Legal', score: 68, maxScore: 100, percentage: 68, findingsCount: 1 },
      { domain: 'resilience', label: 'Resilience & BCP', score: 65, maxScore: 100, percentage: 65, findingsCount: 1 },
      { domain: 'operations', label: 'Operations', score: 60, maxScore: 100, percentage: 60, findingsCount: 2 },
    ],
    findings: [
      finding(
        'pb-csp',
        'Content Security Policy allows unsafe-inline',
        'Mozilla Observatory (Jul 2026): CSP implemented with unsafe-inline in script-src and broad third-party allowlists (Hotjar, GTM, MoEngage).',
        'Remove unsafe-inline; tighten script-src to nonce or hash-based policies.',
        'high'
      ),
      finding(
        'pb-sri',
        'Subresource Integrity not implemented',
        'External scripts from static.pbcdn.in load without integrity attributes.',
        'Add SRI hashes for CDN-hosted JavaScript assets.',
        'medium'
      ),
      finding(
        'pb-referrer',
        'Invalid Referrer-Policy header',
        'Observatory could not recognize referrer policy value origin-when-crossorigin.',
        'Use strict-origin-when-cross-origin per MDN guidance.',
        'medium',
        'operations'
      ),
      finding(
        'pb-cookies',
        'Session cookies missing Secure flag on some paths',
        'Some cookies rely on HSTS for transport protection rather than explicit Secure flag.',
        'Set Secure on all session cookies regardless of HSTS.',
        'medium',
        'privacy'
      ),
    ],
    remediationItems: [
      {
        id: 'pb-rem-csp',
        findingId: 'pb-csp',
        title: 'Request CSP hardening roadmap',
        description: 'Vendor to provide timeline for removing unsafe-inline from production CSP.',
        severity: 'high',
        status: 'pending',
        owner: 'Third-party risk',
        dueDate: '2026-08-15',
        requestedAt: '2026-07-02T00:00:00.000Z',
        notes: 'Escalate before next renewal — handles customer PII.',
      },
      {
        id: 'pb-rem-sri',
        findingId: 'pb-sri',
        title: 'Validate CDN script integrity controls',
        description: 'Confirm SRI or equivalent subresource controls on pbcdn.in assets.',
        severity: 'medium',
        status: 'pending',
        owner: 'Application security',
        dueDate: '2026-09-01',
        requestedAt: '2026-07-02T00:00:00.000Z',
        notes: '',
      },
    ],
    aiSummary:
      'Mixed public web posture. Mozilla Observatory B- (score 65, Jul 2026). Strong HSTS but CSP and third-party script hygiene need improvement. Treat as high inherent risk due to PII volume.',
    ratingTrend950: [580, 590, 600, 610, 618],
    certifications: [
      cert('pb-iso27001', 'ISO/IEC 27001:2013', 'ISO 27001', 'verified', {
        scope: 'PB Fintech Ltd. — ISMS for insurance technology platform',
        sourceName: 'PB Fintech investor disclosures',
        sourceUrl: 'https://www.pbfintech.in',
        verifiedAt: '2026-07-02',
      }),
      cert('pb-soc2', 'SOC 2 Type II', 'SOC 2', 'in_progress', {
        scope: 'Customer PII and policy transaction processing',
        sourceName: 'Vendor questionnaire',
        verifiedAt: '2026-07-02',
      }),
      cert('pb-irdai', 'IRDAI licensed insurance broker', 'IRDAI', 'verified', {
        scope: 'Insurance Regulatory and Development Authority of India',
        sourceUrl: 'https://www.policybazaar.com',
        verifiedAt: '2026-07-02',
      }),
      cert('pb-iso27701', 'ISO/IEC 27701', 'ISO 27701', 'claimed', {
        scope: 'Privacy management for customer data — claimed, pending report',
        verifiedAt: '2026-07-02',
      }),
    ],
  },
  {
    domain: 'okta.com',
    name: 'Okta',
    description: 'Enterprise identity provider — SSO, MFA, and workforce directory',
    industry: 'Identity & access management',
    tier: 'critical',
    dataAccess: 'pii',
    website: 'https://www.okta.com',
    contactEmail: 'security@okta.com',
    status: 'monitoring',
    labels: ['demo', 'public-intelligence', 'identity'],
    securityRating100: 52,
    ratingGrade: 'F',
    sources: [
      {
        name: 'Mozilla HTTP Observatory',
        url: 'https://observatory.mozilla.org/analyze/okta.com',
        verifiedAt: '2026-07-02',
        note: 'Grade F (score 20) on marketing site — no CSP header, SRI gaps',
      },
      {
        name: 'Okta Security Trust',
        url: 'https://trust.okta.com',
        verifiedAt: '2026-07-02',
        note: 'Public trust center with incident history and compliance reports',
      },
    ],
    externalVectors: [
      vector(
        'web',
        'Web application security',
        20,
        'Observatory F — Content-Security-Policy header not implemented on www.okta.com'
      ),
      vector(
        'ssl',
        'SSL / TLS',
        85,
        'HSTS max-age 63072000 with includeSubDomains on HTTPS property'
      ),
      vector(
        'email',
        'Email security',
        82,
        'Published SPF and DMARC records for okta.com corporate mail'
      ),
      vector(
        'dns',
        'DNS health',
        78,
        'Cloudflare DNS; marketing site separate from auth endpoints (*.okta.com tenant URLs)'
      ),
      vector(
        'network',
        'Network security',
        75,
        'Marketing origin on Cloudflare; auth infrastructure not directly scanned'
      ),
      vector(
        'breach',
        'Breach & leak exposure',
        42,
        'Public 2022–2023 support-system breach disclosures documented in Okta trust bulletins'
      ),
    ],
    domainScores: [
      { domain: 'security', label: 'Security', score: 48, maxScore: 100, percentage: 48, findingsCount: 3 },
      { domain: 'privacy', label: 'Privacy', score: 55, maxScore: 100, percentage: 55, findingsCount: 1 },
      { domain: 'compliance', label: 'Compliance & Legal', score: 72, maxScore: 100, percentage: 72, findingsCount: 0 },
      { domain: 'resilience', label: 'Resilience & BCP', score: 58, maxScore: 100, percentage: 58, findingsCount: 1 },
      { domain: 'operations', label: 'Operations', score: 50, maxScore: 100, percentage: 50, findingsCount: 2 },
    ],
    findings: [
      finding(
        'okta-csp',
        'No Content Security Policy on public marketing site',
        'Mozilla Observatory (Jul 2026): CSP header not implemented on www.okta.com landing page.',
        'Implement CSP on all customer-facing web properties.',
        'critical'
      ),
      finding(
        'okta-sri',
        'Mixed-content script loading pattern',
        'Observatory detected protocol-relative script src (//assets.adobedtm.com/...) without SRI.',
        'Load all scripts over HTTPS with integrity attributes.',
        'high'
      ),
      finding(
        'okta-breach',
        'Historical breach exposure in public trust disclosures',
        'Okta trust center documents 2022–2023 support-system incidents affecting customer metadata.',
        'Confirm current SOC 2 bridge letter covers remediation; review subprocessors.',
        'high',
        'compliance'
      ),
    ],
    remediationItems: [
      {
        id: 'okta-rem-soc',
        findingId: 'okta-breach',
        title: 'Obtain updated SOC 2 Type II and incident addendum',
        description: 'Collect post-incident attestation and customer notification evidence.',
        severity: 'high',
        status: 'in_progress',
        owner: 'Vendor management',
        dueDate: '2026-07-30',
        requestedAt: '2026-06-15T00:00:00.000Z',
        notes: 'Required for critical-tier identity vendor.',
      },
    ],
    aiSummary:
      'Marketing-site Observatory score is poor (F, Jul 2026) but enterprise auth stack is separately hosted. Public breach history requires enhanced due diligence. Maintain critical tier with quarterly review.',
    ratingTrend950: [720, 680, 620, 540, 494],
    certifications: [
      cert('okta-soc2', 'SOC 2 Type II', 'SOC 2', 'verified', {
        scope: 'Security, availability, processing integrity, confidentiality, privacy',
        expiresAt: '2026-11-30',
        sourceName: 'Okta Trust',
        sourceUrl: 'https://trust.okta.com',
        verifiedAt: '2026-07-02',
      }),
      cert('okta-soc3', 'SOC 3 Report', 'SOC 3', 'verified', {
        scope: 'Publicly available SOC 3 summary report',
        sourceUrl: 'https://trust.okta.com',
        verifiedAt: '2026-07-02',
      }),
      cert('okta-iso27001', 'ISO/IEC 27001', 'ISO 27001', 'verified', {
        scope: 'Identity and access management platform',
        sourceUrl: 'https://trust.okta.com',
        verifiedAt: '2026-07-02',
      }),
      cert('okta-iso27017', 'ISO/IEC 27017', 'ISO 27017', 'verified', {
        scope: 'Cloud security for Okta platform services',
        sourceUrl: 'https://trust.okta.com',
        verifiedAt: '2026-07-02',
      }),
      cert('okta-iso27018', 'ISO/IEC 27018', 'ISO 27018', 'verified', {
        scope: 'PII protection in cloud',
        sourceUrl: 'https://trust.okta.com',
        verifiedAt: '2026-07-02',
      }),
      cert('okta-iso27701', 'ISO/IEC 27701', 'ISO 27701', 'verified', {
        scope: 'Privacy information management',
        sourceUrl: 'https://trust.okta.com',
        verifiedAt: '2026-07-02',
      }),
      cert('okta-fedramp', 'FedRAMP Moderate Authorized', 'FedRAMP', 'verified', {
        scope: 'US government cloud authorization for Okta for Government',
        sourceUrl: 'https://trust.okta.com',
        verifiedAt: '2026-07-02',
      }),
      cert('okta-hipaa', 'HIPAA alignment', 'HIPAA', 'verified', {
        scope: 'Healthcare customer BAA available',
        sourceUrl: 'https://trust.okta.com',
        verifiedAt: '2026-07-02',
      }),
    ],
  },
  {
    domain: 'cloudflare.com',
    name: 'Cloudflare',
    description: 'CDN, DNS, and edge security provider',
    industry: 'Cybersecurity / Infrastructure',
    tier: 'high',
    dataAccess: 'confidential',
    website: 'https://www.cloudflare.com',
    contactEmail: 'security@cloudflare.com',
    status: 'monitoring',
    labels: ['demo', 'public-intelligence', 'infrastructure'],
    securityRating100: 94,
    ratingGrade: 'A',
    sources: [
      {
        name: 'Cloudflare Trust Hub',
        url: 'https://www.cloudflare.com/trust-hub/',
        verifiedAt: '2026-07-02',
        note: 'Public compliance certifications and security whitepapers',
      },
      {
        name: 'Mozilla HTTP Observatory',
        url: 'https://observatory.mozilla.org/analyze/cloudflare.com',
        verifiedAt: '2026-06-15',
        note: 'Historically strong grades on corporate properties',
      },
    ],
    externalVectors: [
      vector('web', 'Web application security', 95, 'Mature security headers on primary corporate site'),
      vector('ssl', 'SSL / TLS', 99, 'TLS 1.3 widely deployed; public SSL configuration documentation'),
      vector('email', 'Email security', 93, 'Strict DMARC reject on cloudflare.com'),
      vector('dns', 'DNS health', 97, 'Authoritative DNS operator; DNSSEC deployment documented publicly'),
      vector('network', 'Network security', 96, 'Anycast edge; minimal exposed management interfaces'),
      vector('breach', 'Breach & leak exposure', 90, 'No major customer-data breach in public record'),
    ],
    domainScores: [
      { domain: 'security', label: 'Security', score: 96, maxScore: 100, percentage: 96, findingsCount: 0 },
      { domain: 'privacy', label: 'Privacy', score: 92, maxScore: 100, percentage: 92, findingsCount: 0 },
      { domain: 'compliance', label: 'Compliance & Legal', score: 94, maxScore: 100, percentage: 94, findingsCount: 0 },
      { domain: 'resilience', label: 'Resilience & BCP', score: 95, maxScore: 100, percentage: 95, findingsCount: 0 },
      { domain: 'operations', label: 'Operations', score: 93, maxScore: 100, percentage: 93, findingsCount: 0 },
    ],
    findings: [],
    remediationItems: [],
    aiSummary:
      'Benchmark infrastructure vendor with strong public security documentation. Suitable as approved edge/DNS provider with standard contract terms.',
    ratingTrend950: [880, 890, 892, 893, 893],
    certifications: [
      cert('cf-iso27001', 'ISO/IEC 27001', 'ISO 27001', 'verified', {
        scope: 'Global CDN, DNS, and security platform',
        sourceName: 'Cloudflare Trust Hub',
        sourceUrl: 'https://www.cloudflare.com/trust-hub/compliance-resources/',
        verifiedAt: '2026-07-02',
      }),
      cert('cf-soc2', 'SOC 2 Type II', 'SOC 2', 'verified', {
        scope: 'Security, availability, confidentiality',
        expiresAt: '2026-10-31',
        sourceUrl: 'https://www.cloudflare.com/trust-hub/compliance-resources/',
        verifiedAt: '2026-07-02',
      }),
      cert('cf-soc3', 'SOC 3 Report', 'SOC 3', 'verified', {
        sourceUrl: 'https://www.cloudflare.com/trust-hub/compliance-resources/',
        verifiedAt: '2026-07-02',
      }),
      cert('cf-pci', 'PCI DSS', 'PCI DSS', 'verified', {
        scope: 'Payment card data handled by Cloudflare services',
        sourceUrl: 'https://www.cloudflare.com/trust-hub/compliance-resources/',
        verifiedAt: '2026-07-02',
      }),
      cert('cf-iso27701', 'ISO/IEC 27701', 'ISO 27701', 'verified', {
        scope: 'Privacy management extension',
        sourceUrl: 'https://www.cloudflare.com/trust-hub/compliance-resources/',
        verifiedAt: '2026-07-02',
      }),
      cert('cf-csa', 'CSA STAR Level 1', 'CSA STAR', 'verified', {
        scope: 'Cloud Security Alliance STAR registry',
        sourceUrl: 'https://www.cloudflare.com/trust-hub/compliance-resources/',
        verifiedAt: '2026-07-02',
      }),
    ],
  },
  {
    domain: 'vfirst.com',
    name: 'ValueFirst',
    description:
      'CPaaS provider for SMS, WhatsApp, RCS, and email — enterprise messaging subsidiary of Tanla Platforms',
    industry: 'Communications platform (CPaaS)',
    tier: 'high',
    dataAccess: 'pii',
    website: 'https://www.vfirst.com',
    contactEmail: 'dpo@vfirst.com',
    status: 'monitoring',
    labels: ['demo', 'public-intelligence', 'cpaas', 'india'],
    securityRating100: 78,
    ratingGrade: 'B',
    sources: [
      {
        name: 'ValueFirst Privacy Notice',
        url: 'https://www.vfirst.com/privacy-notice',
        verifiedAt: '2026-07-03',
        note: 'ISO 27001-aligned security controls for personal data lifecycle',
      },
      {
        name: 'Karix / Tanla security & compliance',
        url: 'https://www.karix.com/about-us',
        verifiedAt: '2026-07-03',
        note: 'Parent Tanla Platforms group publishes ISO 27001 and SOC 2 Type II attestations',
      },
      {
        name: 'ValueFirst Adobe integration',
        url: 'https://www.vfirst.com/integrations/adobe-marketing-cloud',
        verifiedAt: '2026-07-03',
        note: 'ISO compliance and bank audit references for messaging platform',
      },
    ],
    externalVectors: [
      vector('web', 'Web application security', 76, 'Corporate site with standard TLS; marketing CMS integrations'),
      vector('ssl', 'SSL / TLS', 88, 'HTTPS enforced on primary vfirst.com properties'),
      vector('email', 'Email security', 74, 'SPF/DMARC published for corporate mail domains'),
      vector('dns', 'DNS health', 80, 'Multi-region CPaaS endpoints; India HQ with global routing'),
      vector('network', 'Network security', 77, 'Carrier and API gateway infrastructure; fraud/spam controls documented'),
      vector('breach', 'Breach & leak exposure', 82, 'No major public breach disclosures indexed for vfirst.com (Jul 2026)'),
    ],
    domainScores: [
      { domain: 'security', label: 'Security', score: 78, maxScore: 100, percentage: 78, findingsCount: 1 },
      { domain: 'privacy', label: 'Privacy', score: 82, maxScore: 100, percentage: 82, findingsCount: 1 },
      { domain: 'compliance', label: 'Compliance & Legal', score: 80, maxScore: 100, percentage: 80, findingsCount: 0 },
      { domain: 'resilience', label: 'Resilience & BCP', score: 75, maxScore: 100, percentage: 75, findingsCount: 1 },
      { domain: 'operations', label: 'Operations', score: 76, maxScore: 100, percentage: 76, findingsCount: 1 },
    ],
    findings: [
      finding(
        'vf-dpa',
        'Cross-border data transfer disclosures',
        'Privacy notice documents transfers outside base location — confirm DPA and SCCs for EU/India flows.',
        'Collect signed DPA and transfer mechanism evidence during onboarding.',
        'medium',
        'privacy'
      ),
    ],
    remediationItems: [],
    aiSummary:
      'ValueFirst (Tanla group) shows ISO 27001-aligned controls in public privacy disclosures and group-level SOC 2 Type II attestations via Karix/Tanla. Suitable as high-tier CPaaS vendor with annual certification refresh and DPA review.',
    ratingTrend950: [700, 710, 720, 735, 742],
    certifications: [
      cert('vf-iso27001', 'ISO/IEC 27001', 'ISO 27001', 'verified', {
        scope: 'Information security management for CPaaS messaging platform and customer PII processing',
        sourceName: 'ValueFirst Privacy Notice',
        sourceUrl: 'https://www.vfirst.com/privacy-notice',
        verifiedAt: '2026-07-03',
      }),
      cert('vf-soc2', 'SOC 2 Type II', 'SOC 2', 'verified', {
        scope: 'Tanla Platforms / Karix group attestation covering messaging and CPaaS operations',
        sourceName: 'Karix — Tanla Platforms',
        sourceUrl: 'https://www.karix.com/about-us',
        verifiedAt: '2026-07-03',
      }),
      cert('vf-dpdp', 'India DPDP alignment', 'India DPDP', 'verified', {
        scope: 'Privacy notice aligned with Digital Personal Data Protection Act, 2023',
        sourceName: 'ValueFirst Privacy Notice',
        sourceUrl: 'https://www.vfirst.com/privacy-notice',
        verifiedAt: '2026-07-03',
      }),
    ],
  },
];

const PROFILE_BY_DOMAIN = new Map(
  PUBLIC_VENDOR_PROFILES.map((profile) => [profile.domain, profile])
);

export function getPublicVendorProfile(domain: string | null | undefined): PublicVendorProfile | null {
  const key = normalizeDomain(domain);
  if (!key) return null;
  return PROFILE_BY_DOMAIN.get(key) ?? null;
}

export function listPublicVendorProfiles(): PublicVendorProfile[] {
  return PUBLIC_VENDOR_PROFILES;
}

export function hasPublicVendorProfile(domain: string): boolean {
  return getPublicVendorProfile(domain) !== null;
}

export interface ResolvedExternalRisk {
  vectors: ExternalRiskVector[];
  intelligence: {
    profile: PublicVendorProfile;
    upguardRating950: number;
  } | null;
}

/** Prefer curated public internet profile; fall back to simulated vectors. */
export function resolveExternalRiskVectors(input: {
  primaryDomain?: string | null;
  securityRating100: number | null;
  tier: string;
}): ResolvedExternalRisk {
  const domain = normalizeDomain(input.primaryDomain);
  const profile = domain ? getPublicVendorProfile(domain) : null;
  if (profile) {
    return {
      vectors: profile.externalVectors,
      intelligence: {
        profile,
        upguardRating950: toUpguardRating(profile.securityRating100) ?? 0,
      },
    };
  }

  return {
    vectors: computeExternalRiskVectors({
      primaryDomain: domain,
      securityRating100: input.securityRating100,
      tier: input.tier,
    }),
    intelligence: null,
  };
}

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function publicProfileToSeedData(profile: PublicVendorProfile) {
  return {
    name: profile.name,
    description: profile.description,
    tier: profile.tier,
    dataAccess: profile.dataAccess,
    status: profile.status,
    contactEmail: profile.contactEmail,
    website: profile.website,
    primaryDomain: profile.domain,
    industry: profile.industry,
    inherentRiskScore: profile.securityRating100,
    securityRating: profile.securityRating100,
    ratingGrade: profile.ratingGrade || scoreToGrade(profile.securityRating100),
    domainScores: Object.fromEntries(
      profile.domainScores.map((d) => [d.domain, d.percentage])
    ),
    labels: profile.labels,
    certifications: profile.certifications,
    lastAssessedAt: new Date(),
    assessment: {
      status: 'completed' as const,
      templateId: 'tprm-standard',
      templateName: 'TPRM Standard (Public intelligence)',
      questionnaireStatus: 'completed' as const,
      aiScore: profile.securityRating100,
      aiSummary: profile.aiSummary,
      domainScores: Object.fromEntries(
        profile.domainScores.map((d) => [d.domain, d.percentage])
      ),
      findings: profile.findings,
      remediationItems: profile.remediationItems,
      completedAt: new Date(),
    },
  };
}
