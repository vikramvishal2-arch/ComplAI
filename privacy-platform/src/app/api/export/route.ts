import { NextResponse } from 'next/server';
import { PRIVACY_FRAMEWORKS } from '@/lib/data/frameworks';
import { PRIVACY_MODULES } from '@/lib/data/modules';
import {
  COMPLIANCE_METHOD_LABELS,
  COMPLIANCE_STATUS_LABELS,
} from '@/lib/types';
import {
  getActivatedFrameworkIds,
  getControlComplianceBatch,
  getOrganizationName,
  getAllControlsForActivatedFrameworks,
} from '@/lib/store';
import { csvDownloadResponse, rowsToCsv } from '@/lib/csv';

function defaultCompliance() {
  return {
    status: 'not_started' as const,
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
    const format = searchParams.get('format') ?? 'json';
    const frameworkId = searchParams.get('frameworkId');
    const moduleId = searchParams.get('moduleId');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();

    const [activatedIds, organization] = await Promise.all([
      getActivatedFrameworkIds(),
      getOrganizationName(),
    ]);

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

    const rows = controls
      .filter((control) => {
        const compliance = complianceMap.get(control.id) ?? defaultCompliance();
        if (status && compliance.status !== status) return false;
        if (search) {
          const haystack = `${control.reference} ${control.title} ${control.description}`.toLowerCase();
          if (!haystack.includes(search)) return false;
        }
        return true;
      })
      .map((control) => {
        const compliance = complianceMap.get(control.id) ?? defaultCompliance();
        const mod = PRIVACY_MODULES.find((m) => m.id === control.moduleId);
        const frameworks = control.frameworkMappings
          .map((m) => PRIVACY_FRAMEWORKS.find((f) => f.id === m.frameworkId)?.shortName)
          .filter(Boolean)
          .join(', ');
        return {
          module: mod?.shortName ?? control.moduleId,
          reference: control.reference,
          title: control.title,
          frameworks,
          status: COMPLIANCE_STATUS_LABELS[compliance.status],
          complianceMethod: compliance.complianceMethod
            ? COMPLIANCE_METHOD_LABELS[compliance.complianceMethod]
            : '',
          implementationApproach: compliance.implementationApproach,
          owner: compliance.owner,
          targetDate: compliance.targetDate ?? '',
          evidenceNotes: compliance.evidenceNotes,
          lastUpdated: compliance.lastUpdated,
        };
      });

    const payload = {
      organization,
      exportedAt: new Date().toISOString(),
      totalControls: rows.length,
      compliancePlans: rows,
    };

    if (format === 'csv') {
      const csv = rowsToCsv(rows);
      return csvDownloadResponse(csv, `privycore-controls-export-${Date.now()}.csv`);
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('GET /api/export', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
