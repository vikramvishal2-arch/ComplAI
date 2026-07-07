/**
 * Rich demo dataset for customer walkthroughs.
 * Run: npm run demo:seed  (or demo:reset to wipe and re-seed)
 */
import { Prisma, PrismaClient } from '@prisma/client';
import { DEFAULT_APPROVAL_MEMBERS } from '../src/lib/data/approval-members';
import { getPolicyTemplate } from '../src/lib/data/policy-templates';
import { getDefaultApprovalMatrix } from '../src/lib/policies/approval-matrix';
import { seedOrganizationData } from '../src/lib/db/organization-seed';
import { listPublicVendorProfiles, publicProfileToSeedData } from '../src/lib/vendor/public-vendor-profiles';

const prisma = new PrismaClient();

function toJson<T>(value: T): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

export const DEMO_ORG_NAME = 'Acme Industries (Demo)';

async function seedApprovalMembers(organizationId: string) {
  for (const member of DEFAULT_APPROVAL_MEMBERS) {
    await prisma.organizationMember.upsert({
      where: {
        organizationId_email: {
          organizationId,
          email: member.email,
        },
      },
      create: {
        organizationId,
        name: member.name,
        email: member.email,
        title: member.title,
        department: member.department,
        approvalRoles: member.approvalRoles,
      },
      update: {
        name: member.name,
        title: member.title,
        department: member.department,
        approvalRoles: member.approvalRoles,
        active: true,
      },
    });
  }
}

async function seedPolicies(organizationId: string) {
  const existing = await prisma.policy.count({ where: { organizationId } });
  if (existing > 0) return;

  const members = DEFAULT_APPROVAL_MEMBERS.map((m) => ({
    name: m.name,
    title: m.title,
    email: m.email,
    approvalRoles: m.approvalRoles,
  }));

  const templateIds = ['isms-information-security', 'risk-assessment', 'access-control'];
  for (const templateId of templateIds) {
    const template = getPolicyTemplate(templateId);
    if (!template) continue;

    const approvalMatrix = getDefaultApprovalMatrix(template.categoryId, members);

    await prisma.policy.create({
      data: {
        organizationId,
        templateId: template.id,
        categoryId: template.categoryId,
        title: template.title,
        content: template.content,
        isoReference: template.isoReference,
        documentType: template.documentType,
        linkedControlIds: template.controlIds,
        approvalMatrix: toJson(approvalMatrix),
        source: 'template',
        owner: 'Jane Doe',
        status: templateId === 'isms-information-security' ? 'active' : 'draft',
        version: templateId === 'isms-information-security' ? '3.2' : '1.0',
      },
    });
  }
}

async function seedVendors(organizationId: string) {
  const existing = await prisma.vendor.count({ where: { organizationId } });
  if (existing > 0) return;

  for (const profile of listPublicVendorProfiles()) {
    const seed = publicProfileToSeedData(profile);
    const row = await prisma.vendor.create({
      data: {
        organizationId,
        name: seed.name,
        description: seed.description,
        tier: seed.tier,
        dataAccess: seed.dataAccess,
        status: seed.status,
        contactEmail: seed.contactEmail,
        website: seed.website,
        primaryDomain: seed.primaryDomain,
        industry: seed.industry,
        inherentRiskScore: seed.inherentRiskScore,
        securityRating: seed.securityRating,
        ratingGrade: seed.ratingGrade,
        aiRiskScore: seed.securityRating,
        aiRiskSummary: seed.assessment.aiSummary,
        domainScores: toJson(seed.domainScores),
        labels: toJson(seed.labels),
        certifications: toJson(seed.certifications),
        lastAssessedAt: seed.lastAssessedAt,
      },
    });

    await prisma.vendorAssessment.create({
      data: {
        organizationId,
        vendorId: row.id,
        status: seed.assessment.status,
        templateId: seed.assessment.templateId,
        templateName: seed.assessment.templateName,
        questionnaireStatus: seed.assessment.questionnaireStatus,
        questions: toJson([]),
        responses: toJson([]),
        aiScore: seed.assessment.aiScore,
        aiSummary: seed.assessment.aiSummary,
        domainScores: toJson(seed.assessment.domainScores),
        findings: toJson(seed.assessment.findings),
        remediationItems: toJson(seed.assessment.remediationItems),
        completedAt: seed.assessment.completedAt,
        gaps: toJson([]),
      },
    });
  }
}

