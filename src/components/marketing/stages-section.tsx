import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PRODUCT_NAME } from '@/lib/brand';

const stages = [
  {
    title: 'Compliance readiness that doesn\'t reset after every audit cycle.',
    body: 'Whether you need SOC 2, ISO 27001 or something else, we\'ll get you to the finish line.',
    cta: 'Get audit ready in no time',
    href: '/resources/soc-2',
  },
  {
    title: 'Need to meet multiple requirements?',
    body: 'Scale your security program, tackle multiple frameworks, and manage your risk.',
    cta: 'Meet your growing compliance needs',
    href: '/solutions',
  },
  {
    title: 'Need to scale your security program?',
    body: 'Manage risks and compliance across multiple subsidiaries, products and regions effortlessly.',
    cta: 'Power your enterprise-grade GRC',
    href: '/solutions#dashboard',
  },
];

export function StagesSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-scrut-navy sm:text-4xl">
            Your goals, your stage. We help you level up.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Whether you need to get compliant yesterday to close a deal, or build a security program
            that adapts to your unique risk, {PRODUCT_NAME}&apos;s got you covered.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {stages.map((stage) => (
            <Link
              key={stage.title}
              href={stage.href}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-scrut-teal/30 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-scrut-navy">{stage.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{stage.body}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-scrut-navy group-hover:text-scrut-blue">
                {stage.cta}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
