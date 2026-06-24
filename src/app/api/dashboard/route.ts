import { NextResponse } from 'next/server';
import {
  getDashboardSummary,
  getActivatedFrameworkIds,
  getControlComplianceBatch,
} from '@/lib/store';
import { getAllControlsForActivatedFrameworks } from '@/lib/data/controls';
import { FRAMEWORKS } from '@/lib/data/frameworks';

export async function GET() {
  try {
    const [summary, activatedIds] = await Promise.all([
      getDashboardSummary(),
      getActivatedFrameworkIds(),
    ]);

    const controls = getAllControlsForActivatedFrameworks(activatedIds);
    const complianceMap = await getControlComplianceBatch(controls.map((c) => c.id));

    const needsAttention = controls
      .map((c) => ({
        control: c,
        compliance:
          complianceMap.get(c.id) ?? {
            controlId: c.id,
            status: 'not_started' as const,
            complianceMethod: null,
            implementationApproach: '',
            owner: '',
            targetDate: null,
            evidenceNotes: '',
            naJustification: '',
            lastUpdated: new Date().toISOString(),
          },
        framework: FRAMEWORKS.find((f) => f.id === c.frameworkId),
      }))
      .filter(
        (item) =>
          item.compliance.status === 'not_started' ||
          item.compliance.status === 'needs_review' ||
          (item.compliance.status === 'implementing' && !item.compliance.complianceMethod)
      )
      .slice(0, 8);

    return NextResponse.json({ summary, needsAttention });
  } catch (error) {
    console.error('GET /api/dashboard', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
