import type { PolicyTemplateDef } from './policy-template-catalog';

/** Framework tags supported by policy template section builders. */
export type FrameworkTag = 'iso27001' | 'dpdp' | 'gdpr' | 'ai' | 'soc2' | 'pci-dss' | 'hipaa';

export interface FrameworkMeta {
  id: FrameworkTag;
  label: string;
  shortLabel: string;
}

export const FRAMEWORK_REGISTRY: Record<FrameworkTag, FrameworkMeta> = {
  iso27001: { id: 'iso27001', label: 'ISO/IEC 27001:2022', shortLabel: 'ISO 27001' },
  dpdp: { id: 'dpdp', label: 'Digital Personal Data Protection Act, 2023 (India)', shortLabel: 'DPDP Act' },
  gdpr: { id: 'gdpr', label: 'EU General Data Protection Regulation (GDPR)', shortLabel: 'GDPR' },
  ai: { id: 'ai', label: 'AI Governance (EU AI Act / NIST AI RMF)', shortLabel: 'AI Governance' },
  soc2: { id: 'soc2', label: 'SOC 2 Trust Services Criteria', shortLabel: 'SOC 2' },
  'pci-dss': { id: 'pci-dss', label: 'PCI DSS', shortLabel: 'PCI DSS' },
  hipaa: { id: 'hipaa', label: 'HIPAA Security & Privacy Rules', shortLabel: 'HIPAA' },
};

/** Templates that receive additional frameworks beyond category defaults. */
const TEMPLATE_FRAMEWORK_OVERRIDES: Record<string, FrameworkTag[]> = {
  'acceptable-use': ['ai'],
  'secure-development': ['ai'],
  'test-data-management': ['ai'],
  'outsourced-development': ['ai'],
  'vendor-security': ['ai'],
  'cloud-services': ['ai'],
  'risk-assessment': ['ai'],
  'data-masking': ['dpdp', 'gdpr'],
  'data-retention': ['dpdp', 'gdpr', 'hipaa'],
  'information-transfer': ['dpdp', 'gdpr', 'hipaa'],
  'data-leakage-prevention': ['dpdp', 'gdpr', 'hipaa'],
  'privacy-pii': ['hipaa'],
  'data-processing-procedure': ['hipaa'],
  'incident-response-plan': ['dpdp', 'gdpr', 'hipaa'],
  'incident-response': ['dpdp', 'gdpr', 'hipaa'],
  'incident-assessment': ['dpdp', 'gdpr'],
  'cryptography': ['pci-dss'],
  'logging-monitoring': ['pci-dss'],
  'network-security': ['pci-dss'],
  'access-control': ['pci-dss'],
  'password-authentication': ['pci-dss'],
  'privileged-access': ['pci-dss'],
  'endpoint-devices': ['pci-dss'],
};

/** Category-level default frameworks (excluding iso27001, always included). */
const CATEGORY_FRAMEWORK_DEFAULTS: Record<string, FrameworkTag[]> = {
  governance: ['soc2'],
  'risk-program': ['soc2'],
  'access-identity': ['soc2', 'pci-dss'],
  'asset-data': ['soc2'],
  'hr-people': [],
  physical: [],
  network: ['soc2', 'pci-dss'],
  operations: ['soc2'],
  supplier: ['soc2'],
  'incident-bc': ['soc2'],
  'privacy-legal': [],
  'ai-governance': ['ai'],
};

/** Privacy-legal templates that receive DPDP/GDPR sections via category-adjacent defaults. */
const PRIVACY_LEGAL_FRAMEWORK_TEMPLATES: Record<string, FrameworkTag[]> = {
  'legal-regulatory': ['dpdp', 'gdpr'],
  'records-protection': ['gdpr'],
};

/** SOC 2-relevant templates within categories that otherwise have no SOC 2 default. */
const SOC2_TEMPLATE_IDS = new Set([
  'security-awareness',
  'confidentiality-agreements',
  'personnel-screening',
  'legal-regulatory',
  'records-protection',
]);