async function seedProgramCycles(organizationId: string) {
  const existing = await prisma.programCycle.count({ where: { organizationId } });
  if (existing > 0) return;

  const year = new Date().getFullYear();
  const cycles = [
    {
      programType: 'internal_audit',
      title: `FY${year} Annual Internal Audit`,
      description: 'Comprehensive internal audit covering all control domains per the annual plan.',
      periodStart: `${year}-01-01`,
      periodEnd: `${year}-12-31`,
      dueDate: `${year}-09-30`,
      status: 'in_progress',
      owner: 'Internal Audit — Priya Sharma',
    },
    {
      programType: 'external_audit',
      title: `SOC 2 Type II — FY${year}`,
      description: 'External SOC 2 Type II certification audit by independent auditor.',
      periodStart: `${year}-03-01`,
      periodEnd: `${year}-05-30`,
      dueDate: `${year}-08-31`,
      status: 'in_progress',
      owner: 'GRC Program — Jane Doe',
    },
    {
      programType: 'risk_assessment',
      title: `FY${year} Annual Risk Assessment`,
      description: 'Enterprise-wide risk assessment across all business functions and technology.',
      periodStart: `${year}-01-15`,
      periodEnd: `${year}-03-31`,
      dueDate: `${year}-04-30`,
      status: 'completed',
      owner: 'Risk & Compliance — Alice Chen',
      completedAt: `${year}-04-22`,
    },
    {
      programType: 'vendor_assessment',
      title: `FY${year} Vendor Annual Review`,
      description: 'Annual assessment of all critical and high-tier vendors for security posture and compliance.',
      periodStart: `${year}-06-01`,
      periodEnd: `${year}-08-31`,
      dueDate: `${year}-09-15`,
      status: 'upcoming',
      owner: 'Vendor Management — Bob Smith',
    },
    {
      programType: 'risk_register_update',
      title: `FY${year} Risk Register Refresh`,
      description: 'Quarterly review and annual refresh of the enterprise risk register with updated scoring.',
      periodStart: `${year}-07-01`,
      periodEnd: `${year}-07-31`,
      dueDate: `${year}-07-31`,
      status: 'upcoming',
      owner: 'Risk & Compliance — Alice Chen',
    },
  ];

  for (const c of cycles) {
    const completedAt = (c as { completedAt?: string }).completedAt;
    await prisma.programCycle.create({
      data: {
        organizationId,
        programType: c.programType,
        title: c.title,
        description: c.description,
        periodStart: new Date(`${c.periodStart}T00:00:00.000Z`),
        periodEnd: new Date(`${c.periodEnd}T00:00:00.000Z`),
        dueDate: new Date(`${c.dueDate}T00:00:00.000Z`),
        status: c.status,
        owner: c.owner,
        reminderDays: [30, 14, 7],
        completedAt: completedAt ? new Date(`${completedAt}T00:00:00.000Z`) : null,
        lastCompletedAt: completedAt ? new Date(`${completedAt}T00:00:00.000Z`) : null,
      },
    });
  }
}

