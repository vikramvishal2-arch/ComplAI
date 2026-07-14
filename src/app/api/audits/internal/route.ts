import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auditWorkflowErrorMessage, ensureAuditWorkflowSeed } from '@/lib/db/audit-repository';
import { getDefaultOrganization } from '@/lib/db/repository';

export async function GET() {
  try {
    const org = await getDefaultOrganization();
    await ensureAuditWorkflowSeed(org.id);
    const programs = await prisma.auditProgram.findMany({
      where: { organizationId: org.id },
      orderBy: [{ updatedAt: 'desc' }],
    });
    return NextResponse.json({ programs });
  } catch (error) {
    console.error('GET /api/audits/internal', error);
    return NextResponse.json(
      { error: auditWorkflowErrorMessage(error) || 'Failed to load internal audit programs' },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const org = await getDefaultOrganization();
    const body = (await request.json()) as {
      name?: string;
      scope?: string;
      lead?: string;
      startDate?: string | null;
      endDate?: string | null;
    };

    const name = String(body.name ?? '').trim();
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const program = await prisma.auditProgram.create({
      data: {
        organizationId: org.id,
        name,
        scope: String(body.scope ?? ''),
        lead: String(body.lead ?? ''),
        status: 'scheduled',
        startDate: body.startDate ? new Date(`${body.startDate}T00:00:00.000Z`) : null,
        endDate: body.endDate ? new Date(`${body.endDate}T00:00:00.000Z`) : null,
        coverage: 0,
      },
    });

    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    console.error('POST /api/audits/internal', error);
    return NextResponse.json(
      { error: auditWorkflowErrorMessage(error) || 'Failed to create internal audit program' },
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
      coverage?: number;
    };

    const id = String(body.id ?? '').trim();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const existing = await prisma.auditProgram.findFirst({
      where: { id, organizationId: org.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Internal audit program not found' }, { status: 404 });
    }

    const updated = await prisma.auditProgram.update({
      where: { id },
      data: {
        ...(body.status ? { status: String(body.status) } : {}),
        ...(body.coverage !== undefined ? { coverage: Number(body.coverage) } : {}),
      },
    });

    return NextResponse.json({ program: updated });
  } catch (error) {
    console.error('PATCH /api/audits/internal', error);
    return NextResponse.json(
      { error: auditWorkflowErrorMessage(error) || 'Failed to update internal audit program' },
      { status: 503 }
    );
  }
}

