'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { ArrowRight, CheckCircle2, Clock, Loader2, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MEMBER_STORAGE_KEY = 'approvalMemberId';

interface Member {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  approvalRoles: string[];
}

interface InboxItem {
  policyId: string;
  title: string;
  status: string;
  version: string;
  isoReference: string;
  stepRole: string;
  stepStatus: string;
  actionType: 'prepare' | 'review';
  actionable: boolean;
  blockedReason: string | null;
  hasDocument: boolean;
  progress: { completed: number; required: number; percent: number };
}

function ApprovalsInboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState('');
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedMember = members.find((m) => m.id === memberId);

  useEffect(() => {
    fetch('/api/members')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load members');
        return d.members as Member[];
      })
      .then((list) => {
        setMembers(list);
        const fromUrl = searchParams.get('member');
        const fromStorage =
          typeof window !== 'undefined' ? localStorage.getItem(MEMBER_STORAGE_KEY) : null;
        const initial = fromUrl || fromStorage || list[0]?.id || '';
        setMemberId(initial);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    if (!memberId) return;
    localStorage.setItem(MEMBER_STORAGE_KEY, memberId);
    router.replace(`/policies/approvals?member=${memberId}`, { scroll: false });

    setLoading(true);
    setError(null);
    fetch(`/api/policies/approvals/inbox?memberId=${memberId}&filter=${filter}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load inbox');
        return d.items as InboxItem[];
      })
      .then(setItems)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [memberId, filter, router]);

  const pendingCount = items.filter((i) => i.actionable).length;

  return (
    <AppShell
      title="My approvals"
      subtitle="Each employee sees only documents assigned to them in the approval workflow"
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-sm">
            <span className="flex items-center gap-2 font-medium text-slate-700">
              <UserCircle2 className="h-4 w-4" />
              View as employee
            </span>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          {selectedMember && (
            <div className="mt-4 rounded-lg bg-slate-50 px-3 py-3 text-sm">
              <p className="font-medium text-slate-900">{selectedMember.name}</p>
              <p className="text-slate-600">{selectedMember.title}</p>
              <p className="mt-1 text-xs text-slate-500">{selectedMember.email}</p>
              <p className="mt-2 text-xs text-slate-500">
                Roles: {selectedMember.approvalRoles.join(', ')}
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium',
                filter === 'pending'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              Pending
              {filter === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-xs">{pendingCount}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium',
                filter === 'completed'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              Completed
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading inbox…
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                {filter === 'pending' ? 'No pending approvals' : 'No completed approvals yet'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {filter === 'pending'
                  ? 'Documents assigned to this employee will appear here when they need to act.'
                  : 'Approved or rejected items will show here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <Link
                  key={`${item.policyId}-${item.stepRole}`}
                  href={`/policies/approvals/${item.policyId}?member=${memberId}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.isoReference && `${item.isoReference} · `}
                        v{item.version} · Your role: {item.stepRole}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                            item.actionable
                              ? 'bg-amber-100 text-amber-800'
                              : item.stepStatus === 'approved' && item.actionType === 'prepare'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.stepStatus === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                          )}
                        >
                          {item.actionable
                            ? item.actionType === 'prepare'
                              ? 'Prepare version'
                              : 'Action required'
                            : item.actionType === 'prepare' && item.stepStatus === 'approved'
                              ? 'Prepared'
                              : item.stepStatus}
                        </span>
                        {item.blockedReason && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            {item.blockedReason}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-500">
                        {item.progress.completed}/{item.progress.required} sign-offs
                      </p>
                      <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${item.progress.percent}%` }}
                        />
                      </div>
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                        Open
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function ApprovalsInboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
          Loading approvals…
        </div>
      }
    >
      <ApprovalsInboxContent />
    </Suspense>
  );
}
