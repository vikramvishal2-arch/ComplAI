import { NextResponse } from 'next/server';
import { getEvidenceBriefcaseIndex, invalidateEvidenceBriefcaseCache } from '@/lib/evidence/briefcase-cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fresh = searchParams.get('fresh') === '1';
    if (fresh) invalidateEvidenceBriefcaseCache();

    const index = await getEvidenceBriefcaseIndex({ fresh });
    const uploads = index.items
      .filter(
        (item) =>
          item.id.startsWith('control-file-') ||
          item.tags.some((tag) => tag.toLowerCase() === 'upload')
      )
      .sort((a, b) => {
        const aTime = a.recordedAt ? Date.parse(a.recordedAt) : 0;
        const bTime = b.recordedAt ? Date.parse(b.recordedAt) : 0;
        return bTime - aTime;
      });

    const recent = [...index.items]
      .sort((a, b) => {
        const aTime = a.recordedAt ? Date.parse(a.recordedAt) : 0;
        const bTime = b.recordedAt ? Date.parse(b.recordedAt) : 0;
        return bTime - aTime;
      })
      .slice(0, 50);

    return NextResponse.json({
      generatedAt: index.generatedAt,
      total: index.total,
      byModule: index.byModule,
      uploadCount: uploads.length,
      uploads: uploads.slice(0, 50),
      items: recent,
      truncated: index.items.length > 50,
    });
  } catch (error) {
    console.error('GET /api/evidence/briefcase', error);
    return NextResponse.json({ error: 'Failed to load evidence briefcase' }, { status: 503 });
  }
}
