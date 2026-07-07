import { Client } from '@elastic/elasticsearch';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

/** ES 8.x server rejects the v9 client's default media-type headers */
const ES8_COMPAT_HEADERS = {
  accept: 'application/vnd.elasticsearch+json; compatible-with=8',
  'content-type': 'application/vnd.elasticsearch+json; compatible-with=8',
} as const;

let _client: Client | null = null;

export function getElasticClient(): Client {
  if (!_client) {
    _client = new Client({
      node: ELASTICSEARCH_URL,
      headers: { ...ES8_COMPAT_HEADERS },
    });
  }
  return _client;
}

export async function isElasticAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${ELASTICSEARCH_URL}/_cluster/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { status?: string };
    return data.status === 'green' || data.status === 'yellow';
  } catch {
    return false;
  }
}

export const KIBANA_URL = process.env.KIBANA_URL || 'http://localhost:5601';

export async function isKibanaAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${KIBANA_URL}/api/status`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { status?: { overall?: { level?: string } } };
    const level = data.status?.overall?.level;
    return level === 'available' || level === 'degraded';
  } catch {
    return false;
  }
}
