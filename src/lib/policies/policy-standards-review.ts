import { randomUUID } from 'crypto';
import { getControlById } from '../data/controls';
import { getPolicyTemplateDef } from '../data/policy-template-catalog';
import {
  FRAMEWORK_REGISTRY,
  resolveFrameworkTags,
  type FrameworkTag,
} from '../data/policy-framework-mappings';
import {
  buildDocumentControlSection,
  buildIsoControlMapping,
  buildRolesSection,
  STANDARD_ROLES,
  type DocumentMeta,
} from '../data/policy-template-sections';
import type {
  PolicyReviewRecommendation,
  PolicyReviewSeverity,
  PolicyStandardsReview,
} from './policy-review-types';

export interface PolicyReviewInput {
  title: string;
  content: string;
  documentType: string;
  templateId?: string | null;
  isoReference: string;
  owner: string;
  reviewDate?: Date | null;
  linkedControlIds: string[];
}

interface SectionDef {
  heading: string;
  aliases: string[];
  severity: PolicyReviewSeverity;
  suggestedText: (meta: DocumentMeta) => string;
}

const FRAMEWORK_HEADINGS: Record<Exclude<FrameworkTag, 'iso27001'>, string> = {
  dpdp: 'DPDP Act Requirements',
  gdpr: 'GDPR Requirements',
  ai: 'AI Governance Requirements',
  soc2: 'SOC 2 Mapping',
  'pci-dss': 'PCI DSS Requirements',
  hipaa: 'HIPAA Requirements',
};

const POLICY_SECTIONS: SectionDef[] = [
  {
    heading: 'Document Identification',
    aliases: ['document identification', 'document register'],
    severity: 'high',
    suggestedText: (meta) => `## Document Identification

| Field | Value |
|-------|-------|
| **Document title** | ${meta.title} |
| **Document type** | Policy |
| **ISO 27001:2022 reference** | ${meta.isoReference} |
| **Document owner** | ${meta.owner || '[Role: CISO / Policy Owner]'} |
| **Review frequency** | At least annually, or upon significant change |`,
  },
  {
    heading: 'Purpose',
    aliases: ['1. purpose', 'purpose and objectives'],
    severity: 'critical',
    suggestedText: (meta) => `## 1. Purpose

This policy establishes requirements for ${meta.title.toLowerCase()} to support the organization's Information Security Management System (ISMS) and compliance with ISO 27001:2022 ${meta.isoReference}.`,
  },
  {
    heading: 'Scope',
    aliases: ['2. scope'],
    severity: 'critical',
    suggestedText: () => `## 2. Scope

This policy applies to all personnel, contractors, and third parties who access organizational information assets within the defined ISMS scope.`,
  },
  {
    heading: 'Roles and Responsibilities',
    aliases: ['roles and responsibilities', 'roles & responsibilities', '4. roles'],
    severity: 'high',
    suggestedText: () => buildRolesSection(STANDARD_ROLES),
  },
  {
    heading: 'ISO 27001:2022 Control Mapping',
    aliases: ['iso 27001 control mapping', 'control mapping', 'iso 27001:2022 control mapping'],
    severity: 'high',
    suggestedText: (meta) => buildIsoControlMapping(meta.isoReference, meta.title),
  },
  {
    heading: 'Document Control and Change Control',
    aliases: ['document control', 'change control', 'version history'],
    severity: 'medium',
    suggestedText: (meta) => buildDocumentControlSection(meta),
  },
];

const PROCEDURE_SECTIONS: SectionDef[] = [
  ...POLICY_SECTIONS.filter((s) => s.heading !== 'Purpose' && s.heading !== 'Scope'),
  {
    heading: 'Purpose',
    aliases: ['1. purpose'],
    severity: 'critical',
    suggestedText: (meta) => `## 1. Purpose

This procedure defines the steps required to implement ${meta.title.toLowerCase()} in support of ISO 27001:2022 ${meta.isoReference}.`,
  },
  {
    heading: 'Scope',
    aliases: ['2. scope'],
    severity: 'critical',
    suggestedText: () => `## 2. Scope

This procedure applies to all personnel and systems within the ISMS scope that perform activities covered by this document.`,
  },
  {
    heading: 'Procedure Steps',
    aliases: ['procedure steps', 'steps', '5. procedure steps'],
    severity: 'critical',
    suggestedText: () => `## Procedure Steps

### Step 1: Initiate
Describe the trigger and prerequisites for executing this procedure.

### Step 2: Execute
Document the primary activities, responsible roles, and required evidence.

### Step 3: Review and close
Verify completion, record outcomes, and escalate exceptions per the enforcement section.`,
  },
  {
    heading: 'Records and Evidence',
    aliases: ['records and evidence', 'records & evidence'],
    severity: 'high',
    suggestedText: () => `## Records and Evidence

- Completed checklists, approval records, and system logs supporting execution of this procedure.
- Evidence retained per the Records Protection Procedure and applicable retention schedules.
- Records must be sufficient to demonstrate conformity during internal and external audits.`,
  },
];

