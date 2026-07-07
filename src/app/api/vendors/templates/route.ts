import { NextResponse } from 'next/server';
import { VENDOR_ASSESSMENT_TEMPLATES } from '@/lib/vendor/vendor-assessment-templates';

export async function GET() {
  return NextResponse.json({ templates: VENDOR_ASSESSMENT_TEMPLATES });
}
