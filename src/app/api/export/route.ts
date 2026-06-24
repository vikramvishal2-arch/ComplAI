import { NextResponse } from 'next/server';
import {
  COMPLIANCE_METHOD_LABELS,
  COMPLIANCE_STATUS_LABELS,
  ISSUE_STATUS_LABELS,
  RISK_STATUS_LABELS,
  type ControlIssueStatus,
  type RiskStatus,
} from '@/lib/types';
import { FRAMEWORKS } from '@/lib/data/frameworks';
import { getAllControlsForActivatedFrameworks } from '@/lib/data/controls';
import {
  getActivatedFrameworkIds,
  getControlComplianceBatch,
  getOrganizationName,
  getRiskRegister,
} from '@/lib/store';
import { csvDownloadResponse, rowsToCsv } from '@/lib/csv';
import { resolvePresentRiskDisplay } from '@/lib/risk/scoring';

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

function displayPresentRisk(entry: Awaited<ReturnType<typeof getRiskRegister>>[number]): string {
  if (entry.entryType !== 'risk') return entry.severityOrScore;
  return resolvePresentRiskDisplay(entry);
}

async function buildControlsExport(searchParams: URLSearchParams) {
  const frameworkId = searchParams.get('frameworkId');
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase();

  const [activatedIds, organization] = await Promise.all([
    getActivatedFrameworkIds(),
    getOrganizationName(),
  ]);

  let controls = getAllControlsForActivatedFrameworks(activatedIds);

  if (frameworkId) {
    controls = controls.filter((c) => c.frameworkId === frameworkId);
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
      const framework = FRAMEWORKS.find((f) => f.id === control.frameworkId);
      return {
        framework: framework?.shortName ?? control.frameworkId,
        reference: control.reference,
        title: control.title,
        domain: control.domain,
        status: COMPLIANCE_STATUS_LABELS[compliance.status],
        complianceMethod: compliance.complianceMethod
          ? COMPLIANCE_METHOD_LABELS[compliance.complianceMethod]
          : '',
        implementationApproach: compliance.implementationApproach,
        owner: compliance.owner,
        targetDate: compliance.targetDate ?? '',
        evidenceNotes: compliance.evidenceNotes,
        naJustification: compliance.naJustification,
        lastUpdated: compliance.lastUpdated,
      };
    });

  return {
    organization,
    exportedAt: new Date().toISOString(),
    frameworkFilter: frameworkId,
    statusFilter: status,
    searchFilter: searchParams.get('search'),
    totalControls: rows.length,
    compliancePlans: rows,
  };
}

async function buildRisksExport(searchParams: URLSearchParams) {
  const entryType = searchParams.get('entryType') ?? 'all';
  const framework = searchParams.get('framework');

  const [organization, entries] = await Promise.all([
    getOrganizationName(),
    getRiskRegister(),
  ]);

  const filtered = entries.filter((entry) => {
    if (entryType !== 'all' && entry.entryType !== entryType) return false;
    if (framework && entry.frameworkShortName !== framework) return false;
    return true;
  });

  const rows = filtered.map((entry) => ({
    type: entry.entryType,
    title: entry.title,
    description: entry.description,
    framework: entry.frameworkShortName,
    controlReference: entry.controlReference,
    controlTitle: entry.controlTitle,
    inherentRisk: entry.entryType === 'risk' ? (entry.inherentRisk ?? '') : '',
    presentRisk: displayPresentRisk(entry),
    status:
      entry.entryType === 'issue'
        ? (ISSUE_STATUS_LABELS[entry.status as ControlIssueStatus] ?? entry.status)
        : (RISK_STATUS_LABELS[entry.status as RiskStatus] ?? entry.status),
    owner: entry.owner || entry.assignee || '',
    dueDate: entry.dueDate ?? '',
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }));

  return {
    organization,
    exportedAt: new Date().toISOString(),
    entryTypeFilter: entryType === 'all' ? null : entryType,
    frameworkFilter: framework,
    totalEntries: rows.length,
    entries: rows,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') ?? 'json';
    const type = searchParams.get('type') ?? 'controls';

    if (type === 'risks') {
      const payload = await buildRisksExport(searchParams);

      if (format === 'csv') {
        const csv = rowsToCsv(payload.entries);
        return csvDownloadResponse(csv, `risk-register-export-${Date.now()}.csv`);
      }

      return NextResponse.json(payload);
    }

    const payload = await buildControlsExport(searchParams);

    if (format === 'csv') {
      const csv = rowsToCsv(payload.compliancePlans);
      return csvDownloadResponse(csv, `controls-export-${Date.now()}.csv`);
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('GET /api/export', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
