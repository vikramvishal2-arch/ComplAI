import { NextResponse } from 'next/server';
import { updateRisk, deleteRisk, getRiskById } from '@/lib/store';
import { validateControlForOrganization, ControlValidationError } from '@/lib/controls/validate';
import { RiskValidationError } from '@/lib/risk/validate';
import { getControlById } from '@/lib/data/controls';
import { getFrameworkById } from '@/lib/data/frameworks';
import type {
  RiskImpact,
  RiskLikelihood,
  RiskStatus,
  RiskTreatment,
} from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const risk = await getRiskById(id);
    if (!risk) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }

    const control = getControlById(risk.controlId);
    const framework = control ? getFrameworkById(control.frameworkId) : null;

    return NextResponse.json({
      risk,
      control: control ?? null,
      framework: framework
        ? { id: framework.id, name: framework.name, shortName: framework.shortName }
        : null,
    });
  } catch (error) {
    console.error('GET /api/risks/[id]', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (body.controlId) {
      await validateControlForOrganization(body.controlId);
    }

    const risk = await updateRisk(id, {
      title: body.title,
      description: body.description,
      category: body.category,
      likelihood: body.likelihood as RiskLikelihood | undefined,
      impact: body.impact as RiskImpact | undefined,
      residualLikelihood: body.residualLikelihood as RiskLikelihood | null | undefined,
      residualImpact: body.residualImpact as RiskImpact | null | undefined,
      treatment: body.treatment as RiskTreatment | undefined,
      status: body.status as RiskStatus | undefined,
      owner: body.owner,
      dueDate: body.dueDate,
      mitigationPlan: body.mitigationPlan,
    });
    if (!risk) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }

    return NextResponse.json({ risk });
  } catch (error) {
    if (error instanceof ControlValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof RiskValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('PATCH /api/risks/[id]', error);
    return NextResponse.json({ error: 'Failed to update risk' }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteRisk(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/risks/[id]', error);
    return NextResponse.json({ error: 'Failed to delete risk' }, { status: 503 });
  }
}
