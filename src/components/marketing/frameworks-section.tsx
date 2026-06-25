import Link from 'next/link';
import { FRAMEWORKS } from '@/lib/data/frameworks';
import { FRAMEWORK_GUIDES } from '@/lib/data/marketing-resources';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';

const frameworkColors = [
  'from-blue-500/15 to-blue-600/5',
  'from-emerald-500/15 to-emerald-600/5',
  'from-emerald-500/15 to-emerald-600/5',
  'from-amber-500/15 to-amber-600/5',
  'from-rose-500/15 to-rose-600/5',
  'from-cyan-500/15 to-cyan-600/5',
];

export function FrameworksSection() {
  const featuredGuides = FRAMEWORK_GUIDES.slice(0, 6);
  const otherFrameworks = FRAMEWORKS.filter(
    (f) => !FRAMEWORK_GUIDES.some((g) => g.frameworkId === f.id)
  ).slice(0, 12);

  return (
    <section id="solutions" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Compliance frameworks we&apos;re fluent in
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Explore guides for SOC 2, ISO 27001, GDPR, and more in our Resources hub.
          </p>
        </div>

        <div className="mt-12 flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {featuredGuides.map((guide, i) => (
            <Link
              key={guide.slug}
              href={`/resources/${guide.slug}`}
              className={`min-w-[160px] shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br ${frameworkColors[i % frameworkColors.length]} px-5 py-6 text-center shadow-sm transition-shadow hover:shadow-md`}
            >
              <p className="text-lg font-bold text-zinc-100">{guide.shortName}</p>
              <p className="mt-1 text-xs text-zinc-500">Read guide →</p>
            </Link>
          ))}
        </div>

        {otherFrameworks.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {otherFrameworks.map((fw) => (
              <span
                key={fw.id}
                className="rounded-full border border-white/10 bg-scrut-navy-light/80 px-3 py-1.5 text-xs font-medium text-zinc-400"
              >
                {fw.shortName}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ScrutPrimaryButton href="/resources#frameworks">Framework guides</ScrutPrimaryButton>
          <Link
            href="/resources#faqs"
            className="inline-flex items-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/5"
          >
            Read FAQs
          </Link>
        </div>
      </div>
    </section>
  );
}
