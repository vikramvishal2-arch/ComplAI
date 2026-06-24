import { NextResponse } from 'next/server';
import { POLICY_CATEGORIES, POLICY_TEMPLATES, getTemplateCounts } from '@/lib/data/policy-templates';

export async function GET() {
  const counts = getTemplateCounts();
  return NextResponse.json({
    categories: POLICY_CATEGORIES,
    counts,
    templates: POLICY_TEMPLATES.map(
      ({ id, categoryId, title, isoReference, description, documentType, controlIds, frameworkTags }) => ({
        id,
        categoryId,
        title,
        isoReference,
        description,
        documentType,
        controlIds,
        frameworkTags,
      })
    ),
  });
}
