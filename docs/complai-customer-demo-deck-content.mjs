/** Slide content for ComplAI customer demo deck (HTML + PPTX generators). */

export const DECK_META = {
  title: 'ComplAI — GRC Compliance Platform',
  subtitle: 'Customer Demo Deck',
  company: 'Propel Ready Solutions',
  contactEmail: 'tech@propelreadysolutions.in',
  contactPhone: '+91-8796941115',
  liveDemoUrl: '/demo/access',
  bookDemoUrl: '/company?contact=1',
};

/**
 * Marketing site brand tokens (tailwind.config.ts + globals.css).
 * Hex values without # for pptxgenjs / infographics.
 */
export const DECK_BRAND = {
  /** scrut-teal — primary accent */
  teal: '10B981',
  /** scrut-blue — secondary accent / hover (emerald-400) */
  blue: '34D399',
  /** scrut-gradient end / success */
  green: '059669',
  /** scrut-navy — dark base */
  navy: '12141C',
  /** scrut-navy-light — cards */
  navyLight: '1E212B',
  /** Emerald tint for light fills (replaces legacy blue-100) */
  brandLight: 'D1FAE5',
  /** Subtle green fill on dark slides */
  brandMuted: '064E3B',
  /** marketing-surface gradient stops */
  surfaceTop: '454956',
  surfaceMid: '22252F',
  surfaceBottom: '060708',
  /** App shell secondary (not marketing hero) */
  appPrimary: '0D4F8B',
  purple: '7C3AED',
  purpleLight: 'EDE9FE',
  amber: 'D97706',
  amberLight: 'FFFBEB',
  red: 'DC2626',
  redLight: 'FEF2F2',
  greenLight: 'ECFDF5',
  zinc100: 'F4F4F5',
  zinc400: 'A1A1AA',
  zinc700: '3F3F46',
  white: 'FFFFFF',
};

/** Shared brand palette for infographics (hex without #). */
export const INFOGRAPHIC_COLORS = {
  brand: DECK_BRAND.teal,
  brandSecondary: DECK_BRAND.blue,
  brandDark: DECK_BRAND.green,
  brandNavy: DECK_BRAND.navy,
  brandNavyLight: DECK_BRAND.navyLight,
  brandLight: DECK_BRAND.brandLight,
  brandMuted: DECK_BRAND.brandMuted,
  purple: DECK_BRAND.purple,
  purpleLight: DECK_BRAND.purpleLight,
  green: DECK_BRAND.green,
  greenLight: DECK_BRAND.greenLight,
  amber: DECK_BRAND.amber,
  amberLight: DECK_BRAND.amberLight,
  red: DECK_BRAND.red,
  redLight: DECK_BRAND.redLight,
  slate900: DECK_BRAND.navy,
  slate700: DECK_BRAND.zinc700,
  slate500: DECK_BRAND.zinc400,
  slate200: '3F3F46',
  slate100: DECK_BRAND.navyLight,
  white: DECK_BRAND.white,
};

/** Section themes for slide chrome and backgrounds. */
export const SECTION_THEMES = {
  hero: { label: 'Introduction', tint: 'brand', accent: DECK_BRAND.teal, dark: true },
  agenda: { label: 'Overview', tint: 'brand', accent: DECK_BRAND.teal, dark: true },
  problem: { label: 'The Challenge', tint: 'red', accent: DECK_BRAND.red, dark: true },
  who: { label: 'Who We Are', tint: 'brand', accent: DECK_BRAND.teal, dark: true },
  why: { label: 'Why ComplAI', tint: 'brand', accent: DECK_BRAND.teal, dark: true },
  platform: { label: 'Platform', tint: 'brand', accent: DECK_BRAND.teal, dark: true },
  frameworks: { label: 'Frameworks', tint: 'brand', accent: DECK_BRAND.teal, dark: true },
  compliance: { label: 'Compliance', tint: 'brand', accent: DECK_BRAND.teal, dark: true },
  policies: { label: 'Policies & Audits', tint: 'brand', accent: DECK_BRAND.teal, dark: true },
  risk: { label: 'Risk', tint: 'amber', accent: DECK_BRAND.amber, dark: true },
  tprm: { label: 'TPRM', tint: 'purple', accent: DECK_BRAND.purple, dark: true },
  integrations: { label: 'Integrations', tint: 'brand', accent: DECK_BRAND.teal, dark: true },
  intelligence: { label: 'Intelligence', tint: 'brand', accent: DECK_BRAND.teal, dark: true },
  leadership: { label: 'Leadership', tint: 'brand', accent: DECK_BRAND.teal, dark: true },
  outcomes: { label: 'Outcomes', tint: 'green', accent: DECK_BRAND.green, dark: true },
  cta: { label: 'Next Steps', tint: 'green', accent: DECK_BRAND.green, dark: true },
};