/** Resolve applicable framework tags for a template definition. */
export function resolveFrameworkTags(def: PolicyTemplateDef): FrameworkTag[] {
  const tags = new Set<FrameworkTag>(['iso27001']);

  if (def.frameworkTags?.length) {
    for (const tag of def.frameworkTags) tags.add(tag);
  }

  const categoryDefaults = CATEGORY_FRAMEWORK_DEFAULTS[def.categoryId] ?? [];
  for (const tag of categoryDefaults) tags.add(tag);

  const templateOverrides = TEMPLATE_FRAMEWORK_OVERRIDES[def.id] ?? [];
  for (const tag of templateOverrides) tags.add(tag);

  if (SOC2_TEMPLATE_IDS.has(def.id)) tags.add('soc2');

  const privacyLegalTags = PRIVACY_LEGAL_FRAMEWORK_TEMPLATES[def.id];
  if (privacyLegalTags) {
    for (const tag of privacyLegalTags) tags.add(tag);
  }

  return [...tags];
}

export function formatFrameworkLabels(tags: FrameworkTag[]): string {
  return tags
    .filter((t) => t !== 'iso27001')
    .map((t) => FRAMEWORK_REGISTRY[t].shortLabel)
    .join(', ');
}

export function buildFrameworkSection(
  framework: FrameworkTag,
  def: PolicyTemplateDef
): string | null {
  if (framework === 'iso27001') return null;

  switch (framework) {
    case 'dpdp':
      return buildDpdpSection(def);
    case 'gdpr':
      return buildGdprSection(def);
    case 'ai':
      return buildAiGovernanceSection(def);
    case 'soc2':
      return buildSoc2Section(def);
    case 'pci-dss':
      return buildPciDssSection(def);
    case 'hipaa':
      return buildHipaaSection(def);
    default:
      return null;
  }
}

export function buildAllFrameworkSections(def: PolicyTemplateDef): string[] {
  const tags = resolveFrameworkTags(def);
  const sections: string[] = [];

  for (const tag of tags) {
    const section = buildFrameworkSection(tag, def);
    if (section) sections.push(section);
  }

  return sections;
}

function buildDpdpSection(def: PolicyTemplateDef): string {
  const isPrivacy = def.categoryId === 'privacy-legal' || isDataProtectionTemplate(def.id);
  const isIncident = def.categoryId === 'incident-bc';

  if (isPrivacy) {
    return `## DPDP Act Requirements

This section maps **${def.title}** to India's **Digital Personal Data Protection Act, 2023** and **Digital Personal Data Protection Rules, 2025** for processing of digital personal data.

### Applicability

- Applies where [Organization Name] acts as a **Data Fiduciary** or **Data Processor** processing digital personal data of individuals in India or offering goods/services to Data Principals in India.
- Extraterritorial processing linked to Indian Data Principals falls within scope regardless of processing location.

### Core Principles (Section 8 and Rules)

| Principle | Policy Requirement |
|-----------|-------------------|
| Lawful, fair, transparent processing | Document lawful basis; provide clear notice before or at collection |
| Purpose limitation | Collect and use personal data only for specified, legitimate purposes |
| Data minimisation | Limit collection to data necessary for the stated purpose |
| Accuracy | Maintain reasonable efforts to keep personal data accurate and up to date |
| Storage limitation | Retain personal data only as long as necessary for the purpose |
| Security safeguards | Implement reasonable technical and organisational safeguards against breach |
| Accountability | Maintain auditable records demonstrating compliance |

### Consent and Notice (Sections 5–6)

- Obtain **free, specific, informed, unconditional, and unambiguous** consent before processing personal data where consent is the lawful basis.
- Issue a separate consent notice in plain language (English and applicable scheduled languages) describing personal data collected, purpose, rights exercise, and grievance contact.
- Consent withdrawal shall be as easy as granting consent; cease processing upon withdrawal unless another lawful basis applies.
- Do not condition unrelated services on consent for non-essential processing.

### Data Principal Rights (Section 11–14)

- Establish procedures to receive and fulfil requests for access, correction, erasure, and grievance redressal within prescribed timelines.
- Appoint a grievance officer or contact point and publish contact details in the privacy notice.
- Maintain a log of rights requests, decisions, and response times.

### Data Fiduciary Obligations

- Implement reasonable security safeguards to prevent personal data breach (penalties up to ₹250 crore for failure).
- Ensure processor contracts impose equivalent obligations and permit audit.
- For **Significant Data Fiduciaries (SDFs)**: appoint India-based Data Protection Officer, conduct annual DPIA and independent audit, and perform algorithmic due diligence where applicable.

### Personal Data Breach Notification (Section 8(6), Rule 7)

- Notify the **Data Protection Board of India** and affected **Data Principals without undue delay** upon becoming aware of a breach.
- Provide a detailed report within **72 hours** covering nature of breach, data affected, consequences, remediation, and DPO/contact details.
- Coordinate breach response with the Incident Response Policy and legal counsel.

### Cross-Border Transfers

- Transfer personal data outside India only where permitted under the Act and notified rules; document transfer mechanisms and risk assessments.

### Records and Evidence

- Maintain processing records, consent logs, notice versions, DPIA outcomes, and breach notification records for Board inspection and audit.`;
  }

  if (isIncident) {
    return `## DPDP Act Requirements

This section addresses **personal data breach notification** obligations under the **Digital Personal Data Protection Act, 2023** and **DPDP Rules, 2025** as they relate to **${def.title}**.

### Breach Notification Obligations

When a personal data breach is confirmed or reasonably suspected:

1. **Notify affected Data Principals without undue delay** in plain language explaining what happened, potential impact, remediation steps, and contact details for assistance.
2. **Notify the Data Protection Board of India** as required under Section 8(6).
3. **Submit a detailed report within 72 hours** of becoming aware of the breach, including nature of breach, categories and approximate volume of data affected, likely consequences, and measures taken.

### Coordination

- The Incident Response Manager coordinates with the Data Protection Officer / Legal to assess whether DPDP notification thresholds are met.
- Personal data breach playbooks shall be integrated with this procedure; evidence of notification and Board correspondence is retained per Records Protection Procedure.
- Penalties for failure to notify can reach **₹200 crore** — treat DPDP notification as a mandatory parallel track alongside ISO 27001 and contractual obligations.`;
  }

  return `## DPDP Act Requirements

Where **${def.title}** involves processing of digital personal data, the following **Digital Personal Data Protection Act, 2023** obligations apply:

- Personal data shall be processed only for lawful purposes with appropriate notice and consent where required.
- Reasonable security safeguards must protect personal data handled under this policy (Section 8).
- Data Principal rights requests and grievances shall be routed to the Data Protection Officer / privacy team.
- Personal data breach events shall trigger DPDP notification procedures per the Incident Response Policy.
- Cross-border transfers of personal data require compliance with notified transfer conditions.`;
}

