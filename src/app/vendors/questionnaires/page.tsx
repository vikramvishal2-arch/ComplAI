'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { TprmPageHeader } from '@/components/tprm/tprm-sub-nav';
import { TprmQuestionnaireHub } from '@/components/tprm/tprm-questionnaire-hub';
import { Loader2 } from 'lucide-react';

export default function QuestionnairesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<
    Array<{
      id: string;
      vendorId: string;
      vendorName: string;
      templateName: string;
      status: string;
      questionnaireStatus: string;
      dueDate: string | null;
      aiScore: number | null;
      completedAt: string | null;
    }>
  >([]);

  useEffect(() => {
    fetch('/api/vendors')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        const rows: typeof items = [];
        for (const v of d.vendors) {
          for (const a of v.assessments ?? []) {
            rows.push({
              id: a.id,
              vendorId: v.id,
              vendorName: v.name,
              templateName: a.templateName ?? 'TPRM Standard',
              status: a.status,
              questionnaireStatus: a.questionnaireStatus ?? a.status,
              dueDate: a.dueDate,
              aiScore: a.aiScore,
              completedAt: a.completedAt,
            });
          }
        }
        setItems(rows.sort((a, b) => (b.dueDate ?? '').localeCompare(a.dueDate ?? '')));
      })
      .finally(() => setLoading(false));
  }, []);

  const pending = useMemo(() => items.filter((i) => i.status !== 'completed').length, [items]);
  const completed = items.length - pending;

  return (
    <AppShell title="TPRM" subtitle="Questionnaire management">
      <TprmPageHeader
        title="Security questionnaires"
        description="Send, track, and analyze vendor security questionnaires. Import completed CSV/JSON responses or use pre-defined templates. Risks are automatically identified from responses."
      />

      <div className="mb-6 flex gap-4 text-sm">
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <span className="font-bold text-blue-800">{pending}</span>{' '}
          <span className="text-blue-700">outstanding</span>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="font-bold text-emerald-800">{completed}</span>{' '}
          <span className="text-emerald-700">completed</span>
        </div>
      </div>

      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      ) : (
        <TprmQuestionnaireHub
          items={items}
          onOpen={(vendorId, assessmentId) =>
            router.push(`/vendors/${vendorId}?tab=questionnaires&assessment=${assessmentId}`)
          }
        />
      )}
    </AppShell>
  );
}
