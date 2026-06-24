import type { PolicyDocumentType } from './policy-template-catalog';
import type { FrameworkTag } from './policy-framework-mappings';
import { formatFrameworkLabels } from './policy-framework-mappings';
import { injectContentsIfMissing } from '@/lib/policies/document-contents';

export interface DocumentMeta {
  title: string;
  documentType: PolicyDocumentType;
  isoReference: string;
  documentId?: string;
  owner?: string;
  classification?: string;
  applicableFrameworks?: FrameworkTag[];
}

export interface RoleEntry {
  role: string;
  responsibility: string;
}

export interface PolicyContentParams {
  meta: DocumentMeta;
  purpose: string[];
  scope: string[];
  objectives?: string[];
  definitions?: Record<string, string>;
  roles: RoleEntry[];
  policyStatements: { heading: string; statements: string[] }[];
  frameworkSections?: string[];
  complianceMonitoring?: string[];
  exceptions?: string[];
  enforcement?: string[];
  relatedDocuments?: string[];
  reviewCycle?: string[];
}

export interface ProcedureStep {
  heading: string;
  description: string[];
  substeps?: string[];
}

export interface ProcedureContentParams {
  meta: DocumentMeta;
  purpose: string[];
  scope: string[];
  definitions?: Record<string, string>;
  roles: RoleEntry[];
  prerequisites?: string[];
  steps: ProcedureStep[];
  frameworkSections?: string[];
  records?: string[];
  relatedDocuments?: string[];
}

function documentIdFromTitle(title: string): string {
  const slug = title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((w) => w.slice(0, 3).toUpperCase())
    .join('-');
  return `DOC-${slug || 'ISMS'}-001`;
}

export function buildDocumentIdentification(meta: DocumentMeta): string {
  const docId = meta.documentId ?? documentIdFromTitle(meta.title);
  const docLabel = meta.documentType === 'policy' ? 'Policy' : 'Procedure / SOP';
  const extraFrameworks = meta.applicableFrameworks?.length
    ? formatFrameworkLabels(meta.applicableFrameworks)
    : '';
  const frameworkRow = extraFrameworks
    ? `\n| **Additional frameworks** | ${extraFrameworks} |`
    : '';
  return `## Document Identification

| Field | Value |
|-------|-------|
| **Document title** | ${meta.title} |
| **Document ID** | ${docId} |
| **Document type** | ${docLabel} |
| **Version** | 1.0 |
| **Status** | Draft |
| **Classification** | ${meta.classification ?? 'Internal'} |
| **ISO 27001:2022 reference** | ${meta.isoReference} |${frameworkRow}
| **Document owner** | ${meta.owner ?? '[Role: CISO / Policy Owner]'} |
| **Approver** | [Role: Executive Sponsor / CEO] |
| **Effective date** | [Date] |
| **Last review date** | [Date] |
| **Next review date** | [Date + 12 months] |
| **Review frequency** | At least annually, or upon significant change |`;
}

export function buildDefinitionsSection(definitions: Record<string, string>): string {
  const rows = Object.entries(definitions)
    .map(([term, def]) => `- **${term}:** ${def}`)
    .join('\n');
  return `## Definitions and Abbreviations

${rows}`;
}

export function buildRolesSection(roles: RoleEntry[]): string {
  const rows = roles.map((r) => `| ${r.role} | ${r.responsibility} |`).join('\n');
  return `## Roles and Responsibilities

| Role | Responsibility |
|------|----------------|
${rows}`;
}

export function buildIsoControlMapping(isoReference: string, title: string): string {
  return `## ISO 27001:2022 Control Mapping

This ${title.toLowerCase().includes('procedure') ? 'procedure' : 'document'} supports implementation of **ISO 27001:2022 ${isoReference}** and shall be referenced in the Statement of Applicability (SoA). When controls, scope, or risk treatment changes, update this document and the SoA mapping concurrently to maintain audit alignment.`;
}

