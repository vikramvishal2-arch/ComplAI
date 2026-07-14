import { NextResponse } from 'next/server';
import { seedPublicVendorPortfolio } from '@/lib/vendor/seed-public-profiles';
import { listPublicVendorProfiles } from '@/lib/vendor/public-vendor-profiles';
import { formatVendorDbError } from '@/lib/db/prisma-errors';
import { requireDemoAdmin, requireDemoSession } from '@/lib/server/require-demo-admin';

export async function GET() {
  const auth = await requireDemoSession();
  if ('error' in auth) return auth.error;

  const profiles = listPublicVendorProfiles().map((p) => ({
    domain: p.domain,
    name: p.name,
    industry: p.industry,
    securityRating100: p.securityRating100,
    ratingGrade: p.ratingGrade,
    sources: p.sources.map((s) => ({ name: s.name, url: s.url, verifiedAt: s.verifiedAt })),
  }));
  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json().catch(() => ({}));
    const replaceExisting = Boolean(body.replaceExisting);
    const result = await seedPublicVendorPortfolio({ replaceExisting });
    return NextResponse.json({
      ok: true,
      message:
        result.errors.length > 0
          ? `Loaded ${result.created.length} vendor(s); ${result.errors.length} failed.`
          : result.created.length > 0
            ? `Loaded ${result.created.length} public intelligence vendor profile(s).`
            : result.skipped.length > 0
              ? 'Demo profiles already in portfolio.'
              : 'No demo vendors were loaded.',
      ...result,
    });
  } catch (error) {
    const message = formatVendorDbError(error);
    if (message) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    console.error('POST /api/vendors/demo-portfolio', error);
    const detail = error instanceof Error ? error.message : 'Failed to load demo portfolio';
    return NextResponse.json(
      { error: `Failed to load demo portfolio. Run npm run db:push if columns are missing. (${detail})` },
      { status: 503 }
    );
  }
}
