import { NextResponse } from 'next/server';
import { isElasticAvailable, isKibanaAvailable } from '@/lib/elastic/client';
import {
  getKibanaDashboardEmbedUrl,
  getRiskAssessmentDashboardEmbedUrl,
  isKibanaDashboardReady,
  isRiskAssessmentDashboardReady,
} from '@/lib/elastic/kibana-urls';
import { syncAllGrcData } from '@/lib/elastic/sync-grc-data';
import { setupKibanaDashboards } from '@/lib/elastic/kibana-setup';
import {
  requireCronOrDemoAdmin,
  requireDemoSession,
} from '@/lib/server/require-demo-admin';

/**
 * POST /api/elastic/sync
 *
 * Syncs GRC data into Elasticsearch and configures Kibana dashboards.
 * Authorize with `Authorization: Bearer <CRON_SECRET>` / `X-Cron-Secret`,
 * or a demo admin session (manual trigger from the UI).
 */
export async function POST(request: Request) {
  const gate = await requireCronOrDemoAdmin(request);
  if ('error' in gate) return gate.error;

  const available = await isElasticAvailable();
  if (!available) {
    return NextResponse.json(
      { error: 'Elasticsearch is not reachable. Start it with: docker compose up -d elasticsearch kibana' },
      { status: 503 }
    );
  }

  const syncResult = await syncAllGrcData();
  if (!syncResult.success) {
    return NextResponse.json({ error: syncResult.error, sync: syncResult }, { status: 500 });
  }

  const kibanaResult = await setupKibanaDashboards();

  return NextResponse.json({
    sync: syncResult,
    kibana: kibanaResult,
    message: 'GRC data synced to Elasticsearch and Kibana dashboards configured.',
  });
}

/** Status probe for Elastic/Kibana connectivity and dashboard URLs. */
export async function GET() {
  const auth = await requireDemoSession();
  if ('error' in auth) return auth.error;

  const [esUp, kibanaUp] = await Promise.all([isElasticAvailable(), isKibanaAvailable()]);
  const dashboardReady = esUp && kibanaUp ? await isKibanaDashboardReady() : false;
  const riskAssessmentDashboardReady =
    esUp && kibanaUp ? await isRiskAssessmentDashboardReady() : false;

  const publicKibana =
    process.env.KIBANA_PUBLIC_URL?.trim() || process.env.KIBANA_URL || 'http://localhost:5601';

  return NextResponse.json({
    elasticsearch: esUp ? 'connected' : 'unavailable',
    kibana: kibanaUp ? 'connected' : 'unavailable',
    dashboardReady,
    kibanaUrl: publicKibana,
    dashboardUrl: dashboardReady ? getKibanaDashboardEmbedUrl() : null,
    dashboardDirectUrl: kibanaUp
      ? `${publicKibana.replace(/\/$/, '')}/app/dashboards#/view/grc-leadership-dashboard`
      : null,
    riskAssessmentDashboardReady,
    riskAssessmentDashboardUrl: riskAssessmentDashboardReady
      ? getRiskAssessmentDashboardEmbedUrl()
      : null,
    riskAssessmentDashboardDirectUrl: kibanaUp
      ? `${publicKibana.replace(/\/$/, '')}/app/dashboards#/view/grc-risk-assessment-dashboard`
      : null,
  });
}
