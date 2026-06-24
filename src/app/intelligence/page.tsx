'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { CopilotChat } from '@/components/ai/copilot-chat';
import { GapAnalysisPanel } from '@/components/ai/gap-analysis-panel';
import { QuestionnairePanel } from '@/components/ai/questionnaire-panel';
import { ChronicleIntelligencePanel } from '@/components/ai/chronicle-intelligence-panel';
import { MonitoringPanel, MonitoringPanelCompact } from '@/components/ai/monitoring-panel';
import {
  Bot,
  CheckCircle2,
  CircleDashed,
  FileSearch,
  ClipboardList,
  Sparkles,
  AlertCircle,
  Radar,
  CloudCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabId = 'overview' | 'copilot' | 'gaps' | 'questionnaire' | 'chronicle' | 'monitoring';

const tabs: { id: TabId; label: string; icon: typeof Bot }[] = [
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'copilot', label: 'AI Copilot', icon: Bot },
  { id: 'gaps', label: 'Gap Analysis', icon: FileSearch },
  { id: 'questionnaire', label: 'Questionnaires', icon: ClipboardList },
  { id: 'chronicle', label: 'Chronicle', icon: Radar },
  { id: 'monitoring', label: 'Monitoring', icon: CloudCog },
];

interface Capability {
  id: string;
  name: string;
  description: string;
  status: string;
  requiresApiKey: boolean;
}

export default function IntelligencePage() {
  const [tab, setTab] = useState<TabId>('overview');
  const [capabilities, setCapabilities] = useState<Record<string, Capability>>({});
  const [aiConfigured, setAiConfigured] = useState(false);
  const [aiProvider, setAiProvider] = useState<string>('openai');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialTab = params.get('tab') as TabId;
    if (initialTab && tabs.some((t) => t.id === initialTab)) {
      setTab(initialTab);
    }

    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((d) => {
        setCapabilities(d.capabilities ?? {});
        setAiConfigured(d.ai?.configured ?? false);
        setAiProvider(d.ai?.provider ?? 'openai');
      });
  }, []);

  return (
    <AppShell
      title="Intelligence"
      subtitle="AI copilot, gap analysis, questionnaires, and Google Chronicle SecOps intelligence"
    >
      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors -mb-px',
                tab === t.id
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {!aiConfigured && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">AI Copilot not connected</p>
            <p className="mt-1 text-amber-800">
              <strong>Free option:</strong> set{' '}
              <code className="rounded bg-amber-100 px-1">AI_PROVIDER=ollama</code> in{' '}
              <code className="rounded bg-amber-100 px-1">.env</code>, install{' '}
              <a href="https://ollama.com" className="underline" target="_blank" rel="noreferrer">
                Ollama
              </a>
              , and run <code className="rounded bg-amber-100 px-1">ollama pull llama3.2</code>.
              No API key needed.
            </p>
            <p className="mt-2 text-amber-800">
              Or use a free Groq key at console.groq.com with{' '}
              <code className="rounded bg-amber-100 px-1">AI_PROVIDER=groq</code>. ChatGPT / Cursor
              IDE subscriptions do not provide an API key for this app.
            </p>
          </div>
        </div>
      )}

      {aiConfigured && aiProvider === 'ollama' && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          Using <strong>Ollama</strong> (local, free) — provider: {aiProvider}
        </div>
      )}

      {tab === 'overview' && (
        <div className="space-y-6">
          <section className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50/80 to-white p-6">
            <h2 className="text-lg font-bold text-slate-900">ComplAI Intelligence</h2>
            <p className="mt-1 text-sm text-slate-600">
              Lead GRC with AI-assisted gap detection, remediation guidance, and questionnaire
              auto-fill — built for CISO and compliance teams.
            </p>
          </section>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(capabilities).map((cap) => (
              <CapabilityCard
                key={cap.id}
                capability={cap}
                onOpen={() => {
                  if (cap.id === 'ai-copilot') setTab('copilot');
                  else if (cap.id === 'gap-analysis') setTab('gaps');
                  else if (cap.id === 'questionnaire-autofill') setTab('questionnaire');
                  else if (cap.id === 'chronicle-intelligence') setTab('chronicle');
                  else if (cap.id === 'continuous-monitoring') setTab('monitoring');
                  else if (cap.id === 'vendor-risk-ai') window.location.href = '/vendors';
                }}
              />
            ))}
          </div>

          <GapAnalysisPanel compact />
          <MonitoringPanelCompact />
        </div>
      )}

      {tab === 'copilot' && (
        <div className="max-w-3xl">
          <p className="mb-4 text-sm text-slate-600">
            Natural-language GRC expert across your activated frameworks, controls, and risk posture.
          </p>
          <CopilotChat />
        </div>
      )}

      {tab === 'gaps' && <GapAnalysisPanel />}

      {tab === 'questionnaire' && <QuestionnairePanel />}

      {tab === 'chronicle' && <ChronicleIntelligencePanel />}

      {tab === 'monitoring' && <MonitoringPanel />}
    </AppShell>
  );
}

function CapabilityCard({
  capability,
  onOpen,
}: {
  capability: Capability;
  onOpen: () => void;
}) {
  const statusIcon =
    capability.status === 'active' ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : capability.status === 'roadmap' ? (
      <CircleDashed className="h-4 w-4 text-slate-400" />
    ) : (
      <AlertCircle className="h-4 w-4 text-amber-500" />
    );

  const clickable = !['roadmap', 'disabled'].includes(capability.status);

  return (
    <button
      type="button"
      onClick={clickable ? onOpen : undefined}
      disabled={!clickable}
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow',
        clickable && 'hover:border-brand-200 hover:shadow-md cursor-pointer',
        !clickable && 'opacity-80 cursor-default'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{capability.name}</h3>
        {statusIcon}
      </div>
      <p className="mt-2 text-sm text-slate-600">{capability.description}</p>
      <p className="mt-3 text-xs font-medium capitalize text-slate-400">
        {capability.status.replace(/_/g, ' ')}
        {capability.requiresApiKey ? ' · API key' : ''}
      </p>
    </button>
  );
}
