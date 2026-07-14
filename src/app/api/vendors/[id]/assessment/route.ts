import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import {
  getVendorById,
  createVendorAssessment,
  getVendorAssessment,
  finalizeVendorAssessment,
  updateVendorAssessment,
} from '@/lib/db/vendor-repository';
import {
  generateVendorQuestions,
  scoreVendorAssessment,
  parseVendorQuestions,
  parseVendorResponses,
} from '@/lib/vendor/assessment';
import { getVendorAssessmentTemplate } from '@/lib/vendor/vendor-assessment-templates';
import {
  aggregateAssessmentScore,
  computeDomainScores,
  generateFindingsFromResponses,
  generateRemediationItems,
} from '@/lib/vendor/vendor-rating';
import {
  sendVendorAssessmentCompletedNotice,
  sendVendorQuestionnaireInvite,
} from '@/lib/email/send-tprm-email';

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
      const templateId = (body.templateId as string) ?? 'tprm-standard';
      const template = getVendorAssessmentTemplate(templateId);

      const assessment = await createVendorAssessment(vendorId, template.id, template.name);
      if (!assessment) {
        return NextResponse.json({ error: 'Could not create assessment' }, { status: 500 });
      }

      const questions = await generateVendorQuestions({
        name: vendor.name,
        description: vendor.description,
        tier: vendor.tier,
        dataAccess: vendor.dataAccess,
        templateId: template.id,
      });

      const updated = await updateVendorAssessment(assessment.id, {
        status: 'in_progress',
        questions: questions as unknown as Prisma.InputJsonValue,
        questionnaireStatus: 'in_progress',
      });

      let email = null;
      const inviteTo =
        (typeof body.inviteEmail === 'string' && body.inviteEmail.trim()) ||
        vendor.contactEmail?.trim() ||
        '';
      if (inviteTo && updated) {
        email = await sendVendorQuestionnaireInvite({
          vendorName: vendor.name,
          vendorEmail: inviteTo,
          assessmentId: updated.id,
          vendorId: vendor.id,
          templateName: template.name,
          dueDate: typeof body.dueDate === 'string' ? body.dueDate : null,
        });
      }

      return NextResponse.json({ assessment: updated, questions, template, email });
    }

    if (action === 'send_invite') {
      const assessmentId = body.assessmentId as string;
      const assessment = await getVendorAssessment(assessmentId);
      if (!assessment || assessment.vendorId !== vendorId) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      const inviteTo =
        (typeof body.inviteEmail === 'string' && body.inviteEmail.trim()) ||
        vendor.contactEmail?.trim() ||
        '';
      if (!inviteTo) {
        return NextResponse.json(
          { error: 'Vendor contact email is required to send the questionnaire invite' },
          { status: 400 }
        );
      }

      const template = getVendorAssessmentTemplate(assessment.templateId || 'tprm-standard');
      const email = await sendVendorQuestionnaireInvite({
        vendorName: vendor.name,
        vendorEmail: inviteTo,
        assessmentId: assessment.id,
        vendorId: vendor.id,
        templateName: template.name,
        dueDate: typeof body.dueDate === 'string' ? body.dueDate : null,
      });

      return NextResponse.json({ ok: email.ok, email });
    }

    if (action === 'save') {
      const assessmentId = body.assessmentId as string;
      const responses = parseVendorResponses(body.responses);
      const assessment = await getVendorAssessment(assessmentId);
      if (!assessment || assessment.vendorId !== vendorId) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }
      const updated = await updateVendorAssessment(assessmentId, {
        responses: responses as unknown as Prisma.InputJsonValue,
        status: 'in_progress',
      });
      return NextResponse.json({ assessment: updated });
    }

    if (action === 'import') {
      const assessmentIdBody = body.assessmentId as string | undefined;
      const templateId = (body.templateId as string) ?? 'tprm-standard';
      const template = getVendorAssessmentTemplate(templateId);
      const importedResponses = parseVendorResponses(body.responses);

      if (importedResponses.length === 0) {
        return NextResponse.json({ error: 'No responses to import' }, { status: 400 });
      }

      let assessment = assessmentIdBody ? await getVendorAssessment(assessmentIdBody) : null;
      if (assessment && assessment.vendorId !== vendorId) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      if (!assessment) {
        const created = await createVendorAssessment(vendorId, template.id, template.name);
        if (!created) {
          return NextResponse.json({ error: 'Could not create assessment' }, { status: 500 });
        }
        const questions = await generateVendorQuestions({
          name: vendor.name,
          description: vendor.description,
          tier: vendor.tier,
          dataAccess: vendor.dataAccess,
          templateId: template.id,
        });
        assessment = await updateVendorAssessment(created.id, {
          status: 'in_progress',
          questions: questions as unknown as Prisma.InputJsonValue,
          questionnaireStatus: 'imported',
        });
        if (!assessment) {
          return NextResponse.json({ error: 'Could not update assessment' }, { status: 500 });
        }
      }

      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      const existingQuestions = parseVendorQuestions(assessment.questions);
      if (existingQuestions.length === 0) {
        const templateIdForQuestions = assessment.templateId || template.id;
        const questions = await generateVendorQuestions({
          name: vendor.name,
          description: vendor.description,
          tier: vendor.tier,
          dataAccess: vendor.dataAccess,
          templateId: templateIdForQuestions,
        });
        assessment = await updateVendorAssessment(assessment.id, {
          questions: questions as unknown as Prisma.InputJsonValue,
        });
        if (!assessment) {
          return NextResponse.json({ error: 'Could not update assessment' }, { status: 500 });
        }
      }

      const existingResponses = parseVendorResponses(assessment.responses);
      const mergedById = new Map(existingResponses.map((r) => [r.questionId, r]));
      for (const response of importedResponses) {
        mergedById.set(response.questionId, response);
      }

      const merged = [...mergedById.values()];
      const updated = await updateVendorAssessment(assessment.id, {
        responses: merged as unknown as Prisma.InputJsonValue,
        status: 'in_progress',
        questionnaireStatus: 'imported',
      });

      return NextResponse.json({
        assessment: updated,
        importedCount: importedResponses.length,
        mergedCount: merged.length,
      });
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

      const domainScores = computeDomainScores(questions, responses);
      const aggregateScore = domainScores.length > 0 ? aggregateAssessmentScore(domainScores) : result.score;
      const findings = generateFindingsFromResponses(questions, responses);
      const remediationItems = generateRemediationItems(findings);

      const updated = await finalizeVendorAssessment(assessmentId, {
        responses,
        aiScore: aggregateScore,
        aiSummary: result.summary,
        gaps: result.gaps,
        domainScores,
        findings,
        remediationItems,
      });

      let email = null;
      const notifyTo =
        (typeof body.notifyEmail === 'string' && body.notifyEmail.trim()) ||
        process.env.TPRM_NOTIFY_EMAIL?.trim() ||
        vendor.contactEmail?.trim() ||
        '';
      if (notifyTo && updated) {
        email = await sendVendorAssessmentCompletedNotice({
          vendorName: vendor.name,
          vendorId: vendor.id,
          assessmentId: updated.id,
          score: aggregateScore,
          notifyEmail: notifyTo,
        });
      }

      return NextResponse.json({
        assessment: updated,
        result: {
          ...result,
          score: aggregateScore,
          domainScores,
          findings,
          remediationItems,
        },
        email,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/vendors/[id]/assessment', error);
    const message = error instanceof Error ? error.message : 'Assessment failed';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
