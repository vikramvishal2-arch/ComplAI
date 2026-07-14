import { NextResponse } from 'next/server';
import { ASSURANCE_SOURCES, type AssuranceSource } from '@/lib/assurance/types';
import { listAssuranceVulnerabilities } from '@/lib/assurance/vulnerabilities';
import { requireDemoAdmin, requireDemoSession } from '@/lib/server/require-demo-admin';

function parseSource(raw: string | null): AssuranceSource | 'all' {
  if (!raw || raw === 'all') return 'all';
  if ((ASSURANCE_SOURCES as string[]).includes(raw)) {
    return raw as AssuranceSource;
  }
  return 'all';
}

function parseStatus(raw: string | null): 'open' | 'all' {
  return raw === 'all' ? 'all' : 'open';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bypassCache = searchParams.get('refresh') === '1';

  // Cache refresh hits Jira/external sources — admin only.
  const auth = bypassCache ? await requireDemoAdmin() : await requireDemoSession();
  if ('error' in auth) return auth.error;

  try {
    const source = parseSource(searchParams.get('source'));
    const status = parseStatus(searchParams.get('status'));

    const payload = await listAssuranceVulnerabilities({ source, status, bypassCache });
    return NextResponse.json(payload);
  } catch (error) {
    console.error('GET /api/assurance/vulnerabilities', error);
    return NextResponse.json({ error: 'Failed to load vulnerabilities' }, { status: 503 });
  }
}
