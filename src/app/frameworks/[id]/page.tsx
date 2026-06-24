'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { ReadinessBar, StatusBadge, MethodBadge } from '@/components/ui/badges';
import { DOMAIN_LABELS, type Control, type ControlCompliance } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

interface FrameworkDetailData {
  framework: { name: string; shortName: string; description: string };
  stats: { total: number; ready: number; readiness: number };
  controls: (Control & { compliance: ControlCompliance; openIssueCount: number; openRiskCount: number })[];
}

export default function FrameworkDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<FrameworkDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/frameworks/${id}`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) {
          throw new Error(json.error ?? 'Failed to load framework');
        }
        if (!json.framework || !json.stats || !Array.isArray(json.controls)) {
          throw new Error('Invalid framework response');
        }
        return json as FrameworkDetailData;
      })
      .then(setData)
      .catch((err: Error) => {
        setData(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AppShell
      title={data?.framework.shortName ?? 'Framework'}
      subtitle={data?.framework.description}
    >
      <Link
        href="/frameworks"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to frameworks
      </Link>

      {loading ? (
        <div className="animate-pulse h-64 rounded-xl bg-slate-200" />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          {error}.{' '}
          <Link href="/frameworks" className="font-medium underline">
            Return to frameworks
          </Link>
        </div>
      ) : data ? (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Total controls</p>
              <p className="text-2xl font-bold">{data.stats.total}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Ready for audit</p>
              <p className="text-2xl font-bold text-emerald-600">{data.stats.ready}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <ReadinessBar value={data.stats.readiness} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">Controls</h2>
                <p className="text-sm text-slate-500">
                  Click a control to define how your organization will comply
                </p>
              </div>
              <a
                href={`/api/export?format=csv&frameworkId=${id}`}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Export compliance plan (CSV)
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Reference</th>
                    <th className="px-6 py-3">Control</th>
                    <th className="px-6 py-3">Domain</th>
                    <th className="px-6 py-3">Approach</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Issues</th>
                    <th className="px-6 py-3">Risks</th>
                    <th className="px-6 py-3">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.controls.map((control) => (
                    <tr key={control.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-xs text-brand-600">
                        <Link href={`/controls/${control.id}`}>{control.reference}</Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/controls/${control.id}`}
                          className="font-medium text-slate-900 hover:text-brand-600"
                        >
                          {control.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {DOMAIN_LABELS[control.domain]}
                      </td>
                      <td className="px-6 py-4">
                        <MethodBadge method={control.compliance.complianceMethod} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={control.compliance.status} />
                      </td>
                      <td className="px-6 py-4">
                        {control.openIssueCount > 0 ? (
                          <Link
                            href={`/controls/${control.id}?tab=issues`}
                            className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 hover:bg-red-200"
                          >
                            {control.openIssueCount} open
                          </Link>
                        ) : (
                          <Link
                            href={`/controls/${control.id}?tab=issues`}
                            className="text-xs text-slate-400 hover:text-brand-600"
                          >
                            Raise issue
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {control.openRiskCount > 0 ? (
                          <Link
                            href={`/controls/${control.id}`}
                            className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 hover:bg-purple-200"
                          >
                            {control.openRiskCount} open
                          </Link>
                        ) : (
                          <Link
                            href={`/controls/${control.id}`}
                            className="text-xs text-slate-400 hover:text-brand-600"
                          >
                            View control
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {control.compliance.owner || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
