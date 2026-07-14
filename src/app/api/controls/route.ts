import { NextResponse } from 'next/server';
import {
  getActivatedFrameworkIds,
  getControlComplianceBatch,
  getEvidenceSummariesByControlIds,
  getOpenIssueCountByControlIds,
  getOpenRiskCountByControlIds,
} from '@/lib/store';
import { getAllControlsForActivatedFrameworks } from '@/lib/data/controls';
import { FRAMEWORKS } from '@/lib/data/frameworks';
import { classifyControlRag, getGoGreenActions, RAG_LABELS } from '@/lib/compliance/rag-status';
import { assessControlEvidenceHealth } from '@/lib/evidence/evidence-health';
import type { ControlCompliance } from '@/lib/types';

function defaultCompliance(controlId: string): ControlCompliance {
  return {
    controlId,
    status: 'not_started',
    complianceMethod: null,
    implementationApproach: '',
    owner: '',
    targetDate: null,
    evidenceNotes: '',
    naJustification: '',
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const frameworkId = searchParams.get('frameworkId');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();
    const ragFilter = searchParams.get('rag');
    const evidenceFilter = searchParams.get('evidenceHealth');

    const activatedIds = await getActivatedFrameworkIds();
    let controls = getAllControlsForActivatedFrameworks(activatedIds);

    if (frameworkId) {
      controls = controls.filter((c) => c.frameworkId === frameworkId);
    }

    const controlIds = controls.map((c) => c.id);
    const [complianceMap, evidenceMap, issueCounts, riskCounts] = await Promise.all([
      getControlComplianceBatch(controlIds),
      getEvidenceSummariesByControlIds(controlIds),
      getOpenIssueCountByControlIds(controlIds),
      getOpenRiskCountByControlIds(controlIds),
    ]);

    const results = controls
      .map((control) => {
        const compliance = complianceMap.get(control.id) ?? defaultCompliance(control.id);
        const evidence = evidenceMap.get(control.id) ?? [];
        const evidenceHealth = assessControlEvidenceHealth({
          status: compliance.status,
          evidence,
        });
        const ragInput = {
          status: compliance.status,
          complianceMethod: compliance.complianceMethod,
          owner: compliance.owner,
          openIssueCount: issueCounts.get(control.id) ?? 0,
          openRiskCount: riskCounts.get(control.id) ?? 0,
          evidenceHealth: evidenceHealth.status,
        };
        const rag = classifyControlRag(ragInput);

        return {
          ...control,
          compliance,
          framework: FRAMEWORKS.find((f) => f.id === control.frameworkId),
          rag,
          ragLabel: RAG_LABELS[rag],
          evidenceHealth,
          goGreenActions: getGoGreenActions(ragInput).slice(0, 3),
        };
      })
      .filter((item) => {
        if (status && item.compliance.status !== status) return false;
        if (ragFilter && item.rag !== ragFilter) return false;
        if (evidenceFilter && item.evidenceHealth.status !== evidenceFilter) return false;
        if (search) {
          const haystack = `${item.reference} ${item.title} ${item.description}`.toLowerCase();
          if (!haystack.includes(search)) return false;
        }
        return true;
      });

    return NextResponse.json({ controls: results, total: results.length });
  } catch (error) {
    console.error('GET /api/controls', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
