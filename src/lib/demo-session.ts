export type DemoPortalRole = 'admin' | 'customer';

export type DemoSession = {
  role: DemoPortalRole;
  email: string;
  displayName: string;
  exp: number;
};

const SESSION_TTL_SECONDS = 60 * 60 * 12;

function bytesToBase64Url(bytes: Uint8Array): string {
  // Node.js
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64url');
  }

  // Edge / browser
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  // eslint-disable-next-line no-undef
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function stringToBase64Url(value: string): string {
  // Node.js
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'utf8').toString('base64url');
  }

  const bytes = new TextEncoder().encode(value);
  return bytesToBase64Url(bytes);
}

function base64UrlToString(base64url: string): string {
  // Node.js
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64url, 'base64url').toString('utf8');
  }

  // Edge / browser
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  // eslint-disable-next-line no-undef
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function sessionSecret(): string {
  return (
    process.env.DEMO_SESSION_SECRET?.trim() ||
    process.env.DEMO_ACCESS_PASSWORD?.trim() ||
    process.env.POSTGRES_PASSWORD?.trim() ||
    'complai-demo-dev-secret'
  );
}

async function hmacSha256Base64Url(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return bytesToBase64Url(new Uint8Array(sig));
}

export function createDemoSession(input: {
  role: DemoPortalRole;
  email: string;
  displayName: string;
}): Promise<string> {
  const session: DemoSession = {
    role: input.role,
    email: input.email,
    displayName: input.displayName,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payload = stringToBase64Url(JSON.stringify(session));
  return hmacSha256Base64Url(payload, sessionSecret()).then((signature) => `${payload}.${signature}`);
}

export async function parseDemoSession(token: string | undefined): Promise<DemoSession | null> {
  if (!token?.includes('.')) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = await hmacSha256Base64Url(payload, sessionSecret());
  if (signature !== expected) return null;

  try {
    const session = JSON.parse(base64UrlToString(payload)) as DemoSession;
    if (!session?.role || !session.email || !session.exp) return null;
    if (session.exp < Math.floor(Date.now() / 1000)) return null;
    if (session.role !== 'admin' && session.role !== 'customer') return null;
    return session;
  } catch {
    return null;
  }
}

export function demoSessionMaxAgeSeconds() {
  return SESSION_TTL_SECONDS;
}