function buildGdprSection(def: PolicyTemplateDef): string {
  const isPrivacy = def.categoryId === 'privacy-legal' || isDataProtectionTemplate(def.id);
  const isIncident = def.categoryId === 'incident-bc';

  if (isPrivacy) {
    return `## GDPR Requirements

This section maps **${def.title}** to the **EU General Data Protection Regulation (Regulation (EU) 2016/679)** where [Organization Name] processes personal data of individuals in the European Economic Area (EEA).

### Lawful Basis and Transparency (Articles 5–6, 13–14)

- Process personal data lawfully, fairly, and transparently; document the lawful basis for each processing activity.
- Provide privacy notices at collection including controller identity, purposes, legal basis, retention, rights, and cross-border transfer information.
- Maintain a **Record of Processing Activities (RoPA)** under Article 30.

### Data Subject Rights (Articles 15–22)

- Facilitate requests for access, rectification, erasure, restriction, portability, and objection within **one month** (extendable by two months where complex).
- Log all requests, identity verification steps, and outcomes.

### Privacy by Design and DPIA (Articles 25, 35)

- Integrate data protection into systems and processes by design and default.
- Conduct **Data Protection Impact Assessments** before high-risk processing (systematic monitoring, large-scale special categories, automated decision-making with legal effect).

### Security and Breach Notification (Articles 32–34)

- Implement appropriate technical and organisational measures (TOMs) commensurate with risk.
- Notify the **supervisory authority within 72 hours** of becoming aware of a personal data breach where required.
- Notify affected data subjects without undue delay when breach is likely to result in high risk to rights and freedoms.

### Processors and Transfers (Articles 28, 44–49)

- Execute Article 28 processor agreements with all subprocessors handling personal data on the organisation's behalf.
- Implement appropriate safeguards for international transfers (SCCs, adequacy decisions, or approved mechanisms).

### DPO and Accountability (Articles 37–39)

- Appoint a Data Protection Officer where required (public authority, large-scale systematic monitoring, or special category processing).
- Cooperate with supervisory authorities and demonstrate compliance through documented policies, training, and audit evidence.`;
  }

  if (isIncident) {
    return `## GDPR Requirements

This section addresses **GDPR personal data breach notification** obligations applicable to **${def.title}**.

### Breach Notification (Articles 33–34)

- Assess whether a breach affects personal data of EEA individuals and whether notification to the **supervisory authority** is required (within **72 hours** of awareness).
- Notify affected **data subjects without undue delay** when the breach is likely to result in high risk to their rights and freedoms, unless exceptions apply (e.g., encryption rendered data unintelligible).
- Document all breaches in the breach register regardless of notification requirement, including facts, effects, and remedial action taken (Article 33(5)).

### Coordination

- DPO / Legal assesses GDPR notification in parallel with DPDP, contractual, and ISO 27001 obligations.
- Cross-border incidents may require notification to multiple supervisory authorities — legal counsel determines lead authority.`;
  }

  return `## GDPR Requirements

Where **${def.title}** involves processing of personal data of EEA individuals, the following **GDPR** principles apply:

- Lawfulness, fairness, transparency, purpose limitation, data minimisation, accuracy, storage limitation, integrity, and confidentiality (Article 5).
- Appropriate security measures and breach notification per Articles 32–34.
- Data subject rights requests routed to the DPO / privacy team within regulatory timelines.
- Processor agreements and transfer safeguards where personal data is shared with third parties.`;
}

