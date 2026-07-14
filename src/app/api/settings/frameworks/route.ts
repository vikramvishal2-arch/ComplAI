import { NextResponse } from 'next/server';
import { FRAMEWORKS } from '@/lib/data/frameworks';
import { getStaticFrameworkById } from '@/lib/frameworks/merge-framework-catalog';
import {
  createFrameworkCatalogEntry,
  isValidFrameworkCategory,
  listFrameworkCatalogEntries,
  normalizeFrameworkId,
} from '@/lib/db/framework-catalog-repository';
import { requireDemoAdmin } from '@/lib/server/require-demo-admin';
import type { FrameworkCategory } from '@/lib/types';

function parseBody(body: unknown) {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;
  const frameworkId = normalizeFrameworkId(String(data.frameworkId ?? data.id ?? ''));
  const name = String(data.name ?? '').trim();
  const shortName = String(data.shortName ?? '').trim();
  const description = String(data.description ?? '').trim();
  const category = String(data.category ?? 'security');
  const region = String(data.region ?? 'Global').trim();
  const version = String(data.version ?? '').trim();
  const popular = Boolean(data.popular);
  const published = data.published !== false;
  const tags = Array.isArray(data.tags) ? data.tags.map(String).filter(Boolean) : [];

  if (!frameworkId || !name || !shortName || !description) return null;
  if (!isValidFrameworkCategory(category)) return null;

  return {
    frameworkId,
    source: 'custom' as const,
    name,
    shortName,
    description,
    category: category as FrameworkCategory,
    region,
    version,
    popular,
    published,
    tags,
  };
}

export async function GET() {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  try {
    const [catalog, staticFrameworks] = await Promise.all([
      listFrameworkCatalogEntries(),
      Promise.resolve(FRAMEWORKS),
    ]);

    return NextResponse.json({ catalog, staticFrameworks });
  } catch (error) {
    console.error('GET /api/settings/frameworks', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const parsed = parseBody(body);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid framework payload' }, { status: 400 });
    }

    if (getStaticFrameworkById(parsed.frameworkId)) {
      return NextResponse.json(
        { error: 'Framework ID already used by a built-in framework' },
        { status: 409 }
      );
    }

    const entry = await createFrameworkCatalogEntry(parsed);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('POST /api/settings/frameworks', error);
    const message = error instanceof Error ? error.message : 'Database unavailable';
    if (message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Framework ID already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
