import type { Framework } from '../types';
import { CATEGORY_LABELS } from '../types';
import { FRAMEWORKS, getFrameworkById } from './frameworks';
import { getControlsByFramework } from './controls';
import { PRODUCT_NAME } from '../brand';

export type FrameworkGuide = {
  frameworkId: string;
  overview: string;
  whoItsFor: string[];
  whyItMatters: string;
  keyThemes: string[];
  howComplAIHelps: string[];
  gettingStarted: string[];
  sampleControls: Array<{ reference: string; title: string; domain: string }>;
  relatedTags: string[];
};

/** Curated copy for major frameworks; others use the generic builder. */
const GUIDE_OVERRIDES: Partial<
  Record<
    string,
    Pick<FrameworkGuide, 'overview' | 'whoItsFor' | 'whyItMatters' | 'keyThemes'>
  >
> = {
  'soc2-type2': {
    overview:
      'SOC 2 Type II evaluates how a service organization designs and operates controls over security, availability, processing integrity, confidentiality, and privacy across a review period.',
    whoItsFor: [
      'SaaS and cloud service providers',
      'Companies selling to enterprise customers that require a SOC 2 report',
      'Organizations preparing for Type I or Type II attestation',
    ],
    whyItMatters:
      'A SOC 2 report is often a procurement gate for B2B deals. Continuous control evidence in ComplAI shortens audit cycles and reduces last-minute scramble.',
    keyThemes: [
      'Trust Services Criteria (Security + optional criteria)',
      'Control design and operating effectiveness',
      'Evidence over the audit period',
      'Vendor and change management',
    ],
  },
  iso27001: {
    overview:
      'ISO/IEC 27001:2022 is the international standard for establishing, implementing, maintaining, and continually improving an Information Security Management System (ISMS).',
    whoItsFor: [
      'Organizations seeking ISO 27001 certification',
      'Global enterprises aligning security to a recognized ISMS',
      'Suppliers asked to demonstrate certified information security',
    ],
    whyItMatters:
      'Certification signals mature governance. Mapping Annex A controls in ComplAI keeps Statement of Applicability, risk treatment, and evidence audit-ready.',
    keyThemes: [
      'ISMS scope and leadership',
      'Risk assessment and treatment',
      'Annex A control implementation',
      'Internal audit and continual improvement',
    ],
  },
  iso27701: {
    overview:
      'ISO/IEC 27701 extends ISO 27001 with privacy-specific requirements for PII controllers and processors.',
    whoItsFor: [
      'Organizations already on or pursuing ISO 27001',
      'Privacy and DPO teams managing PII processing',
      'Processors supporting GDPR / DPDP-aligned customers',
    ],
    whyItMatters:
      'It bridges security ISMS practice with privacy accountability — useful when customers ask for both security and privacy assurance.',
    keyThemes: [
      'PII controller and processor roles',
      'Privacy risk and DPIA alignment',
      'Data subject rights processes',
      'Processor agreements and transfers',
    ],
  },
  hipaa: {
    overview:
      'The HIPAA Security Rule sets administrative, physical, and technical safeguards for electronic protected health information (ePHI).',
    whoItsFor: [
      'Covered entities and business associates',
      'Healthtech SaaS handling ePHI',
      'Vendors supporting US healthcare customers',
    ],
    whyItMatters:
      'Non-compliance risks enforcement and customer loss. ComplAI helps track safeguard implementation and evidence for BAAs and audits.',
    keyThemes: [
      'Administrative safeguards',
      'Physical and technical safeguards',
      'Access control and audit logging',
      'Breach response readiness',
    ],
  },
  gdpr: {
    overview:
      'The EU General Data Protection Regulation governs personal data processing, lawful bases, data subject rights, and cross-border transfers.',
    whoItsFor: [
      'Organizations offering goods/services to EU residents',
      'Controllers and processors of EU personal data',
      'Privacy programs needing operational control mapping',
    ],
    whyItMatters:
      'GDPR drives customer trust and regulatory exposure. Mapping obligations to controls and evidence keeps privacy operations demonstrable.',
    keyThemes: [
      'Lawful basis and transparency',
      'Data subject rights',
      'Security of processing',
      'Processors, transfers, and DPIAs',
    ],
  },
  'pci-dss': {
    overview:
      'PCI DSS v4.0 defines security requirements for organizations that store, process, or transmit cardholder data.',
    whoItsFor: [
      'Merchants and payment service providers',
      'Fintech platforms in the card data environment',
      'Teams preparing for SAQ or ROC assessments',
    ],
    whyItMatters:
      'Card brands and acquirers require PCI compliance. Continuous control tracking reduces assessment friction and scope creep risk.',
    keyThemes: [
      'Cardholder data environment scope',
      'Network and access security',
      'Vulnerability and logging controls',
      'Policies and evidence for assessors',
    ],
  },
  'nist-csf': {
    overview:
      'The NIST Cybersecurity Framework organizes cybersecurity outcomes across Identify, Protect, Detect, Respond, and Recover.',
    whoItsFor: [
      'US and global organizations building a risk-based cyber program',
      'Leadership teams needing a common risk language',
      'Programs aligning multiple frameworks to one posture model',
    ],
    whyItMatters:
      'CSF is widely understood by boards and regulators. ComplAI maps CSF functions to actionable controls and readiness.',
    keyThemes: [
      'Govern and Identify',
      'Protect and Detect',
      'Respond and Recover',
      'Profile and maturity tracking',
    ],
  },
  'india-dpdp': {
    overview:
      'India’s Digital Personal Data Protection Act sets obligations for processing digital personal data, consent, and fiduciary duties.',
    whoItsFor: [
      'Data fiduciaries operating in or serving India',
      'Indian SaaS and digital businesses',
      'Privacy teams aligning to DPDP rules',
    ],
    whyItMatters:
      'DPDP is central to India’s privacy regime. Early control mapping prepares you for rules, notices, and fiduciary accountability.',
    keyThemes: [
      'Consent and notice',
      'Purpose limitation',
      'Security safeguards',
      'Rights and grievance redressal',
    ],
  },
  'cert-in': {
    overview:
      'CERT-In directions require Indian organizations to follow incident reporting, log retention, time sync, and ICT security practices.',
    whoItsFor: [
      'Service providers and intermediaries in India',
      'Body corporates under CERT-In directions',
      'Security operations teams handling incident reporting',
    ],
    whyItMatters:
      'Directions are enforceable expectations for ICT security in India. ComplAI helps track reporting readiness, logging, and control evidence.',
    keyThemes: [
      'Incident reporting timelines',
      'Log retention and NTP sync',
      'Point of contact registration',
      'ICT security controls',
    ],
  },
  'un-r155': {
    overview:
      'UN Regulation No. 155 addresses cybersecurity management systems for vehicles and related type-approval requirements.',
    whoItsFor: [
      'Automotive OEMs and suppliers',
      'Manufacturers seeking type approval in UNECE markets',
      'Vehicle cybersecurity and product security teams',
    ],
    whyItMatters:
      'Cybersecurity is now a type-approval gate. Mapping CSMS requirements to controls supports audit and regulatory readiness.',
    keyThemes: [
      'Cybersecurity management system',
      'Risk assessment for vehicles',
      'Monitoring and incident response',
      'Supply-chain cybersecurity',
    ],
  },
  'un-r156': {
    overview:
      'UN Regulation No. 156 covers software update management systems for vehicles, including secure update processes and documentation.',
    whoItsFor: [
      'Automotive manufacturers with OTA / software update programs',
      'Suppliers delivering updateable vehicle software',
      'Compliance teams supporting type approval',
    ],
    whyItMatters:
      'Safe, authenticated updates are mandatory for many markets. ComplAI tracks SUMS-aligned controls and evidence.',
    keyThemes: [
      'Software update management system',
      'Update authenticity and integrity',
      'Configuration and version control',
      'Documentation for approval authorities',
    ],
  },
};

