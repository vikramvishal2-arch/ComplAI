import { getIllConfig } from '@/lib/ill/config';

export function validateGatewayApiKey(request: Request): { ok: true; clientId: string } | { ok: false; error: string } {
  const { apiKey } = getIllConfig();
  const headerKey = request.headers.get('x-api-key')?.trim();
  const authHeader = request.headers.get('authorization')?.trim();

  let provided = headerKey;
  if (!provided && authHeader?.toLowerCase().startsWith('bearer ')) {
    provided = authHeader.slice(7).trim();
  }

  if (!provided || !apiKey || provided !== apiKey) {
    return { ok: false, error: 'Invalid or missing API gateway credentials' };
  }

  const clientId = request.headers.get('x-client-id')?.trim() ?? 'nsp-edge';
  return { ok: true, clientId };
}

export function validateThreatCheckInput(searchParams: URLSearchParams): {
  ok: true;
  ip?: string;
  url?: string;
  domain?: string;
} | { ok: false; error: string } {
  const ip = searchParams.get('ip')?.trim() || undefined;
  const url = searchParams.get('url')?.trim() || undefined;
  const domain = searchParams.get('domain')?.trim() || undefined;

  if (!ip && !url && !domain) {
    return { ok: false, error: 'At least one of ip, url, or domain is required' };
  }

  return { ok: true, ip, url, domain };
}
