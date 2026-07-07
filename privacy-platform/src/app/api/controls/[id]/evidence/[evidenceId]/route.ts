import { NextResponse } from 'next/server';
import { getControlById } from '@/lib/data/controls';
import { getControlEvidenceById, deleteControlEvidence } from '@/lib/store';
import { readEvidenceFile } from '@/lib/evidence/storage';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string; evidenceId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id, evidenceId } = await context.params;
    const control = getControlById(id);
    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }

    const record = await getControlEvidenceById(evidenceId);
    if (!record || record.controlId !== id) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    const buffer = await readEvidenceFile(record.storagePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': record.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(record.originalName)}"`,
        'Content-Length': String(record.sizeBytes),
      },
    });
  } catch (error) {
    console.error('GET /api/controls/[id]/evidence/[evidenceId]', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { evidenceId } = await context.params;
    const deleted = await deleteControlEvidence(evidenceId);
    if (!deleted) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/controls/[id]/evidence/[evidenceId]', error);
    return NextResponse.json({ error: 'Failed to delete evidence' }, { status: 503 });
  }
}
