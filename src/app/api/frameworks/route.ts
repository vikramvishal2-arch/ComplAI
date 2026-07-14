import { NextResponse } from 'next/server';
import { getMergedFrameworks } from '@/lib/frameworks/merge-framework-catalog';
import {
  activateFramework,
  deactivateFramework,
  getActivations,
  getActivatedFrameworkIds,
  getDashboardSummary,
  isMvpRequiredFramework,
} from '@/lib/store';

export async function GET() {
  try {
    const [activatedIds, activations, summary, mergedFrameworks] = await Promise.all([
      getActivatedFrameworkIds(),
      getActivations(),
      getDashboardSummary(),
      getMergedFrameworks(),
    ]);

    const frameworks = mergedFrameworks.map((f) => ({
      ...f,
      activated: activatedIds.includes(f.id),
      mvpRequired: isMvpRequiredFramework(f.id),
      activation: activations.find((a) => a.frameworkId === f.id) ?? null,
      readiness: activatedIds.includes(f.id)
        ? summary.byFramework.find((b) => b.frameworkId === f.id)?.readiness ?? 0
        : null,
    }));

    return NextResponse.json({ frameworks });
  } catch (error) {
    console.error('GET /api/frameworks', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { frameworkId, targetAuditDate, action } = body;

    if (action === 'deactivate') {
      await deactivateFramework(frameworkId);
      return NextResponse.json({ success: true, activated: false });
    }

    const activation = await activateFramework(frameworkId, targetAuditDate);
    return NextResponse.json({ success: true, activation });
  } catch (error) {
    console.error('POST /api/frameworks', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