function buildAiGovernanceSection(def: PolicyTemplateDef): string {
  const isAiTemplate = def.categoryId === 'ai-governance';

  if (isAiTemplate) {
    return `## AI Governance Requirements

This section aligns **${def.title}** with **NIST AI Risk Management Framework (AI RMF 1.0)**, **EU AI Act** obligations, and **ISO/IEC 42001** AI management system principles.

### Governance Structure (NIST AI RMF — GOVERN)

- Executive sponsor and AI governance lead accountable for policy enforcement and risk appetite decisions.
- Cross-functional AI governance committee (technology, legal, privacy, risk, business) reviews high-risk use cases.
- AI inventory maintained with system purpose, owner, data sources, deployment status, and risk classification.

### Risk Classification (EU AI Act — Risk Tiers)

| Risk Tier | Examples | Requirements |
|-----------|----------|-------------|
| Unacceptable / Prohibited | Social scoring, subliminal manipulation, untargeted facial scraping | **Prohibited** — not permitted |
| High-risk | HR screening, credit scoring, critical infrastructure, law enforcement | Conformity assessment, risk management, human oversight, logging, documentation |
| Limited-risk | Chatbots, emotion recognition, deepfakes | Transparency obligations — disclose AI interaction |
| Minimal-risk | Spam filters, inventory optimisation | Internal governance; no mandatory EU AI Act obligations |

All AI systems shall be classified before deployment; high-risk systems require enhanced controls and legal review.

### Acceptable Use and Prohibited Uses

- Only **approved AI tools and models** may be used with organisational data; maintain an approved tools register.
- **Prohibited:** entering confidential, personal, or regulated data into unapproved public AI services; automated decisions without human oversight where legally required; use cases on the EU AI Act prohibited list.
- Map data classification tiers to permitted AI tools (e.g., public AI for public data only; enterprise/private deployments for internal/confidential data).

### Human Oversight and Transparency

- High-stakes decisions (employment, credit, safety-critical) require meaningful human review before action.
- Disclose AI-generated content and AI-assisted decisions to affected individuals where required by law or policy.
- Maintain explainability commensurate with risk — document model logic, training data provenance, and known limitations.

### Model Lifecycle and Security (NIST AI RMF — MAP, MEASURE, MANAGE)

- Pre-deployment risk assessment covering bias, safety, security, privacy, and performance.
- Continuous monitoring for model drift, performance degradation, and emergent risks post-deployment.
- Secure model artefacts, training data, and API keys; apply access controls and audit logging.
- Incident response procedures for AI-specific failures (hallucination causing harm, data leakage via prompts, adversarial attacks).

### Vendor and Third-Party AI

- Assess AI vendors for data handling, model training on inputs, subprocessor chains, and regulatory compliance before procurement.
- Contractual clauses prohibiting training on organisational data unless explicitly approved.

### Documentation and Review

- Maintain technical documentation, risk assessments, and approval records for audit and EU AI Act Article 17 quality management where applicable.
- Review this policy at least annually and upon material changes to AI regulations, models, or use cases.`;
  }

  return `## AI Governance Requirements

Where **${def.title}** intersects with artificial intelligence systems, tools, or automated decision-making, the following AI governance requirements apply:

- AI systems and tools used in scope shall be registered in the organisational AI inventory with assigned owner and risk classification.
- Personnel shall use only **approved AI tools** consistent with data classification; unapproved public AI services must not receive confidential, personal, or regulated data.
- High-risk AI use cases require pre-deployment risk assessment, human oversight, and approval per the AI Governance Policy.
- AI-related incidents (data leakage, biased outputs, unauthorised model use) shall be reported through security event channels and managed per AI incident procedures.
- Align with **NIST AI RMF** functions (Govern, Map, Measure, Manage) and **EU AI Act** risk-tier obligations where applicable.`;
}

