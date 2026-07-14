import { NextResponse } from 'next/server';
import { checkVendorBreachIntelligence } from '@/lib/db/vendor-intelligence';
import { formatVendorDbError } from '@/lib/db/prisma-errors';
import { requireDemoAdmin } from '@/lib/server/require-demo-admin';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    const result = await checkVendorBreachIntelligence(id);
    if (!result) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const { breachIntel } = result;
    const ok = breachIntel.status === 'clear' || breachIntel.status === 'breaches_found';

    return NextResponse.json({
      ok,
      message: breachIntel.message,
      breachIntel,
      vendor: result.vendor,
    });
  } catch (error) {
    const message = formatVendorDbError(error);
    if (message) return NextResponse.json({ error: message }, { status: 503 });
    console.error('POST /api/vendors/[id]/breach-check', error);
    return NextResponse.json({ error: 'Failed to run live breach check' }, { status: 503 });
  }
}