function defaultThemes(framework: Framework): string[] {
  if (framework.tags.length >= 3) return framework.tags.slice(0, 4);
  return [
    CATEGORY_LABELS[framework.category] ?? framework.category,
    framework.region,
    'Control implementation',
    'Audit evidence',
  ];
}

export function buildFrameworkGuide(framework: Framework): FrameworkGuide {
  const override = GUIDE_OVERRIDES[framework.id];
  const controls = getControlsByFramework(framework.id).slice(0, 6);

  return {
    frameworkId: framework.id,
    overview:
      override?.overview ??
      `${framework.name} (${framework.shortName}) — ${framework.description} ComplAI maps this framework’s controls so your team can track implementation, evidence, and audit readiness.`,
    whoItsFor:
      override?.whoItsFor ?? [
        `Organizations that must demonstrate ${framework.shortName} compliance`,
        `Security and compliance teams operating in ${framework.region}`,
        `Customers and partners that require ${framework.shortName} assurance`,
      ],
    whyItMatters:
      override?.whyItMatters ??
      `${framework.shortName} is a recognized ${CATEGORY_LABELS[framework.category]?.toLowerCase() ?? framework.category} framework. Activating it in ${PRODUCT_NAME} lets you manage controls, evidence, and readiness in one place.`,
    keyThemes: override?.keyThemes ?? defaultThemes(framework),
    howComplAIHelps: [
      `Activate ${framework.shortName} in the Framework Library to load its control catalog`,
      'Assign owners, track compliance status, and attach evidence per control',
      'Use risk register and issues workflows when controls fail or deviate',
      'Export readiness views for leadership and auditors',
    ],
    gettingStarted: [
      `Open Framework Library and activate ${framework.shortName}`,
      'Review the control list and prioritize high-impact domains',
      'Attach policies, procedures, and technical evidence',
      'Mark controls audit-ready and monitor residual gaps',
    ],
    sampleControls: controls.map((c) => ({
      reference: c.reference,
      title: c.title,
      domain: c.domain,
    })),
    relatedTags: framework.tags,
  };
}

export function getFrameworkGuideById(frameworkId: string): FrameworkGuide | null {
  const framework = getFrameworkById(frameworkId);
  if (!framework) return null;
  return buildFrameworkGuide(framework);
}

export function listFrameworkGuides(): Array<{ framework: Framework; guide: FrameworkGuide }> {
  return FRAMEWORKS.map((framework) => ({
    framework,
    guide: buildFrameworkGuide(framework),
  }));
}