function normalizeContent(content: string): string {
  return content.toLowerCase().replace(/\s+/g, ' ');
}

function hasSection(content: string, section: SectionDef): boolean {
  const normalized = normalizeContent(content);
  const headings = [section.heading, ...section.aliases];
  return headings.some((h) => {
    const needle = h.toLowerCase();
    return (
      normalized.includes(`## ${needle}`) ||
      normalized.includes(`# ${needle}`) ||
      normalized.includes(needle)
    );
  });
}

function rec(
  partial: Omit<PolicyReviewRecommendation, 'id' | 'status'>
): PolicyReviewRecommendation {
  return { ...partial, id: randomUUID(), status: 'open' };
}

function checkMissingSections(
  input: PolicyReviewInput,
  meta: DocumentMeta
): PolicyReviewRecommendation[] {
  const sections = input.documentType === 'procedure' ? PROCEDURE_SECTIONS : POLICY_SECTIONS;
  const results: PolicyReviewRecommendation[] = [];

  for (const section of sections) {
    if (hasSection(input.content, section)) continue;
    results.push(
      rec({
        category: 'missing_section',
        severity: section.severity,
        standardRef: input.isoReference || 'A.5.1',
        framework: 'ISO 27001',
        title: `Missing section: ${section.heading}`,
        finding: `The uploaded document does not include a "${section.heading}" section, which is required for ISMS policy documents.`,
        recommendation: `Add a "${section.heading}" section with appropriate content aligned to your ISMS template structure.`,
        suggestedText: section.suggestedText(meta),
        sectionHeading: section.heading,
      })
    );
  }

  return results;
}

function checkFrameworkGaps(input: PolicyReviewInput): PolicyReviewRecommendation[] {
  const templateDef = input.templateId ? getPolicyTemplateDef(input.templateId) : null;
  const tags = templateDef ? resolveFrameworkTags(templateDef) : ['iso27001' as FrameworkTag];
  const results: PolicyReviewRecommendation[] = [];

  for (const tag of tags) {
    if (tag === 'iso27001') continue;
    const heading = FRAMEWORK_HEADINGS[tag];
    const registry = FRAMEWORK_REGISTRY[tag];
    if (hasSection(input.content, { heading, aliases: [heading.toLowerCase()], severity: 'medium', suggestedText: () => '' })) {
      continue;
    }
    results.push(
      rec({
        category: 'framework_gap',
        severity: tag === 'gdpr' || tag === 'dpdp' ? 'high' : 'medium',
        standardRef: input.isoReference || registry.label,
        framework: registry.shortLabel,
        title: `Missing ${registry.shortLabel} mapping section`,
        finding: `Based on the selected template, this document should include a "${heading}" section for ${registry.label} alignment.`,
        recommendation: `Add a framework-specific section addressing ${registry.shortLabel} requirements relevant to this policy domain.`,
        suggestedText: `## ${heading}

This section maps **${input.title}** to **${registry.label}** requirements applicable to [Organization Name].

- Document applicable legal, regulatory, and contractual obligations.
- Define roles responsible for compliance with ${registry.shortLabel}.
- Describe monitoring, evidence retention, and review requirements.
- Cross-reference related ISMS policies and procedures.`,
        sectionHeading: heading,
      })
    );
  }

  return results;
}

function checkControlRequirements(input: PolicyReviewInput): PolicyReviewRecommendation[] {
  const results: PolicyReviewRecommendation[] = [];
  const normalized = normalizeContent(input.content);

  for (const controlId of input.linkedControlIds) {
    const control = getControlById(controlId);
    if (!control) continue;

    const refLower = control.reference.toLowerCase();
    const mentionsRef =
      normalized.includes(refLower) ||
      normalized.includes(controlId.replace(/-/g, ' ')) ||
      normalized.includes(control.title.toLowerCase().slice(0, 30));

    const guidanceKeywords = control.guidance
      .toLowerCase()
      .split(/[,;.]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 12)
      .slice(0, 3);

    const coversGuidance = guidanceKeywords.some((kw) => normalized.includes(kw));

    if (!mentionsRef) {
      results.push(
        rec({
          category: 'control_requirement',
          severity: 'high',
          standardRef: control.reference,
          framework: 'ISO 27001',
          title: `No reference to ${control.reference}`,
          finding: `Linked control ${control.reference} (${control.title}) is not referenced in the document content.`,
          recommendation: `Reference ${control.reference} in the ISO control mapping section and describe how this policy addresses the control requirement.`,
          suggestedText: buildIsoControlMapping(input.isoReference || control.reference, input.title),
          sectionHeading: 'ISO 27001:2022 Control Mapping',
        })
      );
    } else if (!coversGuidance) {
      results.push(
        rec({
          category: 'control_requirement',
          severity: 'medium',
          standardRef: control.reference,
          framework: 'ISO 27001',
          title: `Insufficient coverage of ${control.reference}`,
          finding: `Control ${control.reference} is referenced but the document does not appear to address implementation guidance: ${control.guidance}`,
          recommendation: `Expand policy statements to address: ${control.description}`,
          suggestedText: `### ${control.reference} — ${control.title}

${control.description}

**Implementation:** ${control.guidance}`,
        })
      );
    }
  }

  return results;
}

