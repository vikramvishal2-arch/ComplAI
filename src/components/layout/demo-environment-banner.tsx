'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function DemoEnvironmentBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    return null;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-8 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="flex items-center gap-2 font-medium text-amber-900">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-600" />
          Demo environment — sample data for customer walkthroughs
        </p>
        <Link href="/company?contact=1" className="font-semibold text-brand-600 hover:underline">
          Book a guided demo
        </Link>
      </div>
    </div>
  );
}
