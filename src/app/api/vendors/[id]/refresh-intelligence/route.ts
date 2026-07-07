import { NextResponse } from 'next/server';
import { refreshVendorInternetIntelligence } from '@/lib/db/vendor-intelligence';
import { formatVendorDbError } from '@/lib/db/prisma-errors';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await refreshVendorInternetIntelligence(id);
    if (!result) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      message:
        result.certificationsFound > 0
          ? `Synced ${result.certificationsFound} certification(s) from public sources and updated security rating.`
          : 'No public certifications found for this domain — rating updated from attack-surface signals only.',
      ...result,
    });
  } catch (error) {
    const message = formatVendorDbError(error);
    if (message) return NextResponse.json({ error: message }, { status: 503 });
    console.error('POST /api/vendors/[id]/refresh-intelligence', error);
    return NextResponse.json({ error: 'Failed to refresh vendor intelligence' }, { status: 503 });
  }
}
