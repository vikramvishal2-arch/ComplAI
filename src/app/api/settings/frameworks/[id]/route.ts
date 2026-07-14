import { NextResponse } from 'next/server';
import {
  deleteFrameworkCatalogEntry,
  getFrameworkCatalogEntryByFrameworkId,
  isValidFrameworkCategory,
  normalizeFrameworkId,
  upsertFrameworkCatalogEntry,
  updateFrameworkCatalogEntry,
} from '@/lib/db/framework-catalog-repository';
import { getMergedFrameworkById, getStaticFrameworkById } from '@/lib/frameworks/merge-framework-catalog';
import { requireDemoAdmin } from '@/lib/server/require-demo-admin';
import type { FrameworkCategory } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

function parsePatchBody(body: unknown) {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  if (data.name !== undefined) patch.name = String(data.name).trim();
  if (data.shortName !== undefined) patch.shortName = String(data.shortName).trim();
  if (data.description !== undefined) patch.description = String(data.description).trim();
  if (data.category !== undefined) {
    const category = String(data.category);
    if (!isValidFrameworkCategory(category)) return null;
    patch.category = category;
  }
  if (data.region !== undefined) patch.region = String(data.region).trim();
  if (data.version !== undefined) patch.version = String(data.version).trim();
  if (data.popular !== undefined) patch.popular = Boolean(data.popular);
  if (data.published !== undefined) patch.published = Boolean(data.published);
  if (data.tags !== undefined) {
    patch.tags = Array.isArray(data.tags) ? data.tags.map(String).filter(Boolean) : [];
  }

  return patch;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id } = await context.params;
    const frameworkId = normalizeFrameworkId(id);
    const [merged, catalog] = await Promise.all([
      getMergedFrameworkById(frameworkId),
      getFrameworkCatalogEntryByFrameworkId(frameworkId),
    ]);

    if (!merged && !catalog) {
      return NextResponse.json({ error: 'Framework not found' }, { status: 404 });
    }

    return NextResponse.json({
      framework: merged ?? null,
      catalog,
      isBuiltIn: Boolean(getStaticFrameworkById(frameworkId)),
    });
  } catch (error) {
    console.error('GET /api/settings/frameworks/[id]', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id } = await context.params;
    const frameworkId = normalizeFrameworkId(id);
    const body = await request.json();
    const patch = parsePatchBody(body);
    if (!patch) {
      return NextResponse.json({ error: 'Invalid framework payload' }, { status: 400 });
    }

    const builtIn = getStaticFrameworkById(frameworkId);
    const existing = await getFrameworkCatalogEntryByFrameworkId(frameworkId);

    if (builtIn) {
      const entry = await upsertFrameworkCatalogEntry({
        frameworkId,
        source: 'builtin_override',
        name: String(patch.name ?? builtIn.name),
        shortName: String(patch.shortName ?? builtIn.shortName),
        description: String(patch.description ?? builtIn.description),
        category: (patch.category as FrameworkCategory | undefined) ?? builtIn.category,
        region: String(patch.region ?? builtIn.region),
        version: String(patch.version ?? builtIn.version),
        popular: (patch.popular as boolean | undefined) ?? builtIn.popular,
        published: (patch.published as boolean | undefined) ?? existing?.published ?? true,
        tags: (patch.tags as string[] | undefined) ?? builtIn.tags,
      });
      return NextResponse.json({ entry });
    }

    if (!existing) {
      return NextResponse.json({ error: 'Custom framework not found' }, { status: 404 });
    }

    const entry = await updateFrameworkCatalogEntry(frameworkId, patch);
    return NextResponse.json({ entry });
  } catch (error) {
    console.error('PATCH /api/settings/frameworks/[id]', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id } = await context.params;
    const frameworkId = normalizeFrameworkId(id);
    const existing = await getFrameworkCatalogEntryByFrameworkId(frameworkId);
    if (!existing) {
      return NextResponse.json({ error: 'Framework catalog entry not found' }, { status: 404 });
    }

    if (existing.source === 'custom') {
      await deleteFrameworkCatalogEntry(frameworkId);
      return NextResponse.json({ success: true, removed: true });
    }

    await updateFrameworkCatalogEntry(frameworkId, { published: false });
    return NextResponse.json({ success: true, hidden: true });
  } catch (error) {
    console.error('DELETE /api/settings/frameworks/[id]', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
