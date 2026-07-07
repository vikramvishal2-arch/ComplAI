import { Prisma, PrismaClient } from '@prisma/client';
import type { ControlCompliance, ControlRemediation } from '../types';
import { ACCESS_INTEGRATION_PROVIDERS } from '../data/access-integrations';
import { PRODUCT_NAME } from '../brand';

export const MVP_REQUIRED_FRAMEWORKS = ['soc2-type2', 'iso27001'];

function toJsonValue<T>(value: T): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

function parseDateString(s: string | null | undefined): Date | null {
  if (!s) return null;
  return new Date(`${s}T00:00:00.000Z`);
}

export async function ensureMvpFrameworks(
  prisma: PrismaClient,
  orgId: string
): Promise<void> {
  const required: { id: string; targetAuditDate: string | null }[] = [
    { id: 'soc2-type2', targetAuditDate: '2026-10-01' },
    { id: 'iso27001', targetAuditDate: null },
  ];

  for (const { id, targetAuditDate } of required) {
    await prisma.frameworkActivation.upsert({
      where: {
        organizationId_frameworkId: { organizationId: orgId, frameworkId: id },
      },
      create: {
        organizationId: orgId,
        frameworkId: id,
        targetAuditDate: parseDateString(targetAuditDate),
      },
      update: {},
    });
  }
}

