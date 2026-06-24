import { NextResponse } from 'next/server';
import { getPolicyTemplate } from '@/lib/data/policy-templates';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const template = getPolicyTemplate(id);
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }
  return NextResponse.json({ template });
}