export function buildDocumentControlSection(meta: DocumentMeta): string {
  const docId = meta.documentId ?? documentIdFromTitle(meta.title);
  return `## Document Control and Change Control

### Version History / Change Log

| Version | Date | Author | Summary of Changes | Approved by |
|---------|------|--------|-------------------|-------------|
| 1.0 | [Date] | [Author name / role] | Initial release | [Approver name / role] |
| | | | | |

### Approval Matrix

Document approval follows the organization ISMS approval matrix. Minimum approval chain:

| Step | Role | Action | Date | Signature / electronic approval |
|------|------|--------|------|----------------------------------|
| 1 | Document owner | Draft and submit for review | | |
| 2 | Subject matter expert / peer reviewer | Technical and operational review | | |
| 3 | Information Security / CISO | Security and compliance review | | |
| 4 | Executive sponsor | Final approval and authorization for publication | | |

### Distribution and Access Control

| Audience | Distribution method | Access level |
|----------|--------------------|--------------|
| All personnel | ISMS document repository / intranet | Read |
| Document owner and delegates | ISMS document repository | Read / write (controlled) |
| Internal audit / external auditors | Controlled access upon request | Read (time-bound) |
| Interested parties (as appropriate) | Per contractual or regulatory obligation | Read (controlled) |

Obsolete versions shall be withdrawn from active use. Only the current approved version published in the central ISMS repository is authoritative.

### Revision and Review Requirements

- **Planned review:** At least every 12 months from the effective date, or sooner if required by regulation.
- **Triggered review:** Upon material changes to scope, technology, organizational structure, incidents, audit findings, or applicable legal requirements.
- **Change request:** All changes require documented impact assessment, version increment, and re-approval per the approval matrix above.
- **Records retention:** Superseded versions and change records are retained per the Records Protection Procedure and legal retention requirements (minimum three years unless otherwise mandated).

### Document Register Reference

Register this document in the ISMS Document Register under ID **${docId}** with current version, owner, classification, and next review date.`;
}

export function buildPolicyMarkdown(params: PolicyContentParams): string {
  const {
    meta,
    purpose,
    scope,
    objectives,
    definitions,
    roles,
    policyStatements,
    frameworkSections,
    complianceMonitoring,
    exceptions,
    enforcement,
    relatedDocuments,
    reviewCycle,
  } = params;

  const sections: string[] = [
    `# ${meta.title}`,
    '',
    buildDocumentIdentification(meta),
    '',
    '## 1. Purpose',
    '',
    ...purpose.map((p) => `${p}\n`),
    '## 2. Scope',
    '',
    ...scope.map((s) => `${s}\n`),
  ];

  if (objectives?.length) {
    sections.push('## 3. Objectives', '', ...objectives.map((o) => `- ${o}`), '');
  }

  const defsNum = objectives?.length ? 4 : 3;
  if (definitions && Object.keys(definitions).length > 0) {
    sections.push(buildDefinitionsSection(definitions).replace('## Definitions', `## ${defsNum}. Definitions`), '');
  }

  const rolesNum = defsNum + (definitions && Object.keys(definitions).length > 0 ? 1 : 0);
  sections.push(buildRolesSection(roles).replace('## Roles', `## ${rolesNum}. Roles`), '');

  const stmtNum = rolesNum + 1;
  sections.push(`## ${stmtNum}. Policy Statements`, '');
  for (let i = 0; i < policyStatements.length; i++) {
    const block = policyStatements[i];
    sections.push(`### ${stmtNum}.${i + 1} ${block.heading}`, '');
    for (let j = 0; j < block.statements.length; j++) {
      sections.push(`${block.statements[j]}`, '');
    }
  }

  sections.push(buildIsoControlMapping(meta.isoReference, meta.title), '');

  if (frameworkSections?.length) {
    for (const section of frameworkSections) {
      sections.push(section, '');
    }
  }

  const complianceNum = stmtNum + 1;
  sections.push(
    `## ${complianceNum}. Compliance and Monitoring`,
    '',
    ...(complianceMonitoring ?? [
      'Compliance with this policy is monitored through internal audits, control testing, automated tooling where applicable, and management review.',
      'Non-compliance findings are tracked in the corrective action process with assigned owners and target remediation dates.',
      'Key performance indicators and compliance metrics are reported to management at least quarterly.',
    ]).map((c) => `${c}\n`),
  );

  sections.push(
    `## ${complianceNum + 1}. Exceptions`,
    '',
    ...(exceptions ?? [
      'Exceptions to this policy require a documented business justification, risk assessment, compensating controls, and time-bound approval.',
      'Approved exceptions are recorded in the exception register and reviewed at least quarterly by Information Security and the document owner.',
      'Standing exceptions are not permitted without executive approval and periodic revalidation.',
    ]).map((e) => `${e}\n`),
  );

  sections.push(
    `## ${complianceNum + 2}. Enforcement`,
    '',
    ...(enforcement ?? [
      'Violations of this policy may result in disciplinary action up to and including termination of employment or contract, consistent with HR policy and applicable law.',
      'Willful or negligent violations that cause or risk material harm may be referred to legal counsel or law enforcement where appropriate.',
    ]).map((e) => `${e}\n`),
  );

  sections.push(
    `## ${complianceNum + 3}. Related Documents`,
    '',
    ...(relatedDocuments ?? [
      'Information Security Policy',
      'Documented Operating Procedures Standard',
      'Risk Assessment and Treatment Procedure',
      'Statement of Applicability (SoA)',
    ]).map((d) => `- ${d}`),
    '',
  );

  sections.push(
    `## ${complianceNum + 4}. Review Cycle`,
    '',
    ...(reviewCycle ?? [
      'This policy is reviewed at least annually by the document owner with input from Information Security, legal, and affected business units.',
      'Reviews consider changes in threat landscape, regulatory obligations, audit findings, and organizational scope.',
      'Approved revisions follow the document control and change control process in Section Document Control.',
    ]).map((r) => `${r}\n`),
  );

  sections.push(buildDocumentControlSection(meta));

  return injectContentsIfMissing(sections.join('\n'));
}

