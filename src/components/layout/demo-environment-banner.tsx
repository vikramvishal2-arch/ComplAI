'use client';

import Link from 'next/link';
import { Sparkles, Eye } from 'lucide-react';
import { useDemoSession } from '@/hooks/use-demo-session';

export function DemoEnvironmentBanner() {
  const { portalEnabled, isCustomer, signedIn } = useDemoSession();
  const showDemoBanner =
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || (portalEnabled && signedIn);

  if (!showDemoBanner) {
    return null;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-8 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="flex items-center gap-2 font-medium text-amber-900">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-600" />
          ComplAI Lab demo — sample data for customer walkthroughs
          {isCustomer && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
              <Eye className="h-3 w-3" />
              View-only dashboard · frameworks activatable
            </span>
          )}
        </p>
        <Link href="/company?contact=1" className="font-semibold text-brand-600 hover:underline">
          Book a guided demo
        </Link>
      </div>
    </div>
  );
}
