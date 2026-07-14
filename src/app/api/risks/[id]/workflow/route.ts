import { NextResponse } from 'next/server';
import {
  getRiskWorkflow,
  getRiskById,
  setRiskControlMappings,
  assessRiskControl,
  retestRiskControl,
} from '@/lib/store';
import {
  validateControlForOrganization,
  validateControlsForOrganization,
  ControlValidationError,
} from '@/lib/controls/validate';
import { DEVIATION_EFFECTIVENESS, type ControlEffectiveness } from '@/lib/types';
type RouteContext = { params: Promise<{ id: string }> };

const EFFECTIVENESS_VALUES: ControlEffectiveness[] = [
  'not_assessed',
  'effective',
  'ineffective',
  'failed',
  'non_compliant',
];

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const workflow = await getRiskWorkflow(id);
    if (!workflow) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }
    return NextResponse.json(workflow);
  } catch (error) {
    console.error('GET /api/risks/[id]/workflow', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const controlIds: string[] = Array.isArray(body.controlIds)
      ? body.controlIds
      : body.controlId
        ? [body.controlId]
        : [];

    if (controlIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one mapped control is required' },
        { status: 400 }
      );
    }

    await validateControlsForOrganization(controlIds);

    const mappings = await setRiskControlMappings(
      id,
      controlIds,
      body.primaryControlId ?? controlIds[0]
    );
    const risk = await getRiskById(id);
    return NextResponse.json({
      mappings,
      risk: risk
        ? { ...risk, controlIds: mappings.map((m) => m.controlId) }
        : null,
    });
  } catch (error) {
    if (error instanceof ControlValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Risk not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error('PUT /api/risks/[id]/workflow', error);
    return NextResponse.json({ error: 'Failed to update control mappings' }, { status: 503 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const action = body.action as string;

    if (action === 'assess') {
      const controlId = String(body.controlId ?? '').trim();
      const effectiveness = body.effectiveness as ControlEffectiveness;
      if (!controlId) {
        return NextResponse.json({ error: 'controlId is required' }, { status: 400 });
      }
      if (!EFFECTIVENESS_VALUES.includes(effectiveness)) {
        return NextResponse.json({ error: 'Invalid effectiveness value' }, { status: 400 });
      }

      await validateControlForOrganization(controlId);
      const result = await assessRiskControl(id, controlId, {
        effectiveness,
        notes: body.notes,
        assignee: body.assignee,
      });

      return NextResponse.json({
        ...result,
        autoIssue:
          result.issueCreated &&
          DEVIATION_EFFECTIVENESS.includes(effectiveness),
      });
    }

    if (action === 'retest') {
      const controlId = String(body.controlId ?? '').trim();
      const result = body.result as 'passed' | 'failed';
      if (!controlId) {
        return NextResponse.json({ error: 'controlId is required' }, { status: 400 });
      }
      if (result !== 'passed' && result !== 'failed') {
        return NextResponse.json(
          { error: 'result must be passed or failed' },
          { status: 400 }
        );
      }

      const outcome = await retestRiskControl(id, controlId, {
        result,
        notes: body.notes,
      });
      return NextResponse.json(outcome);
    }

    return NextResponse.json(
      { error: 'action must be assess or retest' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof ControlValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Error) {
      if (
        error.message === 'Risk not found' ||
        error.message === 'Control is not mapped to this risk'
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    console.error('POST /api/risks/[id]/workflow', error);
    return NextResponse.json({ error: 'Workflow action failed' }, { status: 503 });
  }
}
