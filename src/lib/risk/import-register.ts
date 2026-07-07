import { getLinkableControlsForOrganization } from '@/lib/controls/validate';
import { createControlIssue, createRisk } from '@/lib/store';
import { parseCsvText } from '@/lib/csv';
import type { Control } from '@/lib/types';
import {
  ISSUE_SEVERITY_LABELS,
  RISK_CATEGORY_OPTIONS,
  RISK_IMPACT_LABELS,
  RISK_LIKELIHOOD_LABELS,
  RISK_STATUS_LABELS,
  RISK_TREATMENT_LABELS,
  type ControlIssueSeverity,
  type RiskImpact,
  type RiskLikelihood,
  type RiskStatus,
  type RiskTreatment,
} from '@/lib/types';

export type RiskRegisterImportRowResult = {
  row: number;
  title: string;
  status: 'imported' | 'skipped';
  message?: string;
  entryType?: 'risk' | 'issue';
};

export type RiskRegisterImportResult = {
  imported: number;
  skipped: number;
  results: RiskRegisterImportRowResult[];
};

const TEMPLATE_ROWS = [
  {
    type: 'risk',
    title: 'Incomplete MFA rollout for remote workforce',
    description: 'Legacy VPN users without MFA enrolled',
    framework: 'SOC 2',
    control_reference: 'CC6.5',
    category: 'security',
    likelihood: 'likely',
    impact: 'major',
    treatment: 'mitigate',
    status: 'treating',
    owner: 'Jane Doe',
    due_date: '2026-08-15',
    mitigation_plan: 'Complete Okta MFA enforcement by Q3',
  },
  {
    type: 'issue',
    title: 'Legacy VPN users without MFA',
    description: 'Audit finding on contractor VPN access',
    framework: 'SOC 2',
    control_reference: 'CC6.1',
    severity: 'high',
    status: 'in_progress',
    owner: 'Bob Smith',
    assignee: 'Bob Smith',
    due_date: '2026-07-01',
  },
];

export function buildRiskRegisterImportTemplateCsv(): string {
  const headerSet = new Set<string>();
  for (const row of TEMPLATE_ROWS) {
    Object.keys(row).forEach((key) => headerSet.add(key));
  }
  const headers = Array.from(headerSet);
  const lines = [
    headers.join(','),
    ...TEMPLATE_ROWS.map((row) =>
      headers
        .map((h) => `"${String(row[h as keyof typeof row] ?? '').replace(/"/g, '""')}"`)
        .join(',')
    ),
  ];
  return lines.join('\n');
}

function reverseLabelLookup<T extends string>(
  labels: Record<T, string>,
  value: string
): T | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;

  for (const [key, label] of Object.entries(labels) as [T, string][]) {
    if (key === normalized || label.toLowerCase() === normalized) {
      return key;
    }
  }
  return undefined;
}

function normalizeCategory(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '_');
  if ((RISK_CATEGORY_OPTIONS as readonly string[]).includes(normalized)) {
    return normalized;
  }
  return 'compliance';
}

function resolveControlId(
  row: Record<string, string>,
  controls: (Control & { frameworkShortName: string })[],
  rowNumber: number
): { controlId?: string; error?: string } {
  const directId = row.control_id || row.controlid;
  if (directId) {
    const match = controls.find((c) => c.id === directId);
    if (match) return { controlId: match.id };
    return { error: `Row ${rowNumber}: control ID "${directId}" not found in activated frameworks` };
  }

  const reference = (row.control_reference || row.controlreference || row.control || '').trim();
  if (!reference) {
    return { error: `Row ${rowNumber}: control_reference (or control_id) is required` };
  }

  const framework = (row.framework || row.framework_short_name || '').trim().toLowerCase();
  const refLower = reference.toLowerCase();

  let candidates = controls.filter((c) => c.reference.toLowerCase() === refLower);
  if (framework) {
    candidates = candidates.filter((c) => c.frameworkShortName.toLowerCase() === framework);
  }

  if (candidates.length === 1) {
    return { controlId: candidates[0].id };
  }
  if (candidates.length > 1) {
    return {
      error: `Row ${rowNumber}: control "${reference}" matches multiple frameworks — add a framework column`,
    };
  }

  return {
    error: `Row ${rowNumber}: control "${reference}"${framework ? ` (${row.framework})` : ''} not found in activated frameworks`,
  };
}

export async function importRiskRegisterFromCsv(text: string): Promise<RiskRegisterImportResult> {
  const rows = parseCsvText(text);
  const controls = await getLinkableControlsForOrganization();
  const results: RiskRegisterImportRowResult[] = [];
  let imported = 0;
  let skipped = 0;

  if (rows.length === 0) {
    return {
      imported: 0,
      skipped: 1,
      results: [{ row: 0, title: '', status: 'skipped', message: 'CSV file is empty or has no data rows' }],
    };
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2;
    const title = (row.title || '').trim();
    const entryType = (row.type || row.entry_type || 'risk').trim().toLowerCase();

    if (!title) {
      skipped++;
      results.push({ row: rowNumber, title: '', status: 'skipped', message: 'Title is required' });
      continue;
    }

    const { controlId, error: controlError } = resolveControlId(row, controls, rowNumber);
    if (!controlId || controlError) {
      skipped++;
      results.push({ row: rowNumber, title, status: 'skipped', message: controlError });
      continue;
    }

    try {
      if (entryType === 'issue') {
        const severity =
          reverseLabelLookup(ISSUE_SEVERITY_LABELS, row.severity ?? 'medium') ?? ('medium' as ControlIssueSeverity);
        await createControlIssue(controlId, {
          title,
          description: row.description,
          severity,
          raisedBy: row.raised_by || row.owner || '',
          assignee: row.assignee || row.owner || '',
          dueDate: row.due_date || row.duedate || null,
        });
        imported++;
        results.push({ row: rowNumber, title, status: 'imported', entryType: 'issue' });
        continue;
      }

      const likelihood =
        reverseLabelLookup(RISK_LIKELIHOOD_LABELS, row.likelihood ?? '') ?? ('possible' as RiskLikelihood);
      const impact =
        reverseLabelLookup(RISK_IMPACT_LABELS, row.impact ?? '') ?? ('moderate' as RiskImpact);
      const treatment =
        reverseLabelLookup(RISK_TREATMENT_LABELS, row.treatment ?? '') ?? ('mitigate' as RiskTreatment);
      const status =
        reverseLabelLookup(RISK_STATUS_LABELS, row.status ?? '') ?? ('identified' as RiskStatus);

      await createRisk({
        controlId,
        title,
        description: row.description,
        category: normalizeCategory(row.category ?? ''),
        likelihood,
        impact,
        treatment,
        status,
        owner: row.owner ?? '',
        dueDate: row.due_date || row.duedate || null,
        mitigationPlan: row.mitigation_plan || row.mitigationplan || '',
      });

      imported++;
      results.push({ row: rowNumber, title, status: 'imported', entryType: 'risk' });
    } catch (err) {
      skipped++;
      const message = err instanceof Error ? err.message : 'Import failed';
      results.push({ row: rowNumber, title, status: 'skipped', message });
    }
  }

  return { imported, skipped, results };
}