export async function seedOrganizationData(
  prisma: PrismaClient,
  orgId: string
): Promise<void> {
  await ensureMvpFrameworks(prisma, orgId);

  const complianceSamples: Partial<ControlCompliance>[] = [
    {
      controlId: 'soc2-cc6-1',
      status: 'audit_ready',
      complianceMethod: 'technical_control',
      implementationApproach:
        `RBAC enforced via Okta with least-privilege groups. Quarterly access reviews documented in ${PRODUCT_NAME}.`,
      owner: 'Jane Doe',
      targetDate: '2026-06-01',
      evidenceNotes: 'Okta group export, access review sign-off Q1 2026',
    },
    {
      controlId: 'soc2-cc6-5',
      status: 'implementing',
      complianceMethod: 'technical_control',
      implementationApproach:
        'MFA required for all remote access via Okta. Rollout to legacy VPN users in progress.',
      owner: 'Bob Smith',
      targetDate: '2026-07-15',
      evidenceNotes: 'Okta MFA policy screenshot pending final rollout',
    },
    {
      controlId: 'soc2-cc7-3',
      status: 'planning',
      complianceMethod: 'procedure',
      implementationApproach:
        'Updating incident response runbook to align with NIST SP 800-61. Tabletop scheduled for August.',
      owner: 'Alice Chen',
      targetDate: '2026-08-01',
      evidenceNotes: '',
    },
    {
      controlId: 'iso-a5-1',
      status: 'implemented',
      complianceMethod: 'policy',
      implementationApproach:
        'Information Security Policy v3.2 approved by board. Annual review cycle established.',
      owner: 'Jane Doe',
      targetDate: '2026-05-01',
      evidenceNotes: 'Signed policy PDF, board minutes',
    },
  ];

  for (const sample of complianceSamples) {
    if (!sample.controlId) continue;
    await prisma.controlCompliance.upsert({
      where: {
        organizationId_controlId: { organizationId: orgId, controlId: sample.controlId },
      },
      create: {
        organizationId: orgId,
        controlId: sample.controlId,
        status: sample.status ?? 'not_started',
        complianceMethod: sample.complianceMethod ?? null,
        implementationApproach: sample.implementationApproach ?? '',
        owner: sample.owner ?? '',
        targetDate: parseDateString(sample.targetDate),
        evidenceNotes: sample.evidenceNotes ?? '',
        naJustification: sample.naJustification ?? '',
      },
      update: {},
    });
  }

  const remediationSample: ControlRemediation = {
    controlId: 'soc2-cc6-1',
    actions: [
      {
        id: 'ra-1',
        title: 'Configure Okta RBAC groups',
        description: 'Map application roles to least-privilege Okta groups per business unit.',
        remediationLink:
          'https://help.okta.com/oie/en-us/content/topics/users-groups-profiles/usgp-group-rules.htm',
        linkLabel: 'Okta group rules documentation',
        status: 'completed',
        assignee: 'Bob Smith',
        dueDate: '2026-05-15',
        notes: 'Completed for production apps.',
      },
      {
        id: 'ra-2',
        title: 'Quarterly access review',
        description: 'Managers attest all user access; revoke stale permissions.',
        remediationLink:
          'https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview',
        linkLabel: 'Entra access reviews guide',
        status: 'in_progress',
        assignee: 'Jane Doe',
        dueDate: '2026-06-30',
        notes: 'Q2 review in progress.',
      },
    ],
    accessConnections: [
      {
        providerId: 'okta',
        status: 'connected',
        accountIdentifier: 'propelready.okta.com',
        adminContact: 'it-admin@propelready.com',
        connectedAt: '2026-01-15T00:00:00.000Z',
        notes: 'Production IdP — MFA enforced org-wide.',
      },
      {
        providerId: 'aws_iam',
        status: 'connected',
        accountIdentifier: '123456789012',
        adminContact: 'cloud-ops@propelready.com',
        connectedAt: '2026-02-01T00:00:00.000Z',
        notes: 'SSO via Okta SAML federation.',
      },
      {
        providerId: 'github',
        status: 'pending',
        accountIdentifier: 'propel-ready-solutions',
        adminContact: 'devops@propelready.com',
        connectedAt: null,
        notes: 'Org MFA requirement rollout scheduled.',
      },
      ...ACCESS_INTEGRATION_PROVIDERS.filter(
        (p) => !['okta', 'aws_iam', 'github'].includes(p.id)
      ).map((p) => ({
        providerId: p.id,
        status: 'not_connected' as const,
        accountIdentifier: '',
        adminContact: '',
        connectedAt: null,
        notes: '',
      })),
    ],
    lastUpdated: new Date().toISOString(),
  };

  await prisma.controlRemediation.upsert({
    where: {
      organizationId_controlId: { organizationId: orgId, controlId: remediationSample.controlId },
    },
    create: {
      organizationId: orgId,
      controlId: remediationSample.controlId,
      actions: toJsonValue(remediationSample.actions),
      accessConnections: toJsonValue(remediationSample.accessConnections),
    },
    update: {},
  });

  const existingIssues = await prisma.controlIssue.count({
    where: { organizationId: orgId, controlId: 'soc2-cc6-1' },
  });
  if (existingIssues === 0) {
    await prisma.controlIssue.create({
      data: {
        organizationId: orgId,
        controlId: 'soc2-cc6-1',
        title: 'Legacy VPN users without MFA',
        description:
          'Audit found 12 contractor accounts on legacy VPN without MFA enrolled. Must remediate before Type II window.',
        severity: 'high',
        status: 'in_progress',
        raisedBy: 'Internal Audit',
        assignee: 'Bob Smith',
        dueDate: parseDateString('2026-07-01'),
        resolutionNotes: '',
      },
    });
  }

  const existingRisks = await prisma.risk.count({
    where: { organizationId: orgId, controlId: 'soc2-cc6-5' },
  });
  if (existingRisks === 0) {
    await prisma.risk.create({
      data: {
        organizationId: orgId,
        controlId: 'soc2-cc6-5',
        title: 'Incomplete MFA rollout for remote workforce',
        description:
          'Residual risk from partial MFA deployment across legacy VPN and contractor access paths.',
        category: 'security',
        likelihood: 'likely',
        impact: 'major',
        riskScore: 16,
        treatment: 'mitigate',
        status: 'treating',
        owner: 'Jane Doe',
        dueDate: parseDateString('2026-08-15'),
        mitigationPlan: 'Complete Okta MFA enforcement; decommission legacy VPN by Q3.',
      },
    });
  }
}
