import 'server-only';
import { KIBANA_URL } from './client';
import { GRC_INDICES } from './index-templates';

const DEFAULT_SEARCH_SOURCE = JSON.stringify({
  query: { query: '', language: 'kuery' },
  filter: [],
});

async function createDataView(
  id: string,
  title: string,
  indexPattern: string,
  timeField?: string
): Promise<boolean> {
  try {
    const res = await fetch(`${KIBANA_URL}/api/data_views/data_view`, {
      method: 'POST',
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data_view: {
          id,
          title: indexPattern,
          name: title,
          timeFieldName: timeField,
        },
        override: true,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface VisualizationDef {
  id: string;
  title: string;
  visState: Record<string, unknown>;
  dataViewId: string;
  kueryFilter?: string;
}

async function createVisualization(viz: VisualizationDef): Promise<boolean> {
  const visState = {
    title: viz.title,
    type: viz.visState.type,
    params: getVisParams(viz.visState.type as string),
    aggs: (viz.visState.aggs as Array<Record<string, unknown>>).map((agg) => ({
      enabled: true,
      ...agg,
      params: agg.params ?? {},
    })),
  };

  const payload = {
    attributes: {
      title: viz.title,
      version: 1,
      visState: JSON.stringify(visState),
      uiStateJSON: '{}',
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON: JSON.stringify({
          index: viz.dataViewId,
          query: { query: viz.kueryFilter ?? '', language: 'kuery' },
          filter: [],
        }),
      },
    },
  };

  try {
    const createRes = await fetch(
      `${KIBANA_URL}/api/saved_objects/visualization/${viz.id}?overwrite=true`,
      {
        method: 'POST',
        headers: { 'kbn-xsrf': 'true', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    if (createRes.ok) return true;

    const updateRes = await fetch(`${KIBANA_URL}/api/saved_objects/visualization/${viz.id}`, {
      method: 'PUT',
      headers: { 'kbn-xsrf': 'true', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return updateRes.ok;
  } catch {
    return false;
  }
}

function getVisParams(type: string): Record<string, unknown> {
  switch (type) {
    case 'pie':
      return {
        addTooltip: true,
        addLegend: true,
        legendPosition: 'right',
        isDonut: true,
        labels: { show: false, values: true, last_level: true, truncate: 100 },
      };
    case 'horizontal_bar':
      return {
        addTooltip: true,
        addLegend: true,
        categoryAxes: [
          {
            id: 'CategoryAxis-1',
            type: 'category',
            position: 'left',
            show: true,
            labels: { show: true, truncate: 100 },
          },
        ],
        valueAxes: [
          {
            id: 'ValueAxis-1',
            type: 'value',
            position: 'bottom',
            show: true,
            labels: { show: true, truncate: 100 },
          },
        ],
        seriesParams: [{ show: true, type: 'histogram', mode: 'normal', data: { id: '1', label: 'Count' } }],
        grid: { categoryLines: false },
        legendPosition: 'right',
      };
    case 'metric':
      return { addTooltip: true, addLegend: false };
    default:
      return { addTooltip: true, addLegend: true };
  }
}

async function createDashboard(
  id: string,
  title: string,
  panelRefs: Array<{ vizId: string; x: number; y: number; w: number; h: number }>
): Promise<boolean> {
  const panels = panelRefs.map((p, i) => ({
    version: '8.15.0',
    type: 'visualization',
    gridData: { x: p.x, y: p.y, w: p.w, h: p.h, i: `panel-${i}` },
    panelIndex: `panel-${i}`,
    embeddableConfig: {
      savedObjectId: p.vizId,
      enhancements: {},
    },
    panelRefName: `panel_${i}`,
  }));

  const references = panelRefs.map((p, i) => ({
    name: `panel_${i}`,
    type: 'visualization',
    id: p.vizId,
  }));

  try {
    const payload = {
      attributes: {
        title,
        version: 1,
        panelsJSON: JSON.stringify(panels),
        optionsJSON: JSON.stringify({ useMargins: true, syncColors: true, hidePanelTitles: false }),
        timeRestore: false,
        description: 'Auto-generated GRC leadership dashboard',
        kibanaSavedObjectMeta: {
          searchSourceJSON: DEFAULT_SEARCH_SOURCE,
        },
      },
      references,
    };

    const createRes = await fetch(
      `${KIBANA_URL}/api/saved_objects/dashboard/${id}?overwrite=true`,
      {
        method: 'POST',
        headers: { 'kbn-xsrf': 'true', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    if (createRes.ok) return true;

    const updateRes = await fetch(`${KIBANA_URL}/api/saved_objects/dashboard/${id}`, {
      method: 'PUT',
      headers: { 'kbn-xsrf': 'true', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return updateRes.ok;
  } catch {
    return false;
  }
}

export async function setupKibanaDashboards(): Promise<{
  success: boolean;
  dataViews: number;
  visualizations: number;
  dashboards: number;
  error?: string;
}> {
  const result = { success: false, dataViews: 0, visualizations: 0, dashboards: 0 } as {
    success: boolean;
    dataViews: number;
    visualizations: number;
    dashboards: number;
    error?: string;
  };

  try {
    // 1. Create data views
    const dataViews = [
      { id: 'grc-controls', title: 'GRC Controls', pattern: GRC_INDICES.controls, time: 'updatedAt' },
      { id: 'grc-risks', title: 'GRC Risks', pattern: GRC_INDICES.risks, time: 'updatedAt' },
      { id: 'grc-vendors', title: 'GRC Vendors', pattern: GRC_INDICES.vendors, time: 'updatedAt' },
      { id: 'grc-audits', title: 'GRC Audit Findings', pattern: GRC_INDICES.audits, time: 'createdAt' },
      { id: 'grc-cycles', title: 'GRC Program Cycles', pattern: GRC_INDICES.cycles, time: 'dueDate' },
      { id: 'grc-policies', title: 'GRC Policies', pattern: GRC_INDICES.policies, time: 'updatedAt' },
      { id: 'grc-assurance', title: 'GRC Assurance Findings', pattern: GRC_INDICES.assurance, time: 'detectedAt' },
      { id: 'grc-risk-assessment', title: 'GRC Risk Assessment', pattern: GRC_INDICES.riskAssessment, time: 'updatedAt' },
    ];
    for (const dv of dataViews) {
      if (await createDataView(dv.id, dv.title, dv.pattern, dv.time)) result.dataViews++;
    }

    // 2. Create visualizations
    const visualizations: VisualizationDef[] = [
      {
        id: 'grc-rag-pie',
        title: 'Compliance RAG Distribution',
        dataViewId: 'grc-controls',
        visState: {
          type: 'pie',
          title: 'Compliance RAG Distribution',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'ragStatus', size: 5 } },
          ],
        },
      },
      {
        id: 'grc-controls-by-framework',
        title: 'Controls by Framework',
        dataViewId: 'grc-controls',
        visState: {
          type: 'horizontal_bar',
          title: 'Controls by Framework',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'frameworkName', size: 30 } },
          ],
        },
      },
      {
        id: 'grc-risk-heatmap',
        title: 'Risk Severity Distribution',
        dataViewId: 'grc-risks',
        visState: {
          type: 'pie',
          title: 'Risk Severity Distribution',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'presentRisk', size: 10 } },
          ],
        },
      },
      {
        id: 'grc-risk-by-category',
        title: 'Risks by Category',
        dataViewId: 'grc-risks',
        visState: {
          type: 'horizontal_bar',
          title: 'Risks by Category',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'category', size: 20 } },
          ],
        },
      },
      {
        id: 'grc-vendor-ratings',
        title: 'Vendor Security Ratings',
        dataViewId: 'grc-vendors',
        visState: {
          type: 'horizontal_bar',
          title: 'Vendor Security Ratings',
          aggs: [
            { id: '1', type: 'avg', schema: 'metric', params: { field: 'securityRating' } },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'name', size: 20 } },
          ],
        },
      },
      {
        id: 'grc-vendor-tiers',
        title: 'Vendors by Tier',
        dataViewId: 'grc-vendors',
        visState: {
          type: 'pie',
          title: 'Vendors by Tier',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'tier', size: 5 } },
          ],
        },
      },
      {
        id: 'grc-audit-findings-severity',
        title: 'Audit Findings by Severity',
        dataViewId: 'grc-audits',
        visState: {
          type: 'pie',
          title: 'Audit Findings by Severity',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'severity', size: 5 } },
          ],
        },
      },
      {
        id: 'grc-audit-findings-status',
        title: 'Audit Findings by Status',
        dataViewId: 'grc-audits',
        visState: {
          type: 'horizontal_bar',
          title: 'Audit Findings by Status',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'status', size: 10 } },
          ],
        },
      },
      {
        id: 'grc-cycles-status',
        title: 'Program Cycles Status',
        dataViewId: 'grc-cycles',
        visState: {
          type: 'pie',
          title: 'Program Cycles Status',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'status', size: 5 } },
          ],
        },
      },
      {
        id: 'grc-policies-status',
        title: 'Policies by Status',
        dataViewId: 'grc-policies',
        visState: {
          type: 'pie',
          title: 'Policies by Status',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'status', size: 10 } },
          ],
        },
      },
      {
        id: 'grc-assurance-severity',
        title: 'Assurance Findings by Severity',
        dataViewId: 'grc-assurance',
        visState: {
          type: 'pie',
          title: 'Assurance Findings by Severity',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'severity', size: 5 } },
          ],
        },
      },
      {
        id: 'grc-assurance-vm-severity',
        title: 'Infrastructure VM — Severity',
        dataViewId: 'grc-assurance',
        kueryFilter: 'source: infrastructure',
        visState: {
          type: 'pie',
          title: 'Infrastructure VM — Severity',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'severity', size: 5 } },
          ],
        },
      },
      {
        id: 'grc-assurance-dast-severity',
        title: 'Application DAST — Severity',
        dataViewId: 'grc-assurance',
        kueryFilter: 'source: dast',
        visState: {
          type: 'pie',
          title: 'Application DAST — Severity',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'severity', size: 5 } },
          ],
        },
      },
      {
        id: 'grc-assurance-status',
        title: 'Assurance Remediation Status',
        dataViewId: 'grc-assurance',
        visState: {
          type: 'horizontal_bar',
          title: 'Assurance Remediation Status',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'status', size: 8 } },
          ],
        },
      },
      {
        id: 'grc-ra-severity-by-domain',
        title: 'Risk Items by Domain & Severity',
        dataViewId: 'grc-risk-assessment',
        kueryFilter: 'docType: risk_item',
        visState: {
          type: 'horizontal_bar',
          title: 'Risk Items by Domain & Severity',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'domainName', size: 20 } },
            { id: '3', type: 'terms', schema: 'group', params: { field: 'severity', size: 5 } },
          ],
        },
      },
      {
        id: 'grc-ra-critical-by-domain',
        title: 'Critical Risks by Domain',
        dataViewId: 'grc-risk-assessment',
        kueryFilter: 'docType: domain_summary',
        visState: {
          type: 'horizontal_bar',
          title: 'Critical Risks by Domain',
          aggs: [
            { id: '1', type: 'sum', schema: 'metric', params: { field: 'criticalCount' } },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'domainName', size: 20 } },
          ],
        },
      },
      {
        id: 'grc-ra-severity-pie',
        title: 'Risk Assessment Severity Mix',
        dataViewId: 'grc-risk-assessment',
        kueryFilter: 'docType: risk_item',
        visState: {
          type: 'pie',
          title: 'Risk Assessment Severity Mix',
          aggs: [
            { id: '1', type: 'count', schema: 'metric' },
            { id: '2', type: 'terms', schema: 'segment', params: { field: 'severity', size: 5 } },
          ],
        },
      },
    ];

    for (const viz of visualizations) {
      if (await createVisualization(viz)) result.visualizations++;
    }

    // 3. Create dashboards
    const mainDashboard = await createDashboard(
      'grc-leadership-dashboard',
      'GRC Leadership Dashboard',
      [
        { vizId: 'grc-rag-pie', x: 0, y: 0, w: 16, h: 12 },
        { vizId: 'grc-controls-by-framework', x: 16, y: 0, w: 32, h: 12 },
        { vizId: 'grc-risk-heatmap', x: 0, y: 12, w: 16, h: 12 },
        { vizId: 'grc-risk-by-category', x: 16, y: 12, w: 32, h: 12 },
        { vizId: 'grc-vendor-ratings', x: 0, y: 24, w: 24, h: 12 },
        { vizId: 'grc-vendor-tiers', x: 24, y: 24, w: 24, h: 12 },
        { vizId: 'grc-audit-findings-severity', x: 0, y: 36, w: 16, h: 12 },
        { vizId: 'grc-audit-findings-status', x: 16, y: 36, w: 16, h: 12 },
        { vizId: 'grc-cycles-status', x: 32, y: 36, w: 16, h: 12 },
        { vizId: 'grc-policies-status', x: 0, y: 48, w: 24, h: 12 },
        { vizId: 'grc-assurance-severity', x: 0, y: 60, w: 12, h: 12 },
        { vizId: 'grc-assurance-vm-severity', x: 12, y: 60, w: 12, h: 12 },
        { vizId: 'grc-assurance-dast-severity', x: 24, y: 60, w: 12, h: 12 },
        { vizId: 'grc-assurance-status', x: 36, y: 60, w: 12, h: 12 },
      ]
    );
    if (mainDashboard) result.dashboards++;

    const riskDashboard = await createDashboard(
      'grc-risk-assessment-dashboard',
      'GRC Risk Assessment Dashboard',
      [
        { vizId: 'grc-ra-severity-pie', x: 0, y: 0, w: 16, h: 12 },
        { vizId: 'grc-ra-critical-by-domain', x: 16, y: 0, w: 32, h: 12 },
        { vizId: 'grc-ra-severity-by-domain', x: 0, y: 12, w: 48, h: 16 },
      ]
    );
    if (riskDashboard) result.dashboards++;

    result.success = result.dataViews > 0;
    return result;
  } catch (err) {
    result.error = err instanceof Error ? err.message : 'Kibana setup failed';
    return result;
  }
}
