import 'server-only';

import { isSafePublicLookupHost } from '@/lib/security/url-guards';

export type IntelHttpResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; bodyPreview?: string };

/**
 * ComplAI → HTTPS + API Key → provider → JSON validation helper.
 * Never invents success payloads on failure.
 */
export async function fetchJsonWithApiKey<T>(input: {
  url: string;
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: HeadersInit;
  apiKeyHeader?: { name: string; value: string };
  timeoutMs?: number;
  validate: (data: unknown) => data is T;
}): Promise<IntelHttpResult<T>> {
  const headers = new Headers(input.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (input.apiKeyHeader?.value) {
    headers.set(input.apiKeyHeader.name, input.apiKeyHeader.value);
  }
  const method = input.method ?? 'GET';
  if (method === 'POST' && input.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const res = await fetch(input.url, {
      method,
      headers,
      body: method === 'POST' && input.body !== undefined ? JSON.stringify(input.body) : undefined,
      signal: AbortSignal.timeout(input.timeoutMs ?? 20000),
      cache: 'no-store',
    });

    const text = await res.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        return {
          ok: false,
          status: res.status,
          error: `Invalid JSON from provider (HTTP ${res.status})`,
          bodyPreview: text.slice(0, 200),
        };
      }
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: `Provider returned HTTP ${res.status}`,
        bodyPreview: text.slice(0, 200),
      };
    }

    if (!input.validate(parsed)) {
      return {
        ok: false,
        status: res.status,
        error: 'Provider JSON failed validation',
        bodyPreview: text.slice(0, 200),
      };
    }

    return { ok: true, status: res.status, data: parsed };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : 'Network error contacting provider',
    };
  }
}

/** Normalize and reject private/loopback hosts before intel lookups. */
export function normalizeDomain(domain: string | null | undefined): string {
  const normalized = (domain ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split(':')[0];

  if (!normalized || !isSafePublicLookupHost(normalized)) {
    return '';
  }
  return normalized;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