export const SLIDES = [
  {
    id: 'title',
    type: 'hero',
    section: 'hero',
    badge: 'Governance · Risk · Compliance',
    title: 'ComplAI',
    headline: 'Ensure Compliance. Accelerate Growth.',
    subtitle:
      'One unified GRC platform — 10-minute overview, then live demo: platform, compliance, risk, TPRM, and leadership dashboards.',
    pills: ['26 frameworks', '100+ ISMS templates', '87 integrations', 'AI intelligence'],
    notes:
      'Open with value proposition. Mention Propel Ready as delivery partner. Preview the five themes you will cover.',
    infographic: {
      kind: 'hero-rings',
      stats: [
        { value: '26', label: 'Frameworks', pct: 100 },
        { value: '100+', label: 'Templates', pct: 95 },
        { value: '87', label: 'Integrations', pct: 87 },
        { value: 'AI', label: 'Intelligence', pct: 100 },
      ],
    },
  },
  {
    id: 'problem',
    type: 'split',
    section: 'problem',
    title: 'The challenge — GRC is broken across too many tools',
    subtitle: 'Teams lose visibility, time, and audit confidence when data lives in silos.',
    stats: [
      { value: '5+', label: 'disconnected tools per org' },
      { value: '40h+', label: 'lost per audit cycle' },
      { value: '?', label: '“Are we green?” — often no real-time answer' },
    ],
    bullets: [
      'Duplicate controls across SOC 2, ISO 27001, and regional frameworks',
      'Risks and vendor due diligence disconnected from controls',
      'Policy approvals trapped in email with no audit trail',
    ],
    notes: 'Emphasize the board question. Use before/after visual to set up ComplAI.',
    infographic: {
      kind: 'before-after',
      painIcons: ['Spreadsheets', 'Email', 'Silos', 'Manual'],
      before: {
        title: 'Fragmented stack',
        items: ['Spreadsheets', 'Shared drives', 'Risk tool', 'Ticketing', 'Email'],
        color: 'red',
      },
      after: {
        title: 'ComplAI platform',
        items: ['Unified controls', 'Live evidence', 'RAG dashboards', 'TPRM + audits', 'AI gaps'],
        color: 'brand',
      },
    },
  },
  {
    id: 'why',
    type: 'grid',
    section: 'why',
    title: 'Why ComplAI — with Propel Ready Solutions',
    subtitle: 'Expert-backed GRC platform built for security teams, not spreadsheet warriors.',
    cards: [
      { title: '100+ ISMS templates', body: 'Auditor-aligned policies — start ready, not from blank.' },
      { title: 'One control framework', body: 'Implement once; reuse evidence across every standard.' },
      { title: 'Continuous readiness', body: 'Real-time RAG posture — not quarterly fire drills.' },
      { title: 'Propel Ready + ComplAI', body: 'Consulting, integration guides, and onboarding included.' },
    ],
    notes: 'Partnership infographic shows delivery model. Quadrant reinforces speed, coverage, automation, AI.',
    infographic: {
      kind: 'partnership',
      left: { label: 'Propel Ready', role: 'Consulting & onboarding' },
      right: { label: 'ComplAI', role: 'GRC platform' },
      bridge: 'Expert-backed delivery',
    },
  },
  {
    id: 'platform',
    type: 'modules',
    section: 'platform',
    title: 'Platform overview — every capability in one workspace',
    subtitle: 'Leadership, compliance, policies, risk, TPRM, integrations, and AI in one data model.',
    modules: [
      { name: 'Leadership dashboard', desc: 'RAG by domain, readiness, path to green' },
      { name: 'Framework compliance', desc: 'Pre-mapped controls with evidence per standard' },
      { name: 'Policies & ISMS', desc: '100+ templates, approvals, Word export' },
      { name: 'Controls & evidence', desc: 'Status, issues, remediation, integrations' },
      { name: 'Risk register', desc: 'Living register linked to controls' },
      { name: 'TPRM / Vendors', desc: 'Ratings, questionnaires, findings' },
    ],
    notes: 'Hub-spoke shows unified architecture. All modules share one data model.',
    infographic: {
      kind: 'hub-spoke',
      hub: 'ComplAI',
      spokes: ['Leadership', 'Policies', 'Controls', 'Frameworks', 'Integrations', 'Intelligence', 'Risk', 'TPRM', 'Audits'],
    },
  },
  {
    id: 'compliance',
    type: 'split',
    section: 'compliance',
    title: 'Compliance, frameworks & audit readiness',
    subtitle: '26 standards · pre-mapped controls · policies and evidence in one program.',
    stats: [
      { value: '26', label: 'frameworks — SOC 2, ISO 27001, ISO 22301, ISO 31000, DPDP, GDPR…' },
      { value: 'RAG', label: 'live status per control and domain' },
      { value: '100+', label: 'ISMS templates with approval workflows' },
    ],
    bullets: [
      'Implement controls once — evidence satisfies overlapping requirements',
      'Evidence upload and audit-ready export per control',
      'Policy lifecycle: template → approve → publish → audit',
    ],
    notes: 'Donut shows sample readiness. Demo: Controls and Policies modules.',
    infographic: {
      kind: 'rag-donut',
      segments: [
        { label: 'Compliant', value: 62, color: 'green' },
        { label: 'Partial', value: 24, color: 'amber' },
        { label: 'Gap', value: 9, color: 'red' },
        { label: 'Non-compliant', value: 5, color: 'slate' },
      ],
      centerLabel: '72%',
      centerSub: 'readiness',
      domainBars: [
        { name: 'Access', pct: 88, status: 'green' },
        { name: 'Data', pct: 71, status: 'amber' },
        { name: 'Vendor', pct: 79, status: 'green' },
        { name: 'Ops', pct: 65, status: 'amber' },
      ],
    },
  },
  {
    id: 'risk-tprm',
    type: 'split',
    section: 'tprm',
    title: 'Risk register & third-party risk (TPRM)',
    subtitle: 'Living risk program and vendor portfolio monitoring in one view.',
    stats: [
      { value: '0–950', label: 'vendor security rating scale' },
      { value: 'Tier', label: 'Critical · High · Medium · Low vendors' },
      { value: 'Linked', label: 'risks mapped to mitigating controls' },
    ],
    bullets: [
      'Inherent and residual risk scoring with executive roll-up',
      'Questionnaires, findings board, and remediation per vendor',
      'Demo portfolio: Stripe, Okta, Cloudflare — live intelligence profiles',
    ],
    notes: 'Gauge + funnel show TPRM pipeline. Demo: vendor portfolio and questionnaire results.',
    infographic: {
      kind: 'tprm-combo',
      gauge: { value: 742, max: 950, label: 'Portfolio avg rating', tier: 'Good' },
      funnel: {
        title: 'Vendor assessment pipeline',
        tiers: [
          { label: 'Inventory', count: 120, width: 100 },
          { label: 'Questionnaire', count: 85, width: 75 },
          { label: 'Rated', count: 62, width: 55 },
          { label: 'Remediated', count: 44, width: 35 },
        ],
      },
    },
  },
  {
    id: 'integrations-intelligence',
    type: 'grid',
    section: 'intelligence',
    title: 'Integrations & ComplAI Intelligence',
    subtitle: 'Connect 87 tools. Let AI close gaps before auditors do.',
    cards: [
      { title: '87 integrations', body: 'Okta, Entra, Workday, Splunk, CrowdStrike, AWS, Azure…' },
      { title: 'AI Copilot', body: 'Compliance questions answered from your posture.' },
      { title: 'Gap analysis', body: 'Policy, evidence, and control gaps prioritized.' },
      { title: 'Auto evidence', body: 'Control-level mapping reduces manual screenshots.' },
    ],
    notes: 'Category nodes show integration breadth. Demo: Intelligence gap analysis and copilot.',
    infographic: {
      kind: 'category-nodes',
      center: 'ComplAI',
      categories: [
        { name: 'IAM', color: 'brand', nodes: ['Okta', 'Entra', 'CyberArk'] },
        { name: 'SIEM', color: 'purple', nodes: ['Splunk', 'Chronicle', 'Sentinel'] },
        { name: 'HRMS', color: 'green', nodes: ['Workday', 'SAP', 'BambooHR'] },
        { name: 'Cloud', color: 'amber', nodes: ['AWS', 'Azure', 'GCP'] },
      ],
    },
  },
  {
    id: 'leadership',
    type: 'split',
    section: 'leadership',
    title: 'Leadership visibility & customer outcomes',
    subtitle: 'Answer the board in minutes — with measurable ROI from day one.',
    stats: [
      { value: '72%', label: 'sample readiness (demo org)' },
      { value: '80%', label: 'faster audit prep (typical)' },
      { value: '5→1', label: 'tools consolidated into one platform' },
    ],
    bullets: [
      'Program overview: compliance, TPRM, audits, policies, cloud monitoring',
      'Path-to-green actions deduplicated across frameworks',
      '40+ hours saved per audit cycle on evidence reconciliation',
    ],
    notes: 'Dashboard mock for CISO/CIO audience. Transition to live demo on Leadership view.',
    infographic: {
      kind: 'dashboard',
      kpis: [
        { label: 'Readiness', value: '72%', trend: 'up', color: 'green' },
        { label: 'Open risks', value: '14', trend: 'down', color: 'amber' },
        { label: 'Controls green', value: '186', trend: 'up', color: 'brand' },
        { label: 'Vendor avg', value: '742', trend: 'up', color: 'brand' },
      ],
      domains: [
        { name: 'Access', pct: 88, status: 'green' },
        { name: 'Data', pct: 71, status: 'amber' },
        { name: 'Vendor', pct: 79, status: 'green' },
        { name: 'Ops', pct: 65, status: 'amber' },
      ],
      chartBars: [65, 72, 68, 78, 82, 75, 88],
    },
  },
  {
    id: 'next',
    type: 'cta',
    section: 'cta',
    title: 'Thank you — walk into every audit with confidence',
    subtitle: 'Track risk. Prove control. Scale your GRC program.',
    beforeAfter: [
      { before: 'Spreadsheets & shared drives', after: 'Centralized evidence per control' },
      { before: 'Duplicate controls per framework', after: 'Unified control mapping' },
      { before: 'Vendor risk in separate tools', after: 'TPRM integrated with controls' },
    ],
    demoSteps: [
      'Leadership dashboard — RAG posture and program overview',
      'Controls & policies — evidence and approvals',
      'TPRM — vendor ratings and questionnaires',
      'Intelligence — gap analysis and AI copilot',
    ],
    nextSteps: [
      'Schedule a 30-minute live demo with your team',
      'Request a tailored framework assessment',
      'Start a pilot with Propel Ready onboarding',
    ],
    notes: 'Closing slide. Offer contact card. Transition to live demo.',
    infographic: {
      kind: 'contact-card',
      thankYou: 'Thank you',
      tagline: 'Questions? Let’s connect.',
    },
  },
];
