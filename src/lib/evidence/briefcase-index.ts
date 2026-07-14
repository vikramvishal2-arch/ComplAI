import 'server-only';
import { prisma } from '@/lib/db/prisma';
import { getDefaultOrganization } from '@/lib/db/repository';
import { getControlById } from '@/lib/data/controls';
import { getPolicies } from '@/lib/db/policy-repository';
import { parseVendorQuestions, parseVendorResponses } from '@/lib/vendor/assessment';
import {
  parseFindings,
  parseRemediationItems,
} from '@/lib/vendor/vendor-assessment-types';
import type {
  EvidenceBriefcaseIndex,
  EvidenceBriefcaseItem,
  EvidenceBriefcaseModule,
} from './briefcase-types';

function controlMeta(controlId: string) {
  const control = getControlById(controlId);
  if (!control) return { ref: controlId, title: controlId };
  return { ref: control.reference, title: control.title, id: control.id };
}

function item(
  partial: Omit<EvidenceBriefcaseItem, 'searchableText'> & { extra?: string }
): EvidenceBriefcaseItem {
  const { extra, ...rest } = partial;
  const searchableText = [
    rest.module,
    rest.title,
    rest.summary,
    rest.controlRef,
    rest.controlTitle,
    rest.status,
    rest.owner,
    rest.tags.join(' '),
    extra ?? '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return { ...rest, searchableText };
}

const EMPTY_BY_MODULE: Record<EvidenceBriefcaseModule, number> = {
  controls: 0,
  risk: 0,
  tprm: 0,
  internal_audit: 0,
  risk_assessment: 0,
  policy: 0,
  assurance: 0,
};

export async function buildEvidenceBriefcaseIndex(): Promise<EvidenceBriefcaseIndex> {
  const org = await getDefaultOrganization();
  const items: EvidenceBriefcaseItem[] = [];

  const evidenceRows = await prisma.controlEvidence.findMany({
    where: { organizationId: org.id },
    orderBy: { uploadedAt: 'desc' },
  });

  for (const row of evidenceRows) {
    const meta = controlMeta(row.controlId);
    items.push(
      item({
        id: `control-file-${row.id}`,
        module: 'controls',
        title: row.originalName,
        summary: row.description || `Uploaded ${row.context} evidence for ${meta.ref} — ${meta.title}`,
        controlId: row.controlId,
        controlRef: meta.ref,
        controlTitle: meta.title,
        status: row.context,
        recordedAt: row.uploadedAt.toISOString(),
        href: `/controls/${row.controlId}`,
        downloadHref: `/api/controls/${row.controlId}/evidence/${row.id}`,
        tags: ['upload', row.context, meta.ref, row.mimeType],
        extra: meta.title,
      })
    );
  }

  const complianceRows = await prisma.controlCompliance.findMany({
    where: { organizationId: org.id },
  });

  for (const row of complianceRows) {
    if (!row.evidenceNotes.trim()) continue;
    const meta = controlMeta(row.controlId);
    items.push(
      item({
        id: `control-notes-${row.controlId}`,
        module: 'controls',
        title: `Evidence notes — ${meta.ref}`,
        summary: row.evidenceNotes,
        controlId: row.controlId,
        controlRef: meta.ref,
        controlTitle: meta.title,
        status: row.status,
        owner: row.owner,
        href: `/controls/${row.controlId}`,
        tags: ['evidence-notes', meta.ref, row.status],
      })
    );
  }

  const policies = await getPolicies();
  for (const policy of policies) {
    if (!policy.storagePath && !policy.content?.trim()) continue;
    const linkedRaw = policy.linkedControlIds;
    const linked = Array.isArray(linkedRaw)
      ? linkedRaw.map(String)
      : typeof linkedRaw === 'string'
        ? (JSON.parse(linkedRaw) as string[])
        : [];
    const firstControl = linked[0] ? controlMeta(linked[0]) : null;
    items.push(
      item({
        id: `policy-${policy.id}`,
        module: 'policy',
        title: policy.title,
        summary:
          policy.content?.slice(0, 280) ||
          `Policy document (${policy.originalFileName || policy.documentType})`,
        controlId: firstControl?.id,
        controlRef: firstControl?.ref,
        controlTitle: firstControl?.title,
        status: policy.status,
        owner: policy.owner,
        recordedAt: policy.updatedAt?.toISOString(),
        href: `/policies/${policy.id}`,
        downloadHref: policy.storagePath ? `/api/policies/${policy.id}/download` : undefined,
        tags: ['policy', policy.documentType, policy.status, ...(firstControl ? [firstControl.ref] : [])],
      })
    );
  }

  const risks = await prisma.risk.findMany({
    where: { organizationId: org.id },
    orderBy: { updatedAt: 'desc' },
  });

  for (const risk of risks) {
    const meta = controlMeta(risk.controlId);
    items.push(
      item({
        id: `risk-${risk.id}`,
        module: 'risk',
        title: risk.title,
        summary: [risk.description, risk.mitigationPlan].filter(Boolean).join(' — '),
        controlId: risk.controlId,
        controlRef: meta.ref,
        controlTitle: meta.title,
        status: risk.status,
        owner: risk.owner,
        recordedAt: risk.updatedAt.toISOString(),
        href: `/risk-register/risks/${risk.id}`,
        tags: ['risk', risk.status, risk.category, meta.ref],
      })
    );
  }

  const vendors = await prisma.vendor.findMany({
    where: { organizationId: org.id },
    include: { assessments: { orderBy: { createdAt: 'desc' } },
    },
  });

  for (const vendor of vendors) {
    for (const assessment of vendor.assessments) {
      const questions = parseVendorQuestions(assessment.questions);
      const responses = parseVendorResponses(assessment.responses);
      const byQuestion = Object.fromEntries(responses.map((r) => [r.questionId, r]));

      for (const question of questions) {
        const response = byQuestion[question.id];
        if (!response?.answer?.trim() && !response?.status) continue;
        const refs = question.controlRefs?.join(', ') ?? question.category;
        items.push(
          item({
            id: `tprm-${assessment.id}-${question.id}`,
            module: 'tprm',
            title: `${vendor.name} — ${question.checklistLabel ?? question.question.slice(0, 80)}`,
            summary: [
              response.answer,
              question.evidenceGuidance,
              `Response status: ${response.status ?? 'pending'}`,
            ]
              .filter(Boolean)
              .join(' | '),
            controlRef: refs,
            status: response.status,
            recordedAt: assessment.completedAt?.toISOString() ?? assessment.createdAt.toISOString(),
            href: `/vendors/${vendor.id}?tab=questionnaires`,
            tags: ['tprm', vendor.name, question.category, ...(question.controlRefs ?? [])],
            extra: question.question,
          })
        );
      }

      for (const finding of parseFindings(assessment.findings)) {
        items.push(
          item({
            id: `tprm-finding-${finding.id}`,
            module: 'tprm',
            title: `${vendor.name} finding — ${finding.title}`,
            summary: `${finding.description} Recommendation: ${finding.recommendation}`,
            controlRef: finding.controlRefs?.join(', '),
            status: finding.status,
            href: `/vendors/${vendor.id}?tab=findings`,
            tags: ['tprm', 'finding', finding.severity, vendor.name],
          })
        );
      }

      for (const rem of parseRemediationItems(assessment.remediationItems)) {
        items.push(
          item({
            id: `tprm-remediation-${rem.id}`,
            module: 'tprm',
            title: `${vendor.name} remediation — ${rem.title}`,
            summary: rem.description,
            status: rem.status,
            owner: rem.owner,
            recordedAt: rem.dueDate,
            href: `/vendors/${vendor.id}?tab=remediation`,
            tags: ['tprm', 'remediation', rem.severity, vendor.name],
          })
        );
      }
    }
  }

  const evidenceRequests = await prisma.auditEvidenceRequest.findMany({
    where: { organizationId: org.id },
    orderBy: { updatedAt: 'desc' },
  });
  for (const request of evidenceRequests) {
    items.push(
      item({
        id: `audit-er-${request.id}`,
        module: 'internal_audit',
        title: request.request,
        summary: `${request.engagement} — auditor evidence request ${request.id}`,
        controlRef: request.controlRef,
        status: request.status,
        owner: request.assignee,
        recordedAt: request.dueDate?.toISOString().slice(0, 10),
        href: '/audits/external-readiness',
        tags: ['audit', 'evidence-request', request.engagement, request.controlRef],
      })
    );
  }

  const programs = await prisma.auditProgram.findMany({
    where: { organizationId: org.id },
    orderBy: { updatedAt: 'desc' },
  });
  for (const program of programs) {
    items.push(
      item({
        id: `audit-program-${program.id}`,
        module: 'internal_audit',
        title: program.name,
        summary: program.scope,
        status: program.status,
        owner: program.lead,
        recordedAt: program.endDate?.toISOString().slice(0, 10),
        href: '/audits',
        tags: ['internal-audit', program.status],
      })
    );
  }

  const riskDomains = await prisma.auditRiskDomain.findMany({
    where: { organizationId: org.id },
    orderBy: { updatedAt: 'desc' },
  });
  for (const domain of riskDomains) {
    const riskItems = Array.isArray(domain.riskItems)
      ? (domain.riskItems as unknown[]).map((item) => {
          const o = item as Record<string, unknown>;
          return String(o.title ?? '');
        })
      : [];
    const controlRefs = Array.isArray(domain.controlRefs)
      ? (domain.controlRefs as unknown[]).map(String)
      : [];
    items.push(
      item({
        id: `audit-rd-${domain.id}`,
        module: 'risk_assessment',
        title: `Risk domain — ${domain.name}`,
        summary: [
          `Status: ${domain.status}`,
          ...riskItems,
        ].join(' | '),
        status: domain.status,
        owner: domain.owner,
        recordedAt: domain.updatedAt?.toISOString().slice(0, 10),
        href: `/audits/risk-assessment/${domain.id}`,
        tags: ['risk-assessment', domain.name, domain.domainKey, ...controlRefs],
        extra: controlRefs.join(' '),
      })
    );
  }

  const issues = await prisma.controlIssue.findMany({
    where: { organizationId: org.id },
    orderBy: { updatedAt: 'desc' },
  });

  for (const issue of issues) {
    const meta = controlMeta(issue.controlId);
    items.push(
      item({
        id: `issue-${issue.id}`,
        module: 'controls',
        title: issue.title,
        summary: [issue.description, issue.resolutionNotes].filter(Boolean).join(' — '),
        controlId: issue.controlId,
        controlRef: meta.ref,
        controlTitle: meta.title,
        status: issue.status,
        owner: issue.assignee,
        recordedAt: issue.updatedAt.toISOString(),
        href: `/controls/${issue.controlId}`,
        tags: ['issue', issue.severity, meta.ref, issue.status],
      })
    );
  }

  const byModule = { ...EMPTY_BY_MODULE };
  for (const entry of items) {
    byModule[entry.module] += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    total: items.length,
    byModule,
    items,
  };
}
