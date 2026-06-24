import { NextResponse } from 'next/server';
import { getAiConfig, getIntelligenceCapabilities } from '@/lib/ai/config';

export async function GET() {
  const ai = getAiConfig();
  const capabilities = getIntelligenceCapabilities();

  return NextResponse.json({
    ai,
    capabilities,
  });
}
