'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FaqItem } from '@/lib/data/marketing-resources';

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              id={`faq-${item.id}`}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${item.id}`}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 sm:px-6 sm:py-5"
            >
              <span className="font-semibold text-scrut-navy">{item.question}</span>
              <ChevronDown
                className={cn(
                  'mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            {isOpen && (
              <div
                id={`faq-panel-${item.id}`}
                role="region"
                aria-labelledby={`faq-${item.id}`}
                className="px-5 pb-5 text-sm leading-relaxed text-slate-600 sm:px-6 sm:pb-6"
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
