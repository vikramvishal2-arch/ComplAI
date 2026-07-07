import { NextResponse } from 'next/server';
import { PRIVACY_FRAMEWORKS } from '@/lib/data/frameworks';
import {
  activateFramework,
  deactivateFramework,
  getActivatedFrameworkIds,
  getDashboardSummary,
} from '@/lib/store';

export async function GET() {
  try {
    const [activatedIds, summary] = await Promise.all([
      getActivatedFrameworkIds(),
      getDashboardSummary(),
    ]);

    const frameworks = PRIVACY_FRAMEWORKS.map((f) => ({
      ...f,
      activated: activatedIds.includes(f.id),
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
    const { frameworkId, action } = body;

    if (action === 'deactivate') {
      await deactivateFramework(frameworkId);
      return NextResponse.json({ success: true, activated: false });
    }

    await activateFramework(frameworkId);
    return NextResponse.json({ success: true, activated: true });
  } catch (error) {
    console.error('POST /api/frameworks', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
