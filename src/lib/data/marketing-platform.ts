import { POLICY_TEMPLATE_CATALOG } from '@/lib/data/policy-template-catalog';

const policyCount = POLICY_TEMPLATE_CATALOG.length;
const policyDocCount = POLICY_TEMPLATE_CATALOG.filter((t) => t.documentType === 'policy').length;
const procedureCount = POLICY_TEMPLATE_CATALOG.filter((t) => t.documentType === 'procedure').length;

export type PlatformCapability = {
  id: string;
  title: string;
  description: string;
  tabLabel?: string;
  bullets?: string[];
};

export const PLATFORM_CAPABILITIES: PlatformCapability[] = [
  {
    id: 'dashboard',
    tabLabel: 'Dashboards',
    title: 'Leadership dashboard',
    description:
      'CISO and CIO view with RAG status by security domain, framework readiness, risk summary, and prioritized actions — filterable by framework and severity.',
    bullets: [
      'Real-time RAG status across security domains',
      'Framework readiness scores with drill-down views',
      'Risk summary and prioritized action items',
      'Filter by framework, severity, and ownership',
    ],
  },
  {
    id: 'policies',
    tabLabel: 'Policies & ISMS',
    title: 'Policies & ISMS templates',
    description: `${policyCount} ISO 27001 Annex A templates (${policyDocCount} policies, ${procedureCount} procedures). Upload existing documents, create from templates, edit in place, and export to Word.`,
    bullets: [
      'Auditor-ready policy and procedure templates',
      'Upload, edit in place, and export to Word',
      'Annex A-aligned ISMS document library',
      'Version history and document lifecycle tracking',
    ],
  },
  {
    id: 'approvals',
    tabLabel: 'Workflows',
    title: 'Approval workflows & My Approvals',
    description:
      'Configurable approval matrix with prepare and review steps, employee timelines, progress tracking, and a personal inbox for pending policy actions.',
    bullets: [
      'Multi-stage prepare and review approval matrix',
      'Personal My Approvals inbox for pending actions',
      'Employee timelines and progress tracking',
      'Configurable roles and escalation paths',
    ],
  },
  {
    id: 'frameworks',
    tabLabel: 'Frameworks',
    title: 'Framework compliance',
    description:
      'SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, India DPDP, SEBI CSCRF, Middle East privacy, Google Chronicle SecOps, and more — with mapped controls and evidence.',
    bullets: [
      'Pre-mapped controls across major frameworks',
      'Reuse controls across multiple certifications',
      'Regional and industry-specific frameworks included',
      'Continuously updated framework library',
    ],
  },
  {
    id: 'controls',
    tabLabel: 'Controls',
    title: 'Controls & evidence',
    description:
      'Track control implementation status, upload evidence, log issues, link risks, run remediation playbooks, and connect access integrations per control.',
    bullets: [
      'Implementation status and evidence per control',
      'Issue logging and remediation playbooks',
      'Link controls to risks and vendors',
      'Access integration connections per control',
    ],
  },
  {
    id: 'integrations',
    tabLabel: 'Integrations',
    title: 'Integrations hub',
    description:
      'Browse HRMS, IDAM, SIEM, VAPT, and SSO tools with deployment models and capability tags. Each integration links to setup guides on propelreadysolutions.in.',
    bullets: [
      'HRMS, IAM, SIEM, VAPT, and SSO catalog',
      'Deployment models and capability tags',
      'Step-by-step setup guides for each tool',
      'Automated evidence and continuous monitoring',
    ],
  },
  {
    id: 'intelligence',
    tabLabel: 'Intelligence',
    title: 'Intelligence & AI',
    description:
      'AI copilot, gap analysis, security questionnaires, Google Chronicle SecOps intelligence, and continuous monitoring checks across your cloud stack.',
    bullets: [
      'AI copilot for compliance guidance',
      'Gap analysis and security questionnaires',
      'Google Chronicle SecOps intelligence',
      'Continuous monitoring across cloud stack',
    ],
  },
  {
    id: 'risk',
    tabLabel: 'Risk',
    title: 'Risk register',
    description:
      'Maintain a living risk register with scoring, treatment status, and links to controls — surfaced on the executive dashboard for leadership review.',
    bullets: [
      'Living risk register with scoring',
      'Treatment status and ownership tracking',
      'Linked to mitigating controls',
      'Executive dashboard visibility',
    ],
  },
  {
    id: 'vendors',
    tabLabel: 'Vendors',
    title: 'Vendor assessments',
    description:
      'Track third-party vendors, assessment status, and compliance posture alongside your internal control program.',
    bullets: [
      'Third-party vendor inventory',
      'Assessment status and due diligence tracking',
      'Compliance posture alongside internal controls',
      'Questionnaire templates for vendor risk',
    ],
  },
];

export type PlatformMenuCard = {
  id: string;
  title: string;
  tagline: string;
  href: string;
};

export type PlatformSidebarLink = {
  title: string;
  description: string;
  href: string;
};

/** Scrut-style platform hub cards (shown on /platform below hero). */
export const PLATFORM_FEATURED = {
  title: 'Explore ComplAI Intelligence',
  description: 'Experience AI-powered guidance for risk and compliance.',
  href: '#intelligence',
};

