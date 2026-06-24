import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import {
  getVendorById,
  createVendorAssessment,
  getVendorAssessment,
  updateVendorAssessment,
} from '@/lib/db/vendor-repository';
import {
  generateVendorQuestions,
  scoreVendorAssessment,
  parseVendorQuestions,
  parseVendorResponses,
  type VendorResponse,
} from '@/lib/vendor/assessment';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: vendorId } = await params;
    const body = await request.json();
    const action = body.action as string;

    const vendor = await getVendorById(vendorId);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    if (action === 'generate') {
      const assessment = await createVendorAssessment(vendorId);
      if (!assessment) {
        return NextResponse.json({ error: 'Could not create assessment' }, { status: 500 });
      }

      const questions = await generateVendorQuestions({
        name: vendor.name,
        description: vendor.description,
        tier: vendor.tier,
        dataAccess: vendor.dataAccess,
      });

      const updated = await updateVendorAssessment(assessment.id, {
        status: 'in_progress',
        questions: questions as unknown as Prisma.InputJsonValue,
      });

      return NextResponse.json({ assessment: updated, questions });
    }

    if (action === 'score') {
      const assessmentId = body.assessmentId as string;
      const responses = parseVendorResponses(body.responses);

      const assessment = await getVendorAssessment(assessmentId);
      if (!assessment || assessment.vendorId !== vendorId) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      const questions = parseVendorQuestions(assessment.questions);
      const result = await scoreVendorAssessment({
        vendor: {
          name: vendor.name,
          tier: vendor.tier,
          dataAccess: vendor.dataAccess,
          inherentRiskScore: vendor.inherentRiskScore,
        },
        questions,
        responses,
      });

      const updated = await updateVendorAssessment(assessmentId, {
        status: 'completed',
        responses: responses as unknown as Prisma.InputJsonValue,
        aiScore: result.score,
        aiSummary: result.summary,
        gaps: result.gaps as unknown as Prisma.InputJsonValue,
      });

      return NextResponse.json({ assessment: updated, result });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/vendors/[id]/assessment', error);
    const message = error instanceof Error ? error.message : 'Assessment failed';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
