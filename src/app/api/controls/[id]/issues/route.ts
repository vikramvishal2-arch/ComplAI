import { NextResponse } from 'next/server';
import { getControlById } from '@/lib/data/controls';
import {
  getControlIssues,
  createControlIssue,
} from '@/lib/store';
import { validateControlForOrganization, ControlValidationError } from '@/lib/controls/validate';
import type { ControlIssueSeverity } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const control = getControlById(id);
    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }

    const issues = await getControlIssues(id);
    return NextResponse.json({ issues });
  } catch (error) {
    console.error('GET /api/controls/[id]/issues', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const control = getControlById(id);
    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }

    try {
      await validateControlForOrganization(id);
    } catch (err) {
      if (err instanceof ControlValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    const body = await request.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const issue = await createControlIssue(id, {
      title: body.title,
      description: body.description,
      severity: body.severity as ControlIssueSeverity | undefined,
      raisedBy: body.raisedBy,
      assignee: body.assignee,
      dueDate: body.dueDate,
    });

    return NextResponse.json({ issue }, { status: 201 });
  } catch (error) {
    console.error('POST /api/controls/[id]/issues', error);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 503 });
  }
}
