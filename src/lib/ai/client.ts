import { getAiConfig } from './config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function completeChat(messages: ChatMessage[]): Promise<string> {
  const config = getAiConfig();
  if (!config.configured) {
    throw new Error(
      config.provider === 'ollama'
        ? 'Ollama is not enabled. Set AI_PROVIDER=ollama in .env and run Ollama locally.'
        : 'AI is not configured. Set OPENAI_API_KEY in .env (OpenAI-compatible endpoint supported).'
    );
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim() || (config.provider === 'ollama' ? 'ollama' : '');

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AI request failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('AI returned an empty response');
  }
  return content;
}
