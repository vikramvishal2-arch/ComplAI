import { NextResponse } from 'next/server';
import { updateRisk, deleteRisk, getRiskWorkflow, getRiskById } from '@/lib/store';
import { validateControlForOrganization, ControlValidationError } from '@/lib/controls/validate';
import { RiskValidationError, validateRiskReviewerApprover } from '@/lib/risk/validate';
import { notifyRiskStatusTransition } from '@/lib/email/send-risk-email';
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
    const workflow = await getRiskWorkflow(id);
    if (!workflow) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }

    const { risk, mappings } = workflow;
    const control = getControlById(risk.controlId);
    const framework = control ? getFrameworkById(control.frameworkId) : null;

    return NextResponse.json({
      risk,
      control: control ?? null,
      framework: framework
        ? { id: framework.id, name: framework.name, shortName: framework.shortName }
        : null,
      mappings,
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

    const controlIds: string[] | undefined = Array.isArray(body.controlIds)
      ? body.controlIds
      : undefined;

    if (body.controlId) {
      await validateControlForOrganization(body.controlId);
    }
    if (controlIds) {
      for (const controlId of controlIds) {
        await validateControlForOrganization(controlId);
      }
    }

    const previous = await getRiskById(id);
    if (!previous) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }
    const previousStatus = previous.status;

    const nextReviewer =
      body.reviewer !== undefined ? body.reviewer : previous.reviewer;
    const nextApprover =
      body.approver !== undefined ? body.approver : previous.approver;
    validateRiskReviewerApprover(nextReviewer, nextApprover);

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
      reviewer: body.reviewer,
      approver: body.approver,
      dueDate: body.dueDate,
      mitigationPlan: body.mitigationPlan,
      controlId: body.controlId,
      controlIds,
    });
    if (!risk) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }

    if (previousStatus && body.status !== undefined && body.status !== previousStatus) {
      void notifyRiskStatusTransition({ previousStatus, risk }).catch((err) => {
        console.warn(
          '[risk-email] notifyRiskStatusTransition failed:',
          err instanceof Error ? err.message : err
        );
      });
    }

    const workflow = await getRiskWorkflow(id);
    return NextResponse.json({ risk, mappings: workflow?.mappings ?? [] });
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
