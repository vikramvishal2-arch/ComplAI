'use client';

/** Shared browser-style frame for marketing product previews. */
export function MarketingPreviewChrome({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-lg shadow-black/20">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="ml-2 text-[11px] font-medium text-slate-500">{label}</span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