function buildSoc2Section(def: PolicyTemplateDef): string {
  const criteria = soc2CriteriaForTemplate(def);

  return `## SOC 2 Mapping

This section maps **${def.title}** to **AICPA Trust Services Criteria** relevant to SOC 2 examinations (Security and, where noted, Availability, Confidentiality, Processing Integrity, and Privacy).

### Applicable Trust Services Criteria

${criteria.map((c) => `- **${c.id} — ${c.name}:** ${c.mapping}`).join('\n')}

### Control Objectives

- Design and operate controls that address the criteria above consistently across the in-scope system boundary.
- Maintain evidence (policies, configurations, logs, tickets, review records) demonstrating control operation for SOC 2 audit periods.
- Report control deficiencies through the corrective action process with remediation timelines.

### Monitoring

- Control owners shall self-assess conformity at least quarterly; Internal Audit validates annually or per SOC 2 examination cycle.
- Changes affecting in-scope controls require impact assessment and timely policy/procedure updates.`;
}

function buildPciDssSection(def: PolicyTemplateDef): string {
  return `## PCI DSS Requirements

Where **${def.title}** applies to the **Cardholder Data Environment (CDE)** or systems connected to payment card processing, the following **Payment Card Industry Data Security Standard (PCI DSS v4.0)** requirements apply:

### Applicable Requirements

| PCI DSS Requirement | Application |
|---------------------|-------------|
| Req. 1 — Network security controls | Firewalls and network segmentation protecting the CDE |
| Req. 2 — Secure configurations | Hardening standards for systems handling cardholder data |
| Req. 3 — Protect stored account data | Encryption, truncation, or tokenisation; minimise storage |
| Req. 4 — Protect data in transit | Strong cryptography for cardholder data transmission |
| Req. 7 — Restrict access | Least privilege and role-based access to cardholder data |
| Req. 8 — Identify and authenticate | MFA and unique IDs for CDE access |
| Req. 10 — Log and monitor | Audit trails for all access to cardholder data and CDE systems |
| Req. 11 — Test security | Vulnerability scanning and penetration testing of the CDE |
| Req. 12 — Policies and programs | Information security policy governing PCI scope |

### Scope Notes

- If [Organization Name] does not process, store, or transmit payment card data, this section is **not applicable** — document as excluded in the Statement of Applicability.
- Personnel with CDE access require annual PCI awareness training and background checks per Req. 12.6 and 12.7.
- All PCI scope systems must comply with this policy and supporting standards; exceptions require QSA-approved compensating controls.`;
}

