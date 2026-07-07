import { NextResponse } from 'next/server';
import {
  createDefaultCompliance,
  getActivatedFrameworkIds,
  getAllControlsForActivatedFrameworks,
  getControlComplianceBatch,
  getDashboardSummary,
} from '@/lib/store';
import { PRIVACY_MODULES } from '@/lib/data/modules';

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
        compliance: complianceMap.get(c.id) ?? createDefaultCompliance(c.id),
        module: PRIVACY_MODULES.find((m) => m.id === c.moduleId),
      }))
      .filter(
        (item) =>
          item.compliance.status === 'not_started' ||
          item.compliance.status === 'needs_review' ||
          (item.compliance.status === 'implementing' && !item.compliance.owner)
      )
      .slice(0, 8);

    return NextResponse.json({ summary, needsAttention });
  } catch (error) {
    console.error('GET /api/dashboard', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