function checkMetadata(input: PolicyReviewInput): PolicyReviewRecommendation[] {
  const results: PolicyReviewRecommendation[] = [];

  if (!input.owner?.trim()) {
    results.push(
      rec({
        category: 'metadata',
        severity: 'high',
        standardRef: 'A.5.1',
        framework: 'ISO 27001',
        title: 'Document owner not assigned',
        finding: 'No document owner is assigned. ISO 27001 requires policies to have defined ownership and accountability.',
        recommendation: 'Assign a document owner (typically CISO or policy owner role) in policy metadata.',
      })
    );
  }

  if (!input.isoReference?.trim()) {
    results.push(
      rec({
        category: 'metadata',
        severity: 'high',
        standardRef: 'A.5.1',
        framework: 'ISO 27001',
        title: 'ISO reference not set',
        finding: 'No ISO 27001 Annex A reference is linked to this policy.',
        recommendation: 'Set the ISO 27001 control reference (e.g. A.5.1) to enable control mapping and audit traceability.',
      })
    );
  }

  if (!input.reviewDate) {
    results.push(
      rec({
        category: 'metadata',
        severity: 'medium',
        standardRef: 'A.5.1',
        framework: 'ISO 27001',
        title: 'Review date not scheduled',
        finding: 'No next review date is set. ISO 27001 requires policies to be reviewed at planned intervals.',
        recommendation: 'Set a review date — typically 12 months from the effective date.',
      })
    );
  }

  return results;
}

function checkBestPractices(input: PolicyReviewInput): PolicyReviewRecommendation[] {
  const results: PolicyReviewRecommendation[] = [];
  const normalized = normalizeContent(input.content);

  if (!normalized.includes('review') && !normalized.includes('annual')) {
    results.push(
      rec({
        category: 'best_practice',
        severity: 'low',
        standardRef: input.isoReference || 'A.5.1',
        framework: 'ISO 27001',
        title: 'Review cycle not documented',
        finding: 'The document does not mention a review cycle or periodic review requirements.',
        recommendation: 'Document the review frequency (at least annually) in the Document Control section.',
        suggestedText: `### Revision and Review Requirements

- **Planned review:** At least every 12 months from the effective date, or sooner if required by regulation.
- **Triggered review:** Upon material changes to scope, technology, organizational structure, incidents, audit findings, or applicable legal requirements.`,
        sectionHeading: 'Document Control and Change Control',
      })
    );
  }

  if (input.content.trim().length < 500) {
    results.push(
      rec({
        category: 'best_practice',
        severity: 'medium',
        standardRef: input.isoReference || 'A.5.1',
        framework: 'ISO 27001',
        title: 'Document content appears minimal',
        finding: `Extracted content is only ${input.content.trim().length} characters. The document may be incomplete or text extraction may have failed.`,
        recommendation: 'Verify the uploaded file contains full policy text, or paste/edit content manually in the policy editor.',
      })
    );
  }

  return results;
}

export function runPolicyStandardsReview(input: PolicyReviewInput): PolicyStandardsReview {
  const meta: DocumentMeta = {
    title: input.title,
    documentType: input.documentType === 'procedure' ? 'procedure' : 'policy',
    isoReference: input.isoReference || 'A.5.1',
    owner: input.owner,
  };

  const standards = new Set<string>(['ISO/IEC 27001:2022']);
  const templateDef = input.templateId ? getPolicyTemplateDef(input.templateId) : null;
  if (templateDef) {
    for (const tag of resolveFrameworkTags(templateDef)) {
      standards.add(FRAMEWORK_REGISTRY[tag].label);
    }
  }

  const recommendations = [
    ...checkMissingSections(input, meta),
    ...checkFrameworkGaps(input),
    ...checkControlRequirements(input),
    ...checkMetadata(input),
    ...checkBestPractices(input),
  ].sort((a, b) => severityRank(a.severity) - severityRank(b.severity));

  return {
    reviewedAt: new Date().toISOString(),
    standards: [...standards],
    recommendations,
  };
}

function severityRank(severity: PolicyReviewSeverity): number {
  const order: Record<PolicyReviewSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  return order[severity];
}

export function policyReviewSummary(review: PolicyStandardsReview) {
  const open = review.recommendations.filter((r) => r.status === 'open');
  return {
    total: review.recommendations.length,
    open: open.length,
    critical: open.filter((r) => r.severity === 'critical').length,
    high: open.filter((r) => r.severity === 'high').length,
  };
}
