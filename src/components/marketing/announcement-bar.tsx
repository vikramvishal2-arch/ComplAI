import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ComplAIBrandLink } from '@/components/marketing/complai-brand-link';

export function AnnouncementBar() {
  return (
    <div className="border-b border-white/10 bg-scrut-navy-light">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center text-sm text-white/90">
        <span>
          Meet <ComplAIBrandLink inheritWeight /> Intelligence: Your AI-powered teammate for risk
          &amp; compliance
        </span>
        <Link
          href="/solutions/intelligence"
          className="inline-flex items-center gap-1 font-semibold text-scrut-teal hover:underline"
        >
          Learn more
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