export function buildProcedureMarkdown(params: ProcedureContentParams): string {
  const {
    meta,
    purpose,
    scope,
    definitions,
    roles,
    prerequisites,
    steps,
    frameworkSections,
    records,
    relatedDocuments,
  } = params;

  const sections: string[] = [
    `# ${meta.title}`,
    '',
    buildDocumentIdentification(meta),
    '',
    '## 1. Purpose',
    '',
    ...purpose.map((p) => `${p}\n`),
    '## 2. Scope',
    '',
    ...scope.map((s) => `${s}\n`),
  ];

  if (definitions && Object.keys(definitions).length > 0) {
    sections.push(buildDefinitionsSection(definitions).replace('## Definitions', '## 3. Definitions and Abbreviations'), '');
  }

  sections.push(buildRolesSection(roles).replace('## Roles', '## 4. Roles and Responsibilities'), '');

  if (prerequisites?.length) {
    sections.push('## 5. Prerequisites and Inputs', '', ...prerequisites.map((p) => `- ${p}`), '');
  }

  const stepsHeading = prerequisites?.length ? 6 : 5;
  sections.push(`## ${stepsHeading}. Procedure Steps`, '');
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    sections.push(`### Step ${i + 1}: ${step.heading}`, '');
    for (const para of step.description) {
      sections.push(`${para}`, '');
    }
    if (step.substeps?.length) {
      sections.push(...step.substeps.map((s) => `- ${s}`), '');
    }
  }

  const recordsNum = stepsHeading + 1;
  sections.push(
    `## ${recordsNum}. Records and Evidence`,
    '',
    ...(records ?? [
      'Completed checklists, approval records, and system logs supporting execution of this procedure.',
      'Evidence retained per the Records Protection Procedure and applicable retention schedules.',
      'Records must be sufficient to demonstrate conformity during internal and external audits.',
    ]).map((r) => `- ${r}`),
    '',
  );

  sections.push(
    `## ${recordsNum + 1}. Related Policies and Documents`,
    '',
    ...(relatedDocuments ?? [
      'Information Security Policy',
      'Documented Operating Procedures Standard',
      'Applicable topic-specific policies for this control domain',
    ]).map((d) => `- ${d}`),
    '',
  );

  sections.push(buildIsoControlMapping(meta.isoReference, meta.title), '');

  if (frameworkSections?.length) {
    for (const section of frameworkSections) {
      sections.push(section, '');
    }
  }

  sections.push(buildDocumentControlSection(meta));

  return injectContentsIfMissing(sections.join('\n'));
}

export const STANDARD_ISMS_DEFINITIONS: Record<string, string> = {
  ISMS: 'Information Security Management System — the framework of policies, procedures, and controls used to manage information security risk.',
  SoA: 'Statement of Applicability — documents which ISO 27001 Annex A controls are applicable and how they are implemented.',
  CISO: 'Chief Information Security Officer or designated head of information security.',
  CIA: 'Confidentiality, Integrity, and Availability — the core information security objectives.',
  PII: 'Personally Identifiable Information — data that identifies or can identify a natural person.',
};

export const STANDARD_ROLES: RoleEntry[] = [
  {
    role: 'Executive management',
    responsibility: 'Provide tone-from-the-top commitment, approve policies, and allocate resources for effective implementation.',
  },
  {
    role: 'CISO / Head of Information Security',
    responsibility: 'Own the ISMS, maintain this document, monitor compliance, and report security posture to management.',
  },
  {
    role: 'Document owner',
    responsibility: 'Ensure accuracy, periodic review, and communication of this document to affected stakeholders.',
  },
  {
    role: 'Line managers',
    responsibility: 'Ensure personnel awareness, enforce requirements within their teams, and support audits.',
  },
  {
    role: 'All personnel and contractors',
    responsibility: 'Read, acknowledge, and comply with applicable requirements; report security events promptly.',
  },
];
