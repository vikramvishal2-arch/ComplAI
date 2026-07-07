import { NextResponse } from 'next/server';
import {
  getPredefinedVendorAssessmentQuestions,
  getVendorAssessmentControlSummary,
  PREDEFINED_VENDOR_ASSESSMENT_CONTROLS,
} from '@/lib/data/vendor-assessment-controls';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tier = searchParams.get('tier') ?? 'medium';
  const dataAccess = searchParams.get('dataAccess') ?? 'none';
  const all = searchParams.get('all') === '1';

  const items = all
    ? PREDEFINED_VENDOR_ASSESSMENT_CONTROLS.map(
        ({ id, category, checklistLabel, question, weight, controlIds, controlRefs, evidenceGuidance, minTier, dataAccess: da }) => ({
          id,
          category,
          checklistLabel,
          question,
          weight,
          controlIds,
          controlRefs,
          evidenceGuidance,
          minTier,
          dataAccess: da,
        })
      )
    : getPredefinedVendorAssessmentQuestions({ tier, dataAccess });

  return NextResponse.json({
    items,
    summary: getVendorAssessmentControlSummary(),
    tier,
    dataAccess,
  });
}
