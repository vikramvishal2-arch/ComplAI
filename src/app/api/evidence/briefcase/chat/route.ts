import { NextResponse } from 'next/server';
import { getEvidenceBriefcaseIndex } from '@/lib/evidence/briefcase-cache';
import { searchEvidenceBriefcase } from '@/lib/evidence/briefcase-search';
import type { EvidenceBriefcaseModule } from '@/lib/evidence/briefcase-types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      module?: EvidenceBriefcaseModule | 'all';
      limit?: number;
    };

    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const index = await getEvidenceBriefcaseIndex({ fresh: true });
    let pool = index.items;
    if (body.module && body.module !== 'all') {
      pool = pool.filter((item) => item.module === body.module);
    }

    const result = searchEvidenceBriefcase(pool, message, body.limit ?? 25);
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/evidence/briefcase/chat', error);
    return NextResponse.json({ error: 'Evidence search failed' }, { status: 503 });
  }
}
