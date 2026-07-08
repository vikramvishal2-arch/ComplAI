import { NextResponse } from 'next/server';
import { isElasticAvailable, isKibanaAvailable } from '@/lib/elastic/client';
import {
  getKibanaDashboardDirectUrl,
  getKibanaDashboardEmbedUrl,
  isKibanaDashboardReady,
} from '@/lib/elastic/kibana-urls';
import { syncAllGrcData } from '@/lib/elastic/sync-grc-data';
import { setupKibanaDashboards } from '@/lib/elastic/kibana-setup';

export async function POST() {
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

export async function GET() {
  const [esUp, kibanaUp] = await Promise.all([isElasticAvailable(), isKibanaAvailable()]);
  const dashboardReady = esUp && kibanaUp ? await isKibanaDashboardReady() : false;

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
  });
}
