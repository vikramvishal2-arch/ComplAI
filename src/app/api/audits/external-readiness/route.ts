import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auditWorkflowErrorMessage, ensureAuditWorkflowSeed } from '@/lib/db/audit-repository';
import { getDefaultOrganization } from '@/lib/db/repository';

export async function GET() {
  try {
    const org = await getDefaultOrganization();
    await ensureAuditWorkflowSeed(org.id);
    const [items, requests, engagements] = await Promise.all([
      prisma.externalReadinessItem.findMany({
        where: { organizationId: org.id },
        orderBy: [{ updatedAt: 'desc' }],
      }),
      prisma.auditEvidenceRequest.findMany({
        where: { organizationId: org.id },
        orderBy: [{ updatedAt: 'desc' }],
      }),
      prisma.auditEngagement.findMany({
        where: { organizationId: org.id, type: 'external' },
        orderBy: [{ updatedAt: 'desc' }],
      }),
    ]);

    return NextResponse.json({ items, requests, engagements });
  } catch (error) {
    console.error('GET /api/audits/external-readiness', error);
    return NextResponse.json(
      { error: auditWorkflowErrorMessage(error) || 'Failed to load external readiness' },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const org = await getDefaultOrganization();
    const body = (await request.json()) as
      | { type: 'item'; task: string; category?: string; framework?: string; owner?: string; dueDate?: string | null }
      | { type: 'request'; request: string; engagement?: string; controlRef?: string; assignee?: string; dueDate?: string | null }
      | { type: 'engagement'; name: string; framework?: string; auditor?: string; startDate?: string | null; endDate?: string | null };

    if (body.type === 'item') {
      const task = String(body.task ?? '').trim();
      if (!task) return NextResponse.json({ error: 'task is required' }, { status: 400 });
      const item = await prisma.externalReadinessItem.create({
        data: {
          organizationId: org.id,
          category: String(body.category ?? ''),
          task,
          framework: String(body.framework ?? ''),
          owner: String(body.owner ?? ''),
          status: 'not_started',
          dueDate: body.dueDate ? new Date(`${body.dueDate}T00:00:00.000Z`) : null,
        },
      });
      return NextResponse.json({ item }, { status: 201 });
    }

    if (body.type === 'request') {
      const req = String(body.request ?? '').trim();
      if (!req) return NextResponse.json({ error: 'request is required' }, { status: 400 });
      const created = await prisma.auditEvidenceRequest.create({
        data: {
          organizationId: org.id,
          engagement: String(body.engagement ?? ''),
          request: req,
          controlRef: String(body.controlRef ?? ''),
          assignee: String(body.assignee ?? ''),
          status: 'pending',
          dueDate: body.dueDate ? new Date(`${body.dueDate}T00:00:00.000Z`) : null,
        },
      });
      return NextResponse.json({ request: created }, { status: 201 });
    }

    if (body.type === 'engagement') {
      const name = String(body.name ?? '').trim();
      if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
      const engagement = await prisma.auditEngagement.create({
        data: {
          organizationId: org.id,
          name,
          framework: String(body.framework ?? ''),
          auditor: String(body.auditor ?? ''),
          type: 'external',
          status: 'planning',
          startDate: body.startDate ? new Date(`${body.startDate}T00:00:00.000Z`) : null,
          endDate: body.endDate ? new Date(`${body.endDate}T00:00:00.000Z`) : null,
          readiness: 0,
        },
      });
      return NextResponse.json({ engagement }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/audits/external-readiness', error);
    return NextResponse.json(
      { error: auditWorkflowErrorMessage(error) || 'Failed to create external readiness record' },
      { status: 503 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const org = await getDefaultOrganization();
    const body = (await request.json()) as
      | { type: 'item'; id: string; status?: string; owner?: string; dueDate?: string | null; notes?: string }
      | { type: 'request'; id: string; status?: string; assignee?: string; dueDate?: string | null; notes?: string }
      | { type: 'engagement'; id: string; status?: string; readiness?: number };

    if (body.type === 'item') {
      const existing = await prisma.externalReadinessItem.findFirst({
        where: { id: body.id, organizationId: org.id },
      });
      if (!existing) {
        return NextResponse.json({ error: 'Readiness item not found' }, { status: 404 });
      }

      const updated = await prisma.externalReadinessItem.update({
        where: { id: body.id },
        data: {
          ...(body.status !== undefined ? { status: String(body.status) } : {}),
          ...(body.owner !== undefined ? { owner: String(body.owner) } : {}),
          ...(body.notes !== undefined ? { notes: String(body.notes) } : {}),
          ...(body.dueDate !== undefined
            ? { dueDate: body.dueDate ? new Date(`${body.dueDate}T00:00:00.000Z`) : null }
            : {}),
        },
      });
      return NextResponse.json({ item: updated });
    }

    if (body.type === 'request') {
      const existing = await prisma.auditEvidenceRequest.findFirst({
        where: { id: body.id, organizationId: org.id },
      });
      if (!existing) {
        return NextResponse.json({ error: 'Evidence request not found' }, { status: 404 });
      }

      const updated = await prisma.auditEvidenceRequest.update({
        where: { id: body.id },
        data: {
          ...(body.status !== undefined ? { status: String(body.status) } : {}),
          ...(body.assignee !== undefined ? { assignee: String(body.assignee) } : {}),
          ...(body.notes !== undefined ? { notes: String(body.notes) } : {}),
          ...(body.dueDate !== undefined
            ? { dueDate: body.dueDate ? new Date(`${body.dueDate}T00:00:00.000Z`) : null }
            : {}),
        },
      });
      return NextResponse.json({ request: updated });
    }

    if (body.type === 'engagement') {
      const existing = await prisma.auditEngagement.findFirst({
        where: { id: body.id, organizationId: org.id },
      });
      if (!existing) {
        return NextResponse.json({ error: 'Engagement not found' }, { status: 404 });
      }

      const updated = await prisma.auditEngagement.update({
        where: { id: body.id },
        data: {
          ...(body.status !== undefined ? { status: String(body.status) } : {}),
          ...(body.readiness !== undefined ? { readiness: Number(body.readiness) } : {}),
        },
      });
      return NextResponse.json({ engagement: updated });
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('PATCH /api/audits/external-readiness', error);
    return NextResponse.json(
      { error: auditWorkflowErrorMessage(error) || 'Failed to update external readiness' },
      { status: 503 }
    );
  }
}
