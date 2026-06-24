import { NextResponse } from 'next/server';
import { getControlById } from '@/lib/data/controls';
import {
  getControlEvidence,
  createControlEvidence,
} from '@/lib/store';
import type { EvidenceContext } from '@/lib/types';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

const VALID_CONTEXTS: EvidenceContext[] = ['compliance', 'remediation', 'issues'];

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const control = getControlById(id);
    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const contextFilter = searchParams.get('context') as EvidenceContext | null;
    if (contextFilter && !VALID_CONTEXTS.includes(contextFilter)) {
      return NextResponse.json({ error: 'Invalid context' }, { status: 400 });
    }

    const evidence = await getControlEvidence(id, contextFilter ?? undefined);
    return NextResponse.json({ evidence });
  } catch (error) {
    console.error('GET /api/controls/[id]/evidence', error);
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

    const formData = await request.formData();
    const file = formData.get('file');
    const evidenceContext = formData.get('context') as EvidenceContext | null;
    const description = String(formData.get('description') ?? '');
    const issueId = formData.get('issueId') ? String(formData.get('issueId')) : null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }
    if (!evidenceContext || !VALID_CONTEXTS.includes(evidenceContext)) {
      return NextResponse.json({ error: 'Valid context is required' }, { status: 400 });
    }

    const evidence = await createControlEvidence(id, {
      context: evidenceContext,
      file,
      description,
      issueId,
    });

    return NextResponse.json({ evidence }, { status: 201 });
  } catch (error) {
    console.error('POST /api/controls/[id]/evidence', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
