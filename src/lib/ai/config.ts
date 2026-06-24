import { getChronicleConfig } from '../integrations/chronicle/config';
import { getMonitoringStatus } from '../monitoring/config';

export type AiProvider = 'openai' | 'ollama' | 'groq';

export interface AiConfig {
  enabled: boolean;
  configured: boolean;
  provider: AiProvider;
  model: string;
  baseUrl: string;
  requiresApiKey: boolean;
}

export { getChronicleConfig };

const PROVIDER_DEFAULTS: Record<
  AiProvider,
  { baseUrl: string; model: string; requiresApiKey: boolean }
> = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    requiresApiKey: true,
  },
  ollama: {
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3.2',
    requiresApiKey: false,
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant',
    requiresApiKey: true,
  },
};

function parseProvider(value: string | undefined): AiProvider {
  if (value === 'ollama' || value === 'groq') return value;
  return 'openai';
}

export function getAiConfig(): AiConfig {
  const enabled = process.env.AI_ENABLED !== 'false';
  const provider = parseProvider(process.env.AI_PROVIDER?.trim());
  const defaults = PROVIDER_DEFAULTS[provider];
  const apiKey = process.env.OPENAI_API_KEY?.trim() ?? '';
  const baseUrl = process.env.OPENAI_BASE_URL?.trim() || defaults.baseUrl;
  const model = process.env.OPENAI_MODEL?.trim() || defaults.model;

  const configured =
    enabled &&
    (provider === 'ollama' || apiKey.length > 0);

  return {
    enabled,
    configured,
    provider,
    model,
    baseUrl,
    requiresApiKey: defaults.requiresApiKey,
  };
}

export function getIntelligenceCapabilities() {
  const ai = getAiConfig();
  const chronicle = getChronicleConfig();
  const monitoring = getMonitoringStatus();

  return {
    aiCopilot: {
      id: 'ai-copilot',
      name: 'AI Copilot',
      description: 'Natural-language GRC expert — ask about controls, gaps, remediation, and audit prep.',
      status: ai.configured ? 'active' : ai.enabled ? 'needs_config' : 'disabled',
      requiresApiKey: ai.requiresApiKey,
    },
    gapAnalysis: {
      id: 'gap-analysis',
      name: 'Policy & Evidence Gap Analysis',
      description: 'Find missing methods, owners, evidence, and weak documentation before audits.',
      status: 'active',
      requiresApiKey: false,
    },
    remediationAssist: {
      id: 'remediation-assist',
      name: 'AI-Guided Remediation',
      description: 'Prioritized fix suggestions with implementation steps for failing controls.',
      status: ai.configured ? 'active' : 'needs_config',
      requiresApiKey: ai.requiresApiKey,
    },
    questionnaireAutofill: {
      id: 'questionnaire-autofill',
      name: 'Security Questionnaire Auto-Fill',
      description: 'Draft answers from your control narratives, policies, and evidence notes.',
      status: ai.configured ? 'active' : 'partial',
      requiresApiKey: false,
    },
    chronicleIntelligence: {
      id: 'chronicle-intelligence',
      name: 'Google Chronicle Intelligence',
      description:
        'SIEM posture from Google SecOps — ingestion, detection, investigation, and response readiness.',
      status: chronicle.configured ? 'active' : chronicle.enabled ? 'needs_config' : 'partial',
      requiresApiKey: false,
    },
    continuousMonitoring: {
      id: 'continuous-monitoring',
      name: 'Continuous Control Monitoring',
      description: 'Automated AWS and Azure compliance checks mapped to SOC 2 / ISO controls.',
      status: monitoring.anyConfigured ? 'active' : 'needs_config',
      requiresApiKey: false,
    },
    vendorRiskAi: {
      id: 'vendor-risk-ai',
      name: 'AI Vendor Risk Assessments',
      description: 'Generate vendor questionnaires and score responses with AI or rule-based fallback.',
      status: 'active',
      requiresApiKey: false,
    },
  };
}
