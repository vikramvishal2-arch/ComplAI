'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { TprmPageHeader } from '@/components/tprm/tprm-sub-nav';
import { VendorRemediationPanel } from '@/components/vendors/vendor-remediation-panel';
import { parseRemediationItems, type VendorRemediationItem } from '@/lib/vendor/vendor-assessment-types';
import { Loader2 } from 'lucide-react';

interface RemediationEntry extends VendorRemediationItem {
  vendorId: string;
  vendorName: string;
  assessmentId: string;
}

export default function RemediationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<RemediationEntry[]>([]);

  useEffect(() => {
    fetch('/api/vendors')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        const all: RemediationEntry[] = [];
        for (const v of d.vendors) {
          for (const a of v.assessments ?? []) {
            for (const item of parseRemediationItems(a.remediationItems)) {
              if (item.status !== 'completed' && item.status !== 'waived') {
                all.push({ ...item, vendorId: v.id, vendorName: v.name, assessmentId: a.id });
              }
            }
          }
        }
        setEntries(all);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="TPRM" subtitle="Remediation tracking">
      <TprmPageHeader
        title="Remediation requests"
        description="Track vendor remediation requests identified from questionnaires and external risk monitoring."
      />

      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          No open remediation requests. Complete vendor assessments to generate remediation items.
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((e) => (
            <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <button
                type="button"
                onClick={() => router.push(`/vendors/${e.vendorId}?tab=remediation`)}
                className="mb-2 text-sm font-semibold text-brand-600 hover:underline"
              >
                {e.vendorName}
              </button>
              <VendorRemediationPanel items={[e]} readOnly />
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
