export type VaToolCategory = 'infrastructure' | 'dast' | 'network';

export type VaApiField = {
  id: string;
  label: string;
  type: 'text' | 'password' | 'url';
  placeholder: string;
  required: boolean;
  helpText?: string;
};

export type VaToolDefinition = {
  id: string;
  name: string;
  category: VaToolCategory;
  description: string;
  docsUrl: string;
  apiDocsLabel: string;
  authType: 'api-key' | 'basic' | 'token';
  fields: VaApiField[];
  syncCapabilities: string[];
  defaultApiBaseUrl: string;
};

export const VA_TOOL_DEFINITIONS: VaToolDefinition[] = [
  {
    id: 'nessus',
    name: 'Tenable Nessus',
    category: 'infrastructure',
    description:
      'Pull vulnerability scan results from Nessus Professional or Nessus Manager via the Tenable.io / Nessus REST API.',
    docsUrl: 'https://developer.tenable.com/reference',
    apiDocsLabel: 'Tenable API reference',
    authType: 'api-key',
    defaultApiBaseUrl: 'https://cloud.tenable.com',
    fields: [
      {
        id: 'apiBaseUrl',
        label: 'API base URL',
        type: 'url',
        placeholder: 'https://cloud.tenable.com',
        required: true,
        helpText: 'Tenable.io cloud URL or your Nessus Manager host',
      },
      {
        id: 'accessKey',
        label: 'Access key',
        type: 'password',
        placeholder: 'Tenable access key',
        required: true,
      },
      {
        id: 'secretKey',
        label: 'Secret key',
        type: 'password',
        placeholder: 'Tenable secret key',
        required: true,
      },
    ],
    syncCapabilities: ['Export scans', 'Import CVE findings', 'Asset inventory', 'Severity mapping'],
  },
  {
    id: 'qualys-vmdr',
    name: 'Qualys VMDR',
    category: 'infrastructure',
    description:
      'Connect to Qualys VMDR API to import host detections, TruRisk scores, and remediation status.',
    docsUrl: 'https://www.qualys.com/docs/qualys-api-vmpc-user-guide.pdf',
    apiDocsLabel: 'Qualys API user guide',
    authType: 'basic',
    defaultApiBaseUrl: 'https://qualysapi.qualys.com',
    fields: [
      {
        id: 'apiBaseUrl',
        label: 'API platform URL',
        type: 'url',
        placeholder: 'https://qualysapi.qualys.com',
        required: true,
        helpText: 'Use qualysapi.qg2.apps.qualys.com for EU, etc.',
      },
      {
        id: 'username',
        label: 'API username',
        type: 'text',
        placeholder: 'Qualys API user',
        required: true,
      },
      {
        id: 'password',
        label: 'API password',
        type: 'password',
        placeholder: 'Qualys API password',
        required: true,
      },
    ],
    syncCapabilities: ['Host detections', 'QID/CVE mapping', 'TruRisk scores', 'Patch status'],
  },
  {
    id: 'hcl-appscan',
    name: 'HCL AppScan',
    category: 'dast',
    description:
      'Import DAST scan results from HCL AppScan on Cloud or AppScan Enterprise via REST API.',
    docsUrl: 'https://help.hcltechsw.com/appscan/ASoC/appseccloud.html',
    apiDocsLabel: 'AppScan on Cloud API',
    authType: 'token',
    defaultApiBaseUrl: 'https://cloud.appscan.com',
    fields: [
      {
        id: 'apiBaseUrl',
        label: 'AppScan API URL',
        type: 'url',
        placeholder: 'https://cloud.appscan.com',
        required: true,
      },
      {
        id: 'apiKey',
        label: 'API key / token',
        type: 'password',
        placeholder: 'AppScan API key',
        required: true,
      },
      {
        id: 'applicationId',
        label: 'Application ID',
        type: 'text',
        placeholder: 'AppScan application or scan config ID',
        required: false,
        helpText: 'Optional — limits sync to a single application',
      },
    ],
    syncCapabilities: ['DAST findings', 'OWASP mapping', 'Scan history', 'Issue severity'],
  },
  {
    id: 'nmap',
    name: 'Nmap',
    category: 'network',
    description:
      'Ingest Nmap XML scan output or connect to a scan orchestration API (e.g. custom runner, OpenVAS bridge).',
    docsUrl: 'https://nmap.org/book/man-nse.html',
    apiDocsLabel: 'Nmap scripting engine',
    authType: 'api-key',
    defaultApiBaseUrl: 'https://scan-runner.internal/api/v1',
    fields: [
      {
        id: 'apiBaseUrl',
        label: 'Scan runner API URL',
        type: 'url',
        placeholder: 'https://scan-runner.internal/api/v1',
        required: true,
        helpText: 'Endpoint that accepts Nmap jobs or returns parsed XML results',
      },
      {
        id: 'apiKey',
        label: 'API key',
        type: 'password',
        placeholder: 'Bearer token for scan runner',
        required: false,
      },
      {
        id: 'scanProfile',
        label: 'Default scan profile',
        type: 'text',
        placeholder: 'e.g. -sV -T4 --script vuln',
        required: false,
        helpText: 'Nmap arguments used when triggering scheduled scans',
      },
    ],
    syncCapabilities: ['Port/service discovery', 'NSE vuln scripts', 'XML import', 'Asset tagging'],
  },
];

export const VA_CATEGORY_LABELS: Record<VaToolCategory, string> = {
  infrastructure: 'Infrastructure VM',
  dast: 'Application DAST',
  network: 'Network discovery',
};

export function getVaToolById(id: string) {
  return VA_TOOL_DEFINITIONS.find((t) => t.id === id);
}
