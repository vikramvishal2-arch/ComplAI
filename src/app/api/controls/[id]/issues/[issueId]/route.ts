import { NextResponse } from 'next/server';
import {
  updateControlIssue,
  deleteControlIssue,
} from '@/lib/store';
import type { ControlIssueSeverity, ControlIssueStatus } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string; issueId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { issueId } = await context.params;
    const body = await request.json();

    const issue = await updateControlIssue(issueId, {
      title: body.title,
      description: body.description,
      severity: body.severity as ControlIssueSeverity | undefined,
      status: body.status as ControlIssueStatus | undefined,
      raisedBy: body.raisedBy,
      assignee: body.assignee,
      dueDate: body.dueDate,
      resolutionNotes: body.resolutionNotes,
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ issue });
  } catch (error) {
    console.error('PATCH /api/controls/[id]/issues/[issueId]', error);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { issueId } = await context.params;
    const deleted = await deleteControlIssue(issueId);
    if (!deleted) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/controls/[id]/issues/[issueId]', error);
    return NextResponse.json({ error: 'Failed to delete issue' }, { status: 503 });
  }
}
