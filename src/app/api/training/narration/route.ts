import { NextResponse } from 'next/server';

const MAX_CHARS = 2_500;
const audioCache = new Map<string, Buffer>();

function isNeuralTtsConfigured(): boolean {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return false;
  const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1').replace(
    /\/$/,
    ''
  );
  return baseUrl.includes('api.openai.com') || process.env.TRAINING_TTS_FORCE === 'true';
}

export async function GET() {
  return NextResponse.json({ available: isNeuralTtsConfigured() });
}

export async function POST(request: Request) {
  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return NextResponse.json({ error: 'Text too long' }, { status: 400 });
  }

  const cacheKey = `${process.env.TRAINING_TTS_VOICE ?? 'nova'}:${text}`;
  let buffer = audioCache.get(cacheKey);

  if (!buffer) {
    buffer = (await synthesizeWithOpenAi(text)) ?? undefined;
    if (buffer) audioCache.set(cacheKey, buffer);
  }

  if (!buffer) {
    return NextResponse.json(
      { error: 'Neural voice unavailable', fallback: 'browser' },
      { status: 503 }
    );
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'private, max-age=604800',
    },
  });
}

async function synthesizeWithOpenAi(text: string): Promise<Buffer | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1').replace(
    /\/$/,
    ''
  );

  if (
    !baseUrl.includes('api.openai.com') &&
    process.env.TRAINING_TTS_FORCE !== 'true'
  ) {
    return null;
  }

  const voice = process.env.TRAINING_TTS_VOICE?.trim() || 'nova';
  const model = process.env.TRAINING_TTS_MODEL?.trim() || 'tts-1';

  try {
    const response = await fetch(`${baseUrl}/audio/speech`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        response_format: 'mp3',
        speed: 0.96,
      }),
    });

    if (!response.ok) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    return bytes.length > 256 ? bytes : null;
  } catch {
    return null;
  }
}
