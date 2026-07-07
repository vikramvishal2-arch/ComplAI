import { NextResponse } from 'next/server';
import {
  createDefaultCompliance,
  getActivatedFrameworkIds,
  getAllControlsForActivatedFrameworks,
  getControlComplianceBatch,
} from '@/lib/store';
import { PRIVACY_FRAMEWORKS } from '@/lib/data/frameworks';
import { PRIVACY_MODULES } from '@/lib/data/modules';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const frameworkId = searchParams.get('frameworkId');
    const moduleId = searchParams.get('moduleId');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();

    const activatedIds = await getActivatedFrameworkIds();
    let controls = getAllControlsForActivatedFrameworks(activatedIds);

    if (frameworkId) {
      controls = controls.filter((c) =>
        c.frameworkMappings.some((m) => m.frameworkId === frameworkId)
      );
    }
    if (moduleId) {
      controls = controls.filter((c) => c.moduleId === moduleId);
    }

    const complianceMap = await getControlComplianceBatch(controls.map((c) => c.id));

    const results = controls
      .map((control) => ({
        ...control,
        compliance: complianceMap.get(control.id) ?? createDefaultCompliance(control.id),
        module: PRIVACY_MODULES.find((m) => m.id === control.moduleId),
      }))
      .filter((item) => {
        if (status && item.compliance.status !== status) return false;
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
