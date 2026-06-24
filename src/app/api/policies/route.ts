import { NextResponse } from 'next/server';
import {
  getPolicies,
  createPolicyFromTemplate,
  createBlankPolicy,
} from '@/lib/db/policy-repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') ?? undefined;
    const policies = await getPolicies(categoryId ?? undefined);
    return NextResponse.json({ policies });
  } catch (error) {
    console.error('GET /api/policies', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action as string;

    if (action === 'from_template') {
      const templateId = body.templateId as string;
      if (!templateId) {
        return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
      }
      const policy = await createPolicyFromTemplate(templateId, body.owner as string | undefined);
      if (!policy) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json({ policy }, { status: 201 });
    }

    if (action === 'blank') {
      const { title, categoryId, content, owner } = body;
      if (!title?.trim() || !categoryId) {
        return NextResponse.json({ error: 'title and categoryId are required' }, { status: 400 });
      }
      const policy = await createBlankPolicy({
        title,
        categoryId,
        content: content ?? '',
        owner: owner ?? '',
        source: 'blank',
      });
      return NextResponse.json({ policy }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/policies', error);
    return NextResponse.json({ error: 'Create failed' }, { status: 503 });
  }
}
