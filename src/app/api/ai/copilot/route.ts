import { NextResponse } from 'next/server';
import { completeChat } from '@/lib/ai/client';
import { buildControlContext, buildOrgContext } from '@/lib/ai/context';
import { COPILOT_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { getAiConfig } from '@/lib/ai/config';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      controlId?: string;
      history?: { role: 'user' | 'assistant'; content: string }[];
    };

    if (!body.message?.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const ai = getAiConfig();
    if (!ai.configured) {
      return NextResponse.json(
        {
          error: 'AI Copilot requires OPENAI_API_KEY in .env. Rule-based Gap Analysis and Questionnaire Auto-Fill work without AI.',
          needsConfig: true,
        },
        { status: 503 }
      );
    }

    const context = body.controlId
      ? await buildControlContext(body.controlId)
      : await buildOrgContext();

    const messages = [
      { role: 'system' as const, content: COPILOT_SYSTEM_PROMPT },
      {
        role: 'system' as const,
        content: `Current organization context:\n${context}`,
      },
      ...(body.history ?? []).slice(-6),
      { role: 'user' as const, content: body.message.trim() },
    ];

    const reply = await completeChat(messages);
    return NextResponse.json({ reply, contextUsed: Boolean(body.controlId) });
  } catch (error) {
    console.error('POST /api/ai/copilot', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI request failed' },
      { status: 500 }
    );
  }
}
