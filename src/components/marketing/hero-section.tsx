import { HeroDashboardPreview } from '@/components/marketing/hero-dashboard-preview';
import { ComplAIStyled } from '@/components/marketing/complai-brand-link';
import { ScrutPrimaryButton, ScrutOutlineButton } from '@/components/marketing/marketing-ui';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-scrut-hero text-white">
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-scrut-teal">
            Propel Ready Solutions
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            Your organization&apos;s security posture —{' '}
            <span className="bg-scrut-gradient bg-clip-text text-transparent">
              across every dimension.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-300">
            One unified risk profile spanning people, cloud, data, vendors, compliance, and
            operations — so leadership always knows where you stand before audits, incidents, or
            deals force the issue.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ScrutPrimaryButton href="/company?contact=1">Book a demo</ScrutPrimaryButton>
            <ScrutOutlineButton href="#complai">
              Meet <ComplAIStyled className="font-semibold" />
            </ScrutOutlineButton>
          </div>
        </div>

        <div className="mt-12 lg:mt-14">
          <HeroDashboardPreview />
        </div>
      </div>
    </section>
  );
}