export const PLATFORM_MENU_CARDS: PlatformMenuCard[] = [
  {
    id: 'frameworks',
    title: 'Simplify compliance',
    tagline: 'Get and stay compliant, effortlessly.',
    href: '#frameworks',
  },
  {
    id: 'approvals',
    title: 'Streamline audits',
    tagline: 'Share. Track. Close audits faster.',
    href: '#approvals',
  },
  {
    id: 'policies',
    title: 'Policy & ISMS management',
    tagline: 'Empower teams with ready-to-use templates.',
    href: '#policies',
  },
  {
    id: 'risk',
    title: 'Monitor cyber risk',
    tagline: 'Build a live, collaborative risk program.',
    href: '#risk',
  },
  {
    id: 'controls',
    title: 'Controls & evidence',
    tagline: 'Validate and track controls with ease.',
    href: '#controls',
  },
  {
    id: 'dashboard',
    title: 'Leadership visibility',
    tagline: 'Demonstrate trust with real-time dashboards.',
    href: '#dashboard',
  },
  {
    id: 'intelligence',
    title: 'AI-powered GRC',
    tagline: 'Resolve gaps faster with AI guidance.',
    href: '#intelligence',
  },
  {
    id: 'vendors',
    title: 'Assess third-party risk',
    tagline: 'Manage vendor risk with real insight.',
    href: '#vendors',
  },
];

export const PLATFORM_SIDEBAR_LINKS: PlatformSidebarLink[] = [
  {
    title: 'Explore the platform',
    description: 'Built to power every GRC workflow.',
    href: '#dashboard',
  },
  {
    title: 'Why ComplAI',
    description: 'Visibility, control, and expert-backed support.',
    href: '/why-complai',
  },
  {
    title: 'ComplAI Intelligence',
    description: 'AI copilot for risk and compliance workflows.',
    href: '#intelligence',
  },
  {
    title: 'Integrate your tech stack',
    description: 'Connect ComplAI with the tools you already use.',
    href: '#integrations',
  },
];

export type WhyComplaiPillar = {
  id: string;
  title: string;
  description: string;
};

export const WHY_COMPLAI_HERO = {
  eyebrow: 'Why ComplAI',
  title: 'GRC built for security teams, not spreadsheet warriors',
  subtitle:
    'Manual compliance programs burn hours on evidence hunts, duplicate controls, and last-minute audit scrambles. ComplAI replaces that grind with a unified platform that keeps you continuously audit-ready.',
};

export const WHY_COMPLAI_OUTCOMES = [
  {
    stat: '100+',
    label: 'ISMS templates ready to deploy',
    detail: 'Start with auditor-approved policies and procedures instead of blank documents.',
  },
  {
    stat: 'One',
    label: 'Unified control framework',
    detail: 'Implement controls once and reuse them across SOC 2, ISO 27001, GDPR, and more.',
  },
  {
    stat: '24/7',
    label: 'Continuous readiness',
    detail: 'Track evidence, approvals, and control status in real time — not just before audit season.',
  },
];

export const WHY_COMPLAI_DIFFERENTIATORS: WhyComplaiPillar[] = [
  {
    id: 'unified',
    title: 'One workspace, not ten disconnected tools',
    description:
      'Policies, frameworks, controls, risk, vendors, integrations, and executive dashboards live in a single ComplAI workspace. No more switching between spreadsheets, shared drives, and ticketing systems to answer an auditor.',
  },
  {
    id: 'security-first',
    title: 'Security-first, not checkbox-first',
    description:
      'Map controls to your real risks — not just framework clauses. ComplAI ties risks to mitigating controls, surfaces gaps on leadership dashboards, and helps you build a program that scales with your business.',
  },
  {
    id: 'automation',
    title: 'Automation where it matters most',
    description:
      'Approval workflows, evidence collection, integration monitoring, and AI-assisted gap analysis reduce manual effort. Your team focuses on remediation and risk reduction, not document chasing.',
  },
  {
    id: 'expertise',
    title: 'Expert-backed, not documentation-only',
    description:
      'Propel Ready Solutions brings GRC consulting experience into the product — from ISO 27001 Annex A templates to integration setup guides and hands-on support during onboarding and audit prep.',
  },
];

export const WHY_COMPLAI_VS_MANUAL = [
  {
    manual: 'Spreadsheets and shared drives for evidence',
    complai: 'Centralized evidence per control with upload, linking, and export',
  },
  {
    manual: 'Duplicate controls across every new framework',
    complai: 'Unified control mapping reused across certifications',
  },
  {
    manual: 'Email chains for policy approvals',
    complai: 'Configurable approval matrix with My Approvals inbox',
  },
  {
    manual: 'Audit panic every quarter',
    complai: 'Continuous readiness with real-time dashboard visibility',
  },
  {
    manual: 'Manual vendor tracking in separate tools',
    complai: 'Vendor assessments integrated with your control program',
  },
  {
    manual: 'Disconnected security tools with no GRC context',
    complai: 'Integration catalog with setup guides and control mapping',
  },
];

export const WHY_COMPLAI_STAGES = [
  {
    title: 'First audit readiness',
    description:
      'Get SOC 2, ISO 27001, or regional compliance off the ground with pre-built templates, mapped controls, and guided workflows — without hiring a full GRC team on day one.',
    href: '/solutions#compliance',
  },
  {
    title: 'Multi-framework scale',
    description:
      'Add frameworks as you grow. Reuse controls, consolidate evidence, and manage overlapping requirements from one program instead of restarting every audit cycle.',
    href: '/solutions#compliance',
  },
  {
    title: 'Enterprise GRC operations',
    description:
      'Executive dashboards, vendor risk, integration monitoring, and AI-assisted intelligence for teams managing complex, multi-region compliance programs.',
    href: '/solutions#dashboard',
  },
];
