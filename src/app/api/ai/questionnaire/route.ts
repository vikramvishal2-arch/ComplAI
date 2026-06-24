import { NextResponse } from 'next/server';
import { completeChat } from '@/lib/ai/client';
import { buildOrgContext } from '@/lib/ai/context';
import { QUESTIONNAIRE_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { getAiConfig } from '@/lib/ai/config';
import {
  generateQuestionnaireAnswers,
} from '@/lib/questionnaire/generator';
import { SAMPLE_QUESTIONNAIRE } from '@/lib/questionnaire/constants';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      questions?: string[];
      useAiEnhancement?: boolean;
    };

    const questions =
      body.questions?.filter((q) => q.trim()).length
        ? body.questions.filter((q) => q.trim())
        : SAMPLE_QUESTIONNAIRE;

    const draft = await generateQuestionnaireAnswers(questions);

    const ai = getAiConfig();
    if (body.useAiEnhancement && ai.configured) {
      const orgContext = await buildOrgContext(60);
      const enhanced = await Promise.all(
        draft.answers.map(async (item) => {
          const reply = await completeChat([
            { role: 'system', content: QUESTIONNAIRE_SYSTEM_PROMPT },
            { role: 'system', content: `Organization context:\n${orgContext}` },
            {
              role: 'user',
              content: `Question: ${item.question}\n\nDraft answer from control library:\n${item.answer}\n\nRefine into a polished, auditor-ready response. If insufficient data, say what is missing.`,
            },
          ]);
          return { ...item, answer: reply, confidence: 'medium' as const };
        })
      );
      return NextResponse.json({ ...draft, answers: enhanced, aiEnhanced: true });
    }

    return NextResponse.json({ ...draft, aiEnhanced: false });
  } catch (error) {
    console.error('POST /api/ai/questionnaire', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Questionnaire generation failed' },
      { status: 500 }
    );
  }
}