async function seedExtraCompliance(organizationId: string) {
  const extras = [
    {
      controlId: 'soc2-cc6-2',
      status: 'implemented',
      complianceMethod: 'technical_control',
      implementationApproach: 'New hires provisioned via Okta SCIM; deprovisioning within 24 hours of HR offboarding.',
      owner: 'Jane Doe',
      targetDate: '2026-05-01',
      evidenceNotes: 'Okta lifecycle logs, HR termination tickets',
    },
    {
      controlId: 'soc2-cc6-3',
      status: 'audit_ready',
      complianceMethod: 'procedure',
      implementationApproach: 'Role-based access matrix reviewed quarterly; manager attestation in ComplAI.',
      owner: 'Bob Smith',
      targetDate: '2026-06-01',
      evidenceNotes: 'Q1 attestation export',
    },
    {
      controlId: 'soc2-cc8-1',
      status: 'implementing',
      complianceMethod: 'procedure',
      implementationApproach: 'Change management via Jira with security review gate for production releases.',
      owner: 'Alice Chen',
      targetDate: '2026-07-01',
      evidenceNotes: 'Sample change tickets pending',
    },
    {
      controlId: 'iso-a5-15',
      status: 'planning',
      complianceMethod: 'policy',
      implementationApproach: 'Access control policy update to align with ISO 27001:2022 Annex A wording.',
      owner: 'Jane Doe',
      targetDate: '2026-08-01',
      evidenceNotes: '',
    },
  ];

  for (const sample of extras) {
    await prisma.controlCompliance.upsert({
      where: {
        organizationId_controlId: { organizationId, controlId: sample.controlId },
      },
      create: {
        organizationId,
        controlId: sample.controlId,
        status: sample.status,
        complianceMethod: sample.complianceMethod,
        implementationApproach: sample.implementationApproach,
        owner: sample.owner,
        targetDate: sample.targetDate ? new Date(sample.targetDate) : null,
        evidenceNotes: sample.evidenceNotes,
      },
      update: {},
    });
  }

  const extraIssues = [
    {
      controlId: 'soc2-cc8-1',
      title: 'Emergency changes missing post-implementation review',
      description: 'Three prod hotfixes in March lacked documented post-implementation review within 5 business days.',
      severity: 'medium',
      status: 'open',
      raisedBy: 'Internal Audit',
      assignee: 'Alice Chen',
      dueDate: '2026-06-15',
    },
  ];

  for (const issue of extraIssues) {
    const count = await prisma.controlIssue.count({
      where: { organizationId, controlId: issue.controlId, title: issue.title },
    });
    if (count === 0) {
      await prisma.controlIssue.create({
        data: {
          organizationId,
          ...issue,
          dueDate: new Date(issue.dueDate),
        },
      });
    }
  }

  const extraRisks = [
    {
      controlId: 'soc2-cc9-2',
      title: 'Critical vendor SOC report gaps',
      description: 'Two Tier-1 vendors lack current SOC 2 Type II within the 12-month window.',
      category: 'vendor',
      likelihood: 'possible',
      impact: 'major',
      riskScore: 12,
      treatment: 'mitigate',
      status: 'treating',
      owner: 'Vendor Management',
      dueDate: '2026-05-30',
      mitigationPlan: 'Collect updated reports; escalate to procurement for contract hold if overdue.',
    },
  ];

  for (const risk of extraRisks) {
    const count = await prisma.risk.count({
      where: { organizationId, controlId: risk.controlId, title: risk.title },
    });
    if (count === 0) {
      await prisma.risk.create({
        data: {
          organizationId,
          ...risk,
          dueDate: new Date(risk.dueDate),
        },
      });
    }
  }
}

export async function seedDemoEnvironment() {
  let org = await prisma.organization.findFirst({ orderBy: { createdAt: 'asc' } });

  if (!org) {
    org = await prisma.organization.create({ data: { name: DEMO_ORG_NAME } });
  } else {
    org = await prisma.organization.update({
      where: { id: org.id },
      data: { name: DEMO_ORG_NAME },
    });
  }

  await seedApprovalMembers(org.id);
  await seedOrganizationData(prisma, org.id);
  await seedExtraCompliance(org.id);
  await seedPolicies(org.id);
  await seedVendors(org.id);
  await seedProgramCycles(org.id);

  await prisma.frameworkActivation.updateMany({
    where: { organizationId: org.id, frameworkId: 'soc2-type2' },
    data: { targetAuditDate: new Date('2026-09-30') },
  });

  await prisma.frameworkActivation.updateMany({
    where: { organizationId: org.id, frameworkId: 'iso27001' },
    data: { targetAuditDate: new Date('2026-11-15') },
  });

  return org;
}

async function main() {
  const org = await seedDemoEnvironment();
  console.log(`Demo environment ready: ${org.name} (${org.id})`);
  console.log('Suggested walkthrough: /dashboard → /controls → /policies → /audits → /vendors');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
