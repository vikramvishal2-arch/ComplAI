import 'server-only';
import { getVendors } from '@/lib/db/vendor-repository';
import { getPolicies } from '@/lib/db/policy-repository';
import { getMonitoringStatus } from '@/lib/monitoring/config';
import { getMonitorDashboard } from '@/lib/monitoring/runner';
import { computePortfolioStats } from '@/lib/vendor/tprm-rating';
import { buildVendorPosture } from '@/lib/vendor/vendor-posture';
import { parseFindings, parseRemediationItems } from '@/lib/vendor/vendor-assessment-types';
import {
  AUDIT_FINDINGS,
  AUDIT_RISK_ASSESSMENTS,
  EXTERNAL_READINESS_CHECKLIST,
  INTERNAL_AUDIT_PROGRAMS,
} from '@/lib/data/audits-demo';
import type { LeadershipProgramSummaries } from '@/lib/types';

function auditSlice(): Pick<LeadershipProgramSummaries, 'audits'> {
  const openAuditFindings = AUDIT_FINDINGS.filter(
    (f) => f.status === 'open' || f.status === 'in_progress'
  );
  return {
    audits: {
      activeInternalPrograms: INTERNAL_AUDIT_PROGRAMS.filter((p) => p.status === 'in_progress').length,
      riskAreasAssessed: AUDIT_RISK_ASSESSMENTS.length,
      openFindings: openAuditFindings.length,
      externalReadinessReady: EXTERNAL_READINESS_CHECKLIST.filter((i) => i.status === 'ready').length,
      externalReadinessTotal: EXTERNAL_READINESS_CHECKLIST.length,
      topFindings: openAuditFindings.slice(0, 5).map((f) => ({
        id: f.id,
        title: f.title,
        severity: f.severity,
        source: f.source,
      })),
    },
  };
}

function countTprmOpenItems(
  vendors: Awaited<ReturnType<typeof getVendors>>
): { openFindings: number; openRemediations: number } {
  let openFindings = 0;
  let openRemediations = 0;

  for (const vendor of vendors) {
    for (const assessment of vendor.assessments ?? []) {
      openFindings += parseFindings(assessment.findings).filter(
        (f) => f.status !== 'resolved' && f.status !== 'accepted'
      ).length;
      openRemediations += parseRemediationItems(assessment.remediationItems).filter(
        (r) => r.status !== 'completed' && r.status !== 'waived'
      ).length;
    }
  }

  return { openFindings, openRemediations };
}

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[leadership] ${label} failed:`, error);
    return fallback;
  }
}

/** Lightweight program metrics — no full gap analysis or duplicate compliance scans. */
export async function getLeadershipProgramSummaries(): Promise<LeadershipProgramSummaries> {
  const { audits } = auditSlice();

  const [vendors, policies, monitorDashboard] = await Promise.all([
    safe('vendors', getVendors, [] as Awaited<ReturnType<typeof getVendors>>),
    safe('policies', getPolicies, [] as Awaited<ReturnType<typeof getPolicies>>),
    safe('monitoring', getMonitorDashboard, { latestAws: null, latestAzure: null, recentRuns: [] }),
  ]);

  let monitorConfig = { aws: { configured: false }, azure: { configured: false } };
  try {
    monitorConfig = getMonitoringStatus();
  } catch (error) {
    console.error('[leadership] monitoring config failed:', error);
  }

  const { openFindings, openRemediations } = countTprmOpenItems(vendors);
  const vendorsForStats = vendors.map((v) => {
    const posture = buildVendorPosture(
      {
        id: v.id,
        name: v.name,
        primaryDomain: v.primaryDomain,
        tier: v.tier,
        securityRating: v.securityRating,
        aiRiskScore: v.aiRiskScore,
        ratingGrade: v.ratingGrade,
        domainScores: v.domainScores,
        aiRiskSummary: v.aiRiskSummary,
        certifications: v.certifications,
      },
      { questionnaireCompleted: (v.assessments ?? []).some((a) => a.status === 'completed') }
    );
    return {
      status: v.status,
      securityRating: posture.score100 ?? v.securityRating,
      aiRiskScore: v.aiRiskScore,
      assessments: v.assessments ?? [],
    };
  });
  const tprmStats = computePortfolioStats(vendorsForStats, openFindings, openRemediations);

  return {
    compliance: {
      auditReady: 0,
      implementing: 0,
      notStarted: 0,
      overallReadiness: 0,
      totalControls: 0,
    },
    tprm: {
      vendorCount: tprmStats.vendorCount,
      monitoredCount: tprmStats.monitoredCount,
      averageRating950: tprmStats.averageRating950,
      criticalFindings: tprmStats.criticalFindings,
      pendingQuestionnaires: tprmStats.pendingQuestionnaires,
      openRemediations: tprmStats.openRemediations,
    },
    gaps: {
      gapsFound: 0,
      critical: 0,
      policyGaps: 0,
      evidenceGaps: 0,
      topGaps: [],
    },
    audits,
    policies: {
      total: policies.length,
      draft: policies.filter((p) => p.status === 'draft').length,
      inReview: policies.filter((p) => p.status === 'review').length,
      approved: policies.filter((p) => p.status === 'approved' || p.status === 'active').length,
      archived: policies.filter((p) => p.status === 'archived').length,
    },
    monitoring: {
      awsConfigured: monitorConfig.aws.configured,
      azureConfigured: monitorConfig.azure.configured,
      awsPassed: monitorDashboard.latestAws?.passed ?? null,
      awsFailed: monitorDashboard.latestAws?.failed ?? null,
      azurePassed: monitorDashboard.latestAzure?.passed ?? null,
      azureFailed: monitorDashboard.latestAzure?.failed ?? null,
    },
  };
}
