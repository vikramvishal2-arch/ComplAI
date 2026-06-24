import { NextResponse } from 'next/server';
import { getFrameworkById } from '@/lib/data/frameworks';
import { getControlsByFramework } from '@/lib/data/controls';
import {
  getControlComplianceBatch,
  getActivations,
  getOpenIssueCountByControlIds,
  getOpenRiskCountByControlIds,
} from '@/lib/store';
import type { ControlCompliance } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

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

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const framework = getFrameworkById(id);
    if (!framework) {
      return NextResponse.json({ error: 'Framework not found' }, { status: 404 });
    }

    const fwControls = getControlsByFramework(id);
    const complianceMap = await getControlComplianceBatch(fwControls.map((c) => c.id));
    const issueCountMap = await getOpenIssueCountByControlIds(fwControls.map((c) => c.id));
    const riskCountMap = await getOpenRiskCountByControlIds(fwControls.map((c) => c.id));
    const activations = await getActivations();

    const controls = fwControls.map((control) => ({
      ...control,
      compliance: complianceMap.get(control.id) ?? defaultCompliance(control.id),
      openIssueCount: issueCountMap.get(control.id) ?? 0,
      openRiskCount: riskCountMap.get(control.id) ?? 0,
    }));

    const activation = activations.find((a) => a.frameworkId === id) ?? null;

    let ready = 0;
    for (const c of controls) {
      if (['implemented', 'audit_ready', 'not_applicable'].includes(c.compliance.status)) {
        ready++;
      }
    }

    return NextResponse.json({
      framework,
      activation,
      controls,
      stats: {
        total: controls.length,
        ready,
        readiness: controls.length ? Math.round((ready / controls.length) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('GET /api/frameworks/[id]', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
