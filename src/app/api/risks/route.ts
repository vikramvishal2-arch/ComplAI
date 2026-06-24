import { NextResponse } from 'next/server';
import {
  getRiskRegister,
  createRisk,
  getRisks,
  createControlIssue,
} from '@/lib/store';
import { validateControlForOrganization, ControlValidationError } from '@/lib/controls/validate';
import { RiskValidationError } from '@/lib/risk/validate';
import { Prisma } from '@prisma/client';
import type {
  RiskImpact,
  RiskLikelihood,
  RiskStatus,
  RiskTreatment,
  ControlIssueSeverity,
} from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');

    if (view === 'register') {
      const entries = await getRiskRegister();
      return NextResponse.json({ entries });
    }

    const risks = await getRisks();
    return NextResponse.json({ risks });
  } catch (error) {
    console.error('GET /api/risks', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!body.controlId?.trim()) {
      return NextResponse.json(
        { error: 'A linked framework control is required' },
        { status: 400 }
      );
    }

    await validateControlForOrganization(body.controlId);

    if (body.entryType === 'issue') {
      const issue = await createControlIssue(body.controlId, {
        title: body.title,
        description: body.description,
        severity: body.severity as ControlIssueSeverity | undefined,
        raisedBy: body.raisedBy ?? body.owner,
        assignee: body.assignee,
        dueDate: body.dueDate,
      });
      return NextResponse.json({ issue, entryType: 'issue' }, { status: 201 });
    }

    const risk = await createRisk({
      controlId: body.controlId,
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

    return NextResponse.json({ risk }, { status: 201 });
  } catch (error) {
    if (error instanceof ControlValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof RiskValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        {
          error:
            'Risk could not be saved. Restart the dev server after schema changes (`npm run db:push`).',
        },
        { status: 503 }
      );
    }
    console.error('POST /api/risks', error);
    return NextResponse.json({ error: 'Failed to create risk' }, { status: 503 });
  }
}
