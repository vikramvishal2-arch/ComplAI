import { KIBANA_URL } from './client';

const DASHBOARD_ID = 'grc-leadership-dashboard';

export async function isKibanaDashboardReady(): Promise<boolean> {
  try {
    const res = await fetch(`${KIBANA_URL}/api/saved_objects/dashboard/${DASHBOARD_ID}`, {
      headers: { 'kbn-xsrf': 'true' },
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function getKibanaDashboardEmbedUrl(): string {
  return `${KIBANA_URL}/app/dashboards#/view/${DASHBOARD_ID}?embed=true&hide-filter-bar=true&_g=(time:(from:now-1y,to:now))`;
}

export function getKibanaDashboardDirectUrl(): string {
  return `${KIBANA_URL}/app/dashboards#/view/${DASHBOARD_ID}`;
}
