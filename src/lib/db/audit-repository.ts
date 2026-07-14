import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import {
  AUDIT_ENGAGEMENTS,
  AUDIT_FINDINGS,
  EVIDENCE_REQUESTS,
  EXTERNAL_READINESS_CHECKLIST,
  INTERNAL_AUDIT_PROGRAMS,
} from '@/lib/data/audits-demo';

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  return new Date(`${s}T00:00:00.000Z`);
}

export function auditWorkflowErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2021') {
      return 'Audit tables are missing. Run: npm run db:push (or on EC2: bash deploy/ec2-update.sh after pulling this fix).';
    }
    if (error.code === 'P2022') {
      return 'Audit database schema is out of date. Run: npm run db:push';
    }
  }

  if (error instanceof Error) {
    if (
      error.message.includes("reading 'create'") ||
      error.message.includes("reading 'count'") ||
      error.message.includes('auditProgram') ||
      error.message.includes('audit_programs')
    ) {
      return 'Audit module Prisma client is out of date. Stop the dev server, run: npm run db:generate (or npx prisma generate), then restart npm run dev.';
    }
    return error.message;
  }

  return 'Failed to process audit request';
}

function assertAuditModelsPresent() {
  const p = prisma as unknown as Record<string, unknown>;
  const required = [
    'auditProgram',
    'auditFinding',
    'auditRiskAssessment',
    'auditRiskDomain',
    'externalReadinessItem',
    'auditEvidenceRequest',
    'auditEngagement',
  ] as const;

  const missing = required.filter((k) => !(k in p));
  if (missing.length > 0) {
    throw new Error(
      `Audit module Prisma client is out of date (missing: ${missing.join(
        ', '
      )}). Stop the dev server, run: npm run db:generate (or npx prisma generate), then restart npm run dev.`
    );
  }
}

export async function ensureAuditWorkflowSeed(organizationId: string): Promise<void> {
  assertAuditModelsPresent();
  const programCount = await prisma.auditProgram.count({ where: { organizationId } });
  if (programCount === 0) {
    for (const program of INTERNAL_AUDIT_PROGRAMS) {
      await prisma.auditProgram.create({
        data: {
          organizationId,
          name: program.name,
          scope: program.scope,
          lead: program.lead,
          status: program.status,
          startDate: parseDate(program.startDate),
          endDate: parseDate(program.endDate),
          coverage: program.coverage,
        },
      });
    }
  }

  const findingCount = await prisma.auditFinding.count({ where: { organizationId } });
  if (findingCount === 0) {
    for (const finding of AUDIT_FINDINGS) {
      await prisma.auditFinding.create({
        data: {
          organizationId,
          source: finding.source,
          engagement: finding.engagement,
          severity: finding.severity,
          title: finding.title,
          controlRef: finding.controlRef,
          owner: finding.owner,
          status: finding.status,
          dueDate: parseDate(finding.dueDate),
        },
      });
    }
  }

  const readinessCount = await prisma.externalReadinessItem.count({ where: { organizationId } });
  if (readinessCount === 0) {
    for (const item of EXTERNAL_READINESS_CHECKLIST) {
      await prisma.externalReadinessItem.create({
        data: {
          organizationId,
          category: item.category,
          task: item.task,
          framework: item.framework,
          owner: item.owner,
          status: item.status,
          dueDate: parseDate(item.dueDate),
        },
      });
    }
  }

  const requestCount = await prisma.auditEvidenceRequest.count({ where: { organizationId } });
  if (requestCount === 0) {
    for (const request of EVIDENCE_REQUESTS) {
      await prisma.auditEvidenceRequest.create({
        data: {
          organizationId,
          engagement: request.engagement,
          request: request.request,
          controlRef: request.controlRef,
          assignee: request.assignee,
          status: request.status,
          dueDate: parseDate(request.dueDate),
        },
      });
    }
  }

  const engagementCount = await prisma.auditEngagement.count({
    where: { organizationId, type: 'external' },
  });
  if (engagementCount === 0) {
    for (const engagement of AUDIT_ENGAGEMENTS.filter((e) => e.type === 'external')) {
      await prisma.auditEngagement.create({
        data: {
          organizationId,
          name: engagement.name,
          framework: engagement.framework,
          auditor: engagement.auditor,
          type: engagement.type,
          status: engagement.status,
          startDate: parseDate(engagement.startDate),
          endDate: parseDate(engagement.endDate),
          readiness: engagement.readiness,
        },
      });
    }
  }
}

/** Launch 16 security risk domains with mapped controls. */
export async function launchAuditRiskAssessments(organizationId: string) {
  const { launchRiskAssessmentDomains } = await import('@/lib/db/risk-assessment-repository');
  return launchRiskAssessmentDomains(organizationId);
}
