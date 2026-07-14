/**
 * Jira Cloud / Server REST config (server-only).
 *
 * Auth: JIRA_EMAIL + personal API token (id.atlassian.com/.../api-tokens) via Basic auth.
 * Organization API keys from admin.atlassian.com (and JIRA_ORG_ID) do not authenticate Jira REST.
 *
 * Classification of issues into SAST / DAST / Infra / Cloud:
 * 1. Prefer labels: `sast`, `dast`, `infra` (or `infrastructure`), `cloud`
 * 2. Optional per-source JQL overrides: JIRA_JQL_SAST, JIRA_JQL_DAST, JIRA_JQL_INFRA, JIRA_JQL_CLOUD
 * 3. Optional global open-issues JQL: JIRA_JQL (defaults to project + unresolved + known labels)
 */

import { parseSafeHttpsUrl } from '@/lib/security/url-guards';

export type JiraConfig = {
  configured: boolean;
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  /** Global JQL override when set (still filtered client-side by source when needed). */
  jql: string;
  jqlBySource: {
    sast: string;
    dast: string;
    infra: string;
    cloud: string;
  };
};

function trimEnv(key: string): string {
  return process.env[key]?.trim() ?? '';
}

function sanitizeJiraBaseUrl(raw: string): string {
  if (!raw) return '';
  const parsed = parseSafeHttpsUrl(raw);
  if (!parsed.ok) {
    console.warn(`[jira] Ignoring JIRA_BASE_URL: ${parsed.error}`);
    return '';
  }
  return parsed.url.origin;
}

export function getJiraConfig(): JiraConfig {
  const baseUrl = sanitizeJiraBaseUrl(trimEnv('JIRA_BASE_URL').replace(/\/$/, ''));
  const email = trimEnv('JIRA_EMAIL') || trimEnv('JIRA_USER');
  const apiToken = trimEnv('JIRA_API_TOKEN');
  const projectKey = trimEnv('JIRA_PROJECT_KEY') || 'SEC';
  const jql = trimEnv('JIRA_JQL');

  const configured = Boolean(baseUrl && email && apiToken);

  return {
    configured,
    baseUrl,
    email,
    apiToken,
    projectKey,
    jql,
    jqlBySource: {
      sast: trimEnv('JIRA_JQL_SAST'),
      dast: trimEnv('JIRA_JQL_DAST'),
      infra: trimEnv('JIRA_JQL_INFRA'),
      cloud: trimEnv('JIRA_JQL_CLOUD'),
    },
  };
}

export function isJiraConfigured(): boolean {
  return getJiraConfig().configured;
}
