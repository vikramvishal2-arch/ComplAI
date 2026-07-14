import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auditWorkflowErrorMessage, ensureAuditWorkflowSeed } from '@/lib/db/audit-repository';
import { getDefaultOrganization } from '@/lib/db/repository';

export async function GET(request: Request) {
  try {
    const org = await getDefaultOrganization();
    await ensureAuditWorkflowSeed(org.id);
    const url = new URL(request.url);
    const source = url.searchParams.get('source'); // internal|external|all

    const findings = await prisma.auditFinding.findMany({
      where: {
        organizationId: org.id,
        ...(source && source !== 'all' ? { source } : {}),
      },
      orderBy: [{ updatedAt: 'desc' }],
    });
    return NextResponse.json({ findings });
  } catch (error) {
    console.error('GET /api/audits/findings', error);
    return NextResponse.json(
      { error: auditWorkflowErrorMessage(error) || 'Failed to load findings' },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const org = await getDefaultOrganization();
    const body = (await request.json()) as {
      source?: string;
      engagement?: string;
      severity?: string;
      title?: string;
      controlRef?: string;
      owner?: string;
      status?: string;
      dueDate?: string | null;
      notes?: string;
    };

    const title = String(body.title ?? '').trim();
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const finding = await prisma.auditFinding.create({
      data: {
        organizationId: org.id,
        source: String(body.source ?? 'internal'),
        engagement: String(body.engagement ?? ''),
        severity: String(body.severity ?? 'medium'),
        title,
        controlRef: String(body.controlRef ?? ''),
        owner: String(body.owner ?? ''),
        status: String(body.status ?? 'open'),
        dueDate: body.dueDate ? new Date(`${body.dueDate}T00:00:00.000Z`) : null,
        notes: String(body.notes ?? ''),
      },
    });

    return NextResponse.json({ finding }, { status: 201 });
  } catch (error) {
    console.error('POST /api/audits/findings', error);
    return NextResponse.json(
      { error: auditWorkflowErrorMessage(error) || 'Failed to create finding' },
      { status: 503 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const org = await getDefaultOrganization();
    const body = (await request.json()) as {
      id?: string;
      status?: string;
      owner?: string;
      dueDate?: string | null;
      notes?: string;
      severity?: string;
      engagement?: string;
      controlRef?: string;
    };

    const id = String(body.id ?? '').trim();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const existing = await prisma.auditFinding.findFirst({
      where: { id, organizationId: org.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Finding not found' }, { status: 404 });
    }

    const updated = await prisma.auditFinding.update({
      where: { id },
      data: {
        ...(body.status !== undefined ? { status: String(body.status) } : {}),
        ...(body.owner !== undefined ? { owner: String(body.owner) } : {}),
        ...(body.severity !== undefined ? { severity: String(body.severity) } : {}),
        ...(body.engagement !== undefined ? { engagement: String(body.engagement) } : {}),
        ...(body.controlRef !== undefined ? { controlRef: String(body.controlRef) } : {}),
        ...(body.notes !== undefined ? { notes: String(body.notes) } : {}),
        ...(body.dueDate !== undefined
          ? { dueDate: body.dueDate ? new Date(`${body.dueDate}T00:00:00.000Z`) : null }
          : {}),
      },
    });

    return NextResponse.json({ finding: updated });
  } catch (error) {
    console.error('PATCH /api/audits/findings', error);
    return NextResponse.json(
      { error: auditWorkflowErrorMessage(error) || 'Failed to update finding' },
      { status: 503 }
    );
  }
}