function buildHipaaSection(def: PolicyTemplateDef): string {
  return `## HIPAA Requirements

Where **${def.title}** applies to **Protected Health Information (PHI)** handled by [Organization Name] as a Covered Entity or Business Associate, the following **HIPAA Security Rule (45 CFR Part 164)** and **Privacy Rule** obligations apply:

### Administrative Safeguards

- Designate a **Security Officer** and **Privacy Officer** responsible for HIPAA compliance.
- Conduct **risk analysis** and implement risk management measures (§164.308(a)(1)).
- Workforce training on HIPAA policies and procedures; sanctions for violations (§164.308(a)(5–6)).
- Business Associate Agreements (BAAs) with all vendors handling PHI (§164.308(b) and §164.502(e)).

### Physical and Technical Safeguards

- Facility access controls and workstation security for systems containing PHI (§164.310–311).
- Access controls, audit controls, integrity controls, and transmission security for ePHI (§164.312).
- Encryption of ePHI at rest and in transit where reasonable and appropriate.

### Privacy Rule

- Minimum necessary standard for PHI use and disclosure (§164.502(b)).
- Individual rights: access, amendment, accounting of disclosures, and complaint handling (§164.524–528).
- Notice of Privacy Practices provided to individuals.

### Breach Notification (HITECH / Breach Notification Rule)

- Notify affected individuals within **60 days** of discovering a breach of unsecured PHI.
- Notify HHS and, for breaches affecting 500+ individuals, media outlets per §164.400–414.
- Coordinate with Incident Response Policy; maintain breach log and risk assessment documentation.

### Applicability Note

If [Organization Name] does not create, receive, maintain, or transmit PHI, this section is **not applicable** — document exclusion in the compliance register.`;
}

function isDataProtectionTemplate(id: string): boolean {
  return [
    'data-retention',
    'information-transfer',
    'data-leakage-prevention',
    'data-masking',
    'data-deletion',
    'data-processing-procedure',
    'privacy-pii',
    'dpdp-data-protection',
  ].includes(id);
}

interface Soc2Criterion {
  id: string;
  name: string;
  mapping: string;
}

function soc2CriteriaForTemplate(def: PolicyTemplateDef): Soc2Criterion[] {
  const byCategory: Record<string, Soc2Criterion[]> = {
    'access-identity': [
      { id: 'CC6.1', name: 'Logical and Physical Access', mapping: 'Restricts logical access through authentication and authorization mechanisms.' },
      { id: 'CC6.2', name: 'Credentials and Registration', mapping: 'Manages credentials, provisioning, and deprovisioning of access.' },
      { id: 'CC6.3', name: 'Access Removal', mapping: 'Removes access when no longer required.' },
    ],
    operations: [
      { id: 'CC7.1', name: 'Detection', mapping: 'Detects changes and events that could affect system security.' },
      { id: 'CC7.2', name: 'Monitoring', mapping: 'Monitors system components for anomalies and vulnerabilities.' },
      { id: 'CC8.1', name: 'Change Management', mapping: 'Authorizes, designs, tests, and implements changes.' },
      { id: 'A1.2', name: 'Recovery', mapping: 'Supports availability through backup and recovery capabilities.' },
    ],
    'incident-bc': [
      { id: 'CC7.3', name: 'Incident Response', mapping: 'Evaluates and responds to identified security events.' },
      { id: 'CC7.4', name: 'Incident Recovery', mapping: 'Restores operations after security incidents.' },
      { id: 'A1.3', name: 'Business Continuity', mapping: 'Maintains availability during disruptions.' },
    ],
    network: [
      { id: 'CC6.6', name: 'Boundary Protection', mapping: 'Protects network boundaries and restricts data flows.' },
      { id: 'CC6.7', name: 'Transmission Security', mapping: 'Protects data during transmission.' },
    ],
    supplier: [
      { id: 'CC9.2', name: 'Vendor Risk', mapping: 'Assesses and manages risks associated with vendors and business partners.' },
    ],
    'privacy-legal': [
      { id: 'P1–P8', name: 'Privacy Criteria', mapping: 'Addresses notice, choice, collection, use, access, disclosure, and quality of personal information.' },
    ],
    'ai-governance': [
      { id: 'CC1.1', name: 'Governance', mapping: 'Demonstrates commitment to integrity and ethical values including AI governance.' },
      { id: 'CC2.2', name: 'Communication', mapping: 'Communicates AI policies and responsibilities to personnel.' },
    ],
  };

  const defaults: Soc2Criterion[] = [
    { id: 'CC1.1', name: 'Control Environment', mapping: 'Demonstrates commitment to integrity and security governance.' },
    { id: 'CC2.2', name: 'Communication', mapping: 'Communicates security policies and responsibilities to personnel.' },
    { id: 'CC5.2', name: 'Control Activities', mapping: 'Deploys control activities through policies and procedures.' },
  ];

  return byCategory[def.categoryId] ?? defaults;
}
