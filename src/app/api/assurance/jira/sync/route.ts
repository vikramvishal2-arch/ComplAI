import { NextResponse } from 'next/server';
import { getJiraConfig } from '@/lib/jira/config';
import { clearAssuranceVulnCache, listAssuranceVulnerabilities } from '@/lib/assurance/vulnerabilities';
import { requireDemoAdmin } from '@/lib/server/require-demo-admin';

/**
 * Optional refresh endpoint - clears short in-memory cache and re-fetches.
 * When Jira is not configured, returns demo data (mode: "demo").
 */
export async function POST() {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  try {
    const config = getJiraConfig();
    clearAssuranceVulnCache();
    const payload = await listAssuranceVulnerabilities({
      source: 'all',
      status: 'open',
      bypassCache: true,
    });

    return NextResponse.json({
      ok: true,
      jiraConfigured: config.configured,
      ...payload,
    });
  } catch (error) {
    console.error('POST /api/assurance/jira/sync', error);
    return NextResponse.json({ error: 'Jira sync failed' }, { status: 503 });
  }
}

export async function GET() {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  const config = getJiraConfig();
  return NextResponse.json({
    configured: config.configured,
    baseUrl: config.configured ? config.baseUrl : null,
    projectKey: config.projectKey,
    hasPerSourceJql: Boolean(
      config.jqlBySource.sast ||
        config.jqlBySource.dast ||
        config.jqlBySource.infra ||
        config.jqlBySource.cloud
    ),
    classification:
      'Issues are classified by labels (sast, dast, infra, infrastructure, cloud, vm, cspm), optional per-source JQL (JIRA_JQL_SAST, etc.), or summary prefixes like [SAST].',
  });
}
