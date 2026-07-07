import { PrismaClient } from '@prisma/client';
import { ORGANIZATION_NAME } from '../src/lib/brand';

const prisma = new PrismaClient();

const DEFAULT_FRAMEWORKS = ['nist-privacy', 'iso27701', 'gdpr', 'india-dpdp'];

async function main() {
  let org = await prisma.pcOrganization.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!org) {
    org = await prisma.pcOrganization.create({ data: { name: ORGANIZATION_NAME } });
  }

  for (const frameworkId of DEFAULT_FRAMEWORKS) {
    await prisma.pcFrameworkActivation.upsert({
      where: {
        organizationId_frameworkId: { organizationId: org.id, frameworkId },
      },
      create: { organizationId: org.id, frameworkId },
      update: {},
    });
  }

  const samples = [
    {
      controlId: 'pc-gov-01',
      status: 'implementing',
      complianceMethod: 'policy',
      owner: 'DPO Team',
      implementationApproach: 'Privacy program charter drafted and under executive review.',
    },
    {
      controlId: 'pc-gov-02',
      status: 'planning',
      complianceMethod: 'procedure',
      owner: 'Privacy Lead',
      implementationApproach: 'RACI matrix for privacy roles being finalized.',
    },
    {
      controlId: 'pc-inv-01',
      status: 'planning',
      complianceMethod: 'manual_process',
      owner: 'Data Governance',
      implementationApproach: 'RoPA template created; department interviews scheduled.',
    },
  ];

  for (const sample of samples) {
    await prisma.pcControlCompliance.upsert({
      where: {
        organizationId_controlId: { organizationId: org.id, controlId: sample.controlId },
      },
      create: {
        organizationId: org.id,
        controlId: sample.controlId,
        status: sample.status,
        complianceMethod: sample.complianceMethod,
        owner: sample.owner,
        implementationApproach: sample.implementationApproach,
      },
      update: {},
    });
  }

  await prisma.pcPrivacyRisk.upsert({
    where: {
      organizationId_riskReference: { organizationId: org.id, riskReference: 'PR-0001' },
    },
    create: {
      organizationId: org.id,
      riskReference: 'PR-0001',
      source: 'dpia',
      affectedIndividualsAssets: 'Customers — profiling & automated decision rights',
      description:
        'AI-based credit scoring processes personal data without adequate transparency on logic and human review pathway.',
      dataLifecyclePhase: 'processing',
      inherentLikelihood: 'likely',
      inherentImpact: 'major',
      inherentRiskRating: '16 (High)',
      existingControls: 'Privacy notice references automated decisions; limited opt-out workflow.',
      treatmentPlan: 'Implement human-in-the-loop review for adverse decisions; update privacy notice with logic explanation.',
      treatmentStrategy: 'mitigate',
      owner: 'Privacy Risk Manager',
      targetDueDate: new Date('2026-09-30'),
      residualLikelihood: 'possible',
      residualImpact: 'moderate',
      residualRiskRating: '9 (Medium)',
      status: 'in_treatment',
      lastReviewDate: new Date('2026-06-01'),
      nextReviewDate: new Date('2026-12-01'),
      linkedRopaRefs: 'ROPA-012',
      linkedDpiaRefs: 'DPIA-0001',
    },
    update: {},
  });

  await prisma.pcDpiaRecord.upsert({
    where: {
      organizationId_dpiaReference: { organizationId: org.id, dpiaReference: 'DPIA-0001' },
    },
    create: {
      organizationId: org.id,
      dpiaReference: 'DPIA-0001',
      processingActivityName: 'AI credit scoring & automated decisions',
      description: 'Automated profiling of applicants for creditworthiness using transaction history and third-party data.',
      triggerReason: 'Large-scale profiling with legal/significant effects on individuals (Art. 35 GDPR)',
      necessityProportionality:
        'Processing necessary for fraud prevention; proportionality review confirms data minimization to required fields only.',
      dataCategories: 'Financial, contact, behavioural',
      affectedIndividuals: 'Loan applicants, existing customers',
      riskDescription:
        'Risk of unfair automated decisions, lack of transparency, and inability to contest outcomes affecting credit access.',
      dataLifecyclePhase: 'processing',
      inherentLikelihood: 'likely',
      inherentImpact: 'major',
      inherentRiskRating: '16 (High)',
      measuresToMitigate:
        'Human review for adverse decisions; model explainability documentation; data subject objection workflow.',
      dpoConsultation: 'DPO consulted 2026-05-15 — recommended enhanced transparency and appeal process.',
      residualLikelihood: 'possible',
      residualImpact: 'moderate',
      residualRiskRating: '9 (Medium)',
      status: 'dpo_consulted',
      owner: 'Privacy Risk Manager',
      initiatedDate: new Date('2026-05-01'),
      targetCompletionDate: new Date('2026-09-30'),
      lastReviewDate: new Date('2026-06-01'),
      nextReviewDate: new Date('2026-12-01'),
      linkedRopaRefs: 'ROPA-012',
      linkedRiskRefs: 'PR-0001',
    },
    update: {},
  });

  console.log(`PrivyCore seeded for ${org.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
