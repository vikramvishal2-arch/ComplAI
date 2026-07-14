import { NextResponse } from 'next/server';
import { getVaToolById, VA_TOOL_DEFINITIONS } from '@/lib/data/va-tool-integrations';
import { parseSafeHttpsUrl } from '@/lib/security/url-guards';
import { requireDemoAdmin } from '@/lib/server/require-demo-admin';

type ConnectionRecord = {
  toolId: string;
  connectedAt: string;
  lastSyncAt: string | null;
  lastSyncCount: number | null;
  apiBaseUrl: string;
};

const connections = new Map<string, ConnectionRecord>();

function validateCredentials(
  toolId: string,
  credentials: Record<string, string>
): { ok: true } | { ok: false; error: string } {
  const tool = getVaToolById(toolId);
  if (!tool) return { ok: false, error: 'Unknown VA tool' };

  for (const field of tool.fields) {
    if (field.required && !credentials[field.id]?.trim()) {
      return { ok: false, error: `${field.label} is required` };
    }
  }

  const baseUrl = credentials.apiBaseUrl?.trim();
  if (baseUrl) {
    const parsed = parseSafeHttpsUrl(baseUrl);
    if (!parsed.ok) {
      return { ok: false, error: `API base URL: ${parsed.error}` };
    }
  }

  return { ok: true };
}

function mockSyncCount(toolId: string): number {
  const counts: Record<string, number> = {
    nessus: 42,
    'qualys-vmdr': 38,
    'hcl-appscan': 15,
    nmap: 27,
  };
  return counts[toolId] ?? 12;
}

export async function GET() {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  const tools = VA_TOOL_DEFINITIONS.map((tool) => {
    const conn = connections.get(tool.id);
    return {
      ...tool,
      connected: Boolean(conn),
      connectedAt: conn?.connectedAt ?? null,
      lastSyncAt: conn?.lastSyncAt ?? null,
      lastSyncCount: conn?.lastSyncCount ?? null,
      apiBaseUrl: conn?.apiBaseUrl ?? tool.defaultApiBaseUrl,
    };
  });

  return NextResponse.json({ tools });
}

export async function POST(request: Request) {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const action = body.action as string;
    const toolId = body.toolId as string;
    const credentials = (body.credentials ?? {}) as Record<string, string>;

    const tool = getVaToolById(toolId);
    if (!tool) {
      return NextResponse.json({ error: 'Unknown VA tool' }, { status: 404 });
    }

    if (action === 'test') {
      const validation = validateCredentials(toolId, credentials);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      return NextResponse.json({
        ok: true,
        message: `Successfully authenticated with ${tool.name} API`,
        latencyMs: 80 + (crypto.getRandomValues(new Uint8Array(1))[0] % 120),
      });
    }

    if (action === 'connect') {
      const validation = validateCredentials(toolId, credentials);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const now = new Date().toISOString();
      connections.set(toolId, {
        toolId,
        connectedAt: now,
        lastSyncAt: null,
        lastSyncCount: null,
        apiBaseUrl: credentials.apiBaseUrl?.trim() || tool.defaultApiBaseUrl,
      });

      return NextResponse.json({
        ok: true,
        message: `${tool.name} connected — findings will sync on schedule or manual pull`,
        connectedAt: now,
      });
    }

    if (action === 'sync') {
      const conn = connections.get(toolId);
      if (!conn) {
        return NextResponse.json({ error: 'Connect the tool before syncing' }, { status: 400 });
      }

      const count = mockSyncCount(toolId);
      const now = new Date().toISOString();
      connections.set(toolId, { ...conn, lastSyncAt: now, lastSyncCount: count });

      return NextResponse.json({
        ok: true,
        message: `Imported ${count} findings from ${tool.name}`,
        importedCount: count,
        lastSyncAt: now,
      });
    }

    if (action === 'disconnect') {
      connections.delete(toolId);
      return NextResponse.json({ ok: true, message: `${tool.name} disconnected` });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/assurance/integrations', error);
    return NextResponse.json({ error: 'Integration request failed' }, { status: 503 });
  }
}
