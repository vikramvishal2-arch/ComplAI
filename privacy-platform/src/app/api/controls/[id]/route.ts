import { NextResponse } from 'next/server';
import { getControlById } from '@/lib/data/controls';
import { PRIVACY_FRAMEWORKS } from '@/lib/data/frameworks';
import { PRIVACY_MODULES } from '@/lib/data/modules';
import {
  getControlCompliance,
  updateControlComplianceWithValidation,
  getControlRemediation,
  updateControlRemediation,
  getControlIssues,
  getControlEvidence,
  hasControlEvidenceForContext,
} from '@/lib/store';
import { AuditReadyBlockedError } from '@/lib/compliance/audit-ready';
import { EVIDENCE_REQUIRED_MESSAGES } from '@/lib/evidence/validation';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const control = getControlById(id);
    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }

    const [compliance, remediation, issues, evidence] = await Promise.all([
      getControlCompliance(control.id),
      getControlRemediation(control.id),
      getControlIssues(control.id),
      getControlEvidence(control.id),
    ]);

    const module = PRIVACY_MODULES.find((m) => m.id === control.moduleId);
    const openIssueCount = issues.filter(
      (i) => i.status === 'open' || i.status === 'in_progress'
    ).length;

    return NextResponse.json({
      control,
      module,
      frameworks: control.frameworkMappings.map((m) => ({
        ...m,
        framework: PRIVACY_FRAMEWORKS.find((f) => f.id === m.frameworkId),
      })),
      compliance,
      remediation,
      issues,
      evidence,
      openIssueCount,
    });
  } catch (error) {
    console.error('GET /api/controls/[id]', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const control = getControlById(id);
    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }

    const body = await request.json();
    let compliance = await getControlCompliance(id);
    let remediation = await getControlRemediation(id);
    const issues = await getControlIssues(id);

    if (body.remediation) {
      const hasEvidence = await hasControlEvidenceForContext(id, 'remediation');
      if (!hasEvidence) {
        return NextResponse.json(
          { error: EVIDENCE_REQUIRED_MESSAGES.remediation },
          { status: 400 }
        );
      }
      remediation = await updateControlRemediation(id, {
        actions: body.remediation.actions,
      });
    }

    const complianceFields = [
      'status',
      'complianceMethod',
      'implementationApproach',
      'owner',
      'targetDate',
      'evidenceNotes',
      'naJustification',
    ] as const;

    const hasComplianceUpdate = complianceFields.some((field) => field in body);
    if (hasComplianceUpdate) {
      const hasEvidence = await hasControlEvidenceForContext(id, 'compliance');
      if (!hasEvidence) {
        return NextResponse.json(
          { error: EVIDENCE_REQUIRED_MESSAGES.compliance },
          { status: 400 }
        );
      }
      const updates: Record<string, unknown> = {};
      for (const field of complianceFields) {
        if (field in body) updates[field] = body[field];
      }
      compliance = await updateControlComplianceWithValidation(id, updates, issues);
    }

    return NextResponse.json({ compliance, remediation });
  } catch (error) {
    if (error instanceof AuditReadyBlockedError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('PATCH /api/controls/[id]', error);
    return NextResponse.json({ error: 'Failed to save control' }, { status: 503 });
  }
}
