import 'server-only';
import { CONTROLS } from '../data/controls';
import { FRAMEWORKS } from '../data/frameworks';
import {
  getActivatedFrameworkIds,
  getControlComplianceBatch,
  getOpenIssueCountByControlIds,
  getOpenRiskCountByControlIds,
  getOrganizationName,
  hasControlEvidenceForContext,
} from '../store';
import { classifyControlRag, getGoGreenActions } from '../compliance/rag-status';
import { createDefaultCompliance } from '../store';
import type { Control, RagStatus } from '../types';
import type {
  ComplianceGap,
  GapAnalysisReport,
  GapCategory,
  GapSeverity,
} from './types';

export type { ComplianceGap, GapAnalysisReport, GapCategory, GapSeverity } from './types';

function getControlsForActivated(activatedIds: string[]): Control[] {
  const set = new Set(activatedIds);
  return CONTROLS.filter((c) => set.has(c.frameworkId));
}

function gapSeverity(rag: RagStatus, category: GapCategory): GapSeverity {
  if (rag === 'red' && (category === 'open_risks' || category === 'audit_blocker')) {
    return 'critical';
  }
  if (rag === 'red') return 'high';
  if (category === 'missing_evidence' || category === 'open_issues') return 'medium';
  return 'low';
}

export async function runGapAnalysis(): Promise<GapAnalysisReport> {
  const [orgName, activatedIds] = await Promise.all([
    getOrganizationName(),
    getActivatedFrameworkIds(),
  ]);
  const controls = getControlsForActivated(activatedIds);
  const controlIds = controls.map((c) => c.id);

  const [complianceMap, issueCounts, riskCounts] = await Promise.all([
    getControlComplianceBatch(controlIds),
    getOpenIssueCountByControlIds(controlIds),
    getOpenRiskCountByControlIds(controlIds),
  ]);

  const allGaps: ComplianceGap[] = [];

  for (const control of controls) {
    const compliance = complianceMap.get(control.id) ?? createDefaultCompliance(control.id);
    const openIssues = issueCounts.get(control.id) ?? 0;
    const openRisks = riskCounts.get(control.id) ?? 0;
    const ragInput = {
      status: compliance.status,
      complianceMethod: compliance.complianceMethod,
      owner: compliance.owner,
      openIssueCount: openIssues,
      openRiskCount: openRisks,
    };
    const rag = classifyControlRag(ragInput);
    const framework = FRAMEWORKS.find((f) => f.id === control.frameworkId);
    const base = {
      controlId: control.id,
      controlReference: control.reference,
      controlTitle: control.title,
      frameworkId: control.frameworkId,
      frameworkName: framework?.shortName ?? control.frameworkId,
      ragStatus: rag,
    };

    const addGap = (category: GapCategory, message: string, actions: string[]) => {
      allGaps.push({
        ...base,
        category,
        severity: gapSeverity(rag, category),
        message,
        suggestedActions: actions,
      });
    };

    if (compliance.status !== 'not_applicable' && !compliance.complianceMethod) {
      addGap(
        'missing_method',
        'No compliance method selected — auditors need to know how you satisfy this control.',
        ['Select policy, technical control, procedure, or other method']
      );
    }

    if (compliance.status !== 'not_applicable' && !compliance.owner.trim()) {
      addGap('missing_owner', 'No accountable owner assigned.', ['Assign a control owner']);
    }

    if (
      compliance.status !== 'not_applicable' &&
      compliance.status !== 'not_started' &&
      !compliance.implementationApproach.trim()
    ) {
      addGap(
        'missing_approach',
        'Implementation approach is empty — audit narrative missing.',
        ['Document tools, processes, and teams used to implement this control']
      );
    }

    const hasEvidenceNotes = compliance.evidenceNotes.trim().length > 0;
    const hasUploadedEvidence = await hasControlEvidenceForContext(control.id, 'compliance');

    if (
      compliance.status !== 'not_applicable' &&
      (compliance.status === 'implemented' ||
        compliance.status === 'audit_ready' ||
        compliance.status === 'needs_review') &&
      !hasEvidenceNotes &&
      !hasUploadedEvidence
    ) {
      addGap(
        'missing_evidence',
        'Marked as implemented/review-ready but no evidence notes or uploaded files.',
        ['Add evidence notes or upload supporting documentation']
      );
    }

    if (openIssues > 0) {
      addGap(
        'open_issues',
        `${openIssues} open issue${openIssues === 1 ? '' : 's'} blocking audit readiness.`,
        getGoGreenActions(ragInput).filter((a) => a.includes('issue'))
      );
    }

    if (openRisks > 0) {
      addGap(
        'open_risks',
        `${openRisks} linked open risk${openRisks === 1 ? '' : 's'} in the risk register.`,
        getGoGreenActions(ragInput).filter((a) => a.includes('risk'))
      );
    }

    if (
      compliance.status === 'audit_ready' &&
      (openIssues > 0 || openRisks > 0)
    ) {
      addGap(
        'audit_blocker',
        'Control marked audit-ready but open issues/risks remain.',
        getGoGreenActions(ragInput)
      );
    }

    if (
      compliance.implementationApproach.trim().length > 0 &&
      compliance.implementationApproach.trim().length < 40 &&
      compliance.status !== 'not_applicable'
    ) {
      addGap(
        'weak_documentation',
        'Implementation approach is too brief for audit defensibility.',
        ['Expand narrative with specific tools, owners, and evidence sources']
      );
    }
  }

  const byCategory = allGaps.reduce(
    (acc, g) => {
      acc[g.category] = (acc[g.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<GapCategory, number>
  );

  const severityOrder: GapSeverity[] = ['critical', 'high', 'medium', 'low'];
  const sorted = [...allGaps].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  return {
    organizationName: orgName,
    generatedAt: new Date().toISOString(),
    summary: {
      totalControls: controls.length,
      gapsFound: allGaps.length,
      critical: allGaps.filter((g) => g.severity === 'critical').length,
      high: allGaps.filter((g) => g.severity === 'high').length,
      medium: allGaps.filter((g) => g.severity === 'medium').length,
      low: allGaps.filter((g) => g.severity === 'low').length,
      byCategory,
    },
    policyGaps: sorted.filter((g) =>
      ['missing_method', 'missing_approach', 'weak_documentation', 'missing_owner'].includes(
        g.category
      )
    ),
    evidenceGaps: sorted.filter((g) => g.category === 'missing_evidence'),
    priorityGaps: sorted.filter((g) => g.severity === 'critical' || g.severity === 'high').slice(0, 20),
    allGaps: sorted,
  };
}
