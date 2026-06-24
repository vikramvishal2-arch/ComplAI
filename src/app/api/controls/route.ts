import { NextResponse } from 'next/server';
import { getActivatedFrameworkIds, getControlComplianceBatch } from '@/lib/store';
import { getAllControlsForActivatedFrameworks } from '@/lib/data/controls';
import { FRAMEWORKS } from '@/lib/data/frameworks';
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

    const activatedIds = await getActivatedFrameworkIds();
    let controls = getAllControlsForActivatedFrameworks(activatedIds);

    if (frameworkId) {
      controls = controls.filter((c) => c.frameworkId === frameworkId);
    }

    const complianceMap = await getControlComplianceBatch(controls.map((c) => c.id));

    const results = controls
      .map((control) => ({
        ...control,
        compliance: complianceMap.get(control.id) ?? defaultCompliance(control.id),
        framework: FRAMEWORKS.find((f) => f.id === control.frameworkId),
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
