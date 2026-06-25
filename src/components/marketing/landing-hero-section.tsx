import Link from 'next/link';

import { OrganizationRiskProfile } from '@/components/marketing/organization-risk-profile';



const pillars = [

  {

    title: 'Connect',

    description: 'Unify people, process, and technology across your security program.',

  },

  {

    title: 'Secure',

    description: 'See risk and control posture across every dimension of the organization.',

  },

  {

    title: 'Advance',

    description: 'Move from reactive compliance to continuous, leadership-ready GRC.',

  },

];



export function LandingHeroSection() {

  return (

    <section className="relative overflow-hidden border-b border-emerald-500/10 bg-marketing-surface">

      <div

        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(16,185,129,0.12),transparent_55%)]"

        aria-hidden

      />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8 lg:pb-24">

        <div className="mx-auto max-w-4xl text-center">

          <h1 className="landing-hero-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            <span className="block">Security visibility for your organization —</span>
            <span className="block text-emerald-400">every dimension, one picture.</span>
          </h1>

          <div className="mx-auto mt-5 max-w-2xl space-y-4 text-center">
            <p className="text-lg leading-relaxed text-zinc-400">
              Helping organizations manage cyber risk, compliance, cloud, data, and operational
              resilience—before risk becomes business impact.
            </p>
            <p className="text-base font-medium text-zinc-300">
              Ensure Compliance. Accelerate Growth.
            </p>
          </div>



          <div className="mt-8 grid gap-4 sm:grid-cols-3">

            {pillars.map((pillar) => (

              <div

                key={pillar.title}

                className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-4 text-left"

              >

                <p className="text-sm font-bold uppercase tracking-wide text-emerald-400">

                  {pillar.title}

                </p>

                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{pillar.description}</p>

              </div>

            ))}

          </div>



          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">

            <Link

              href="/company?contact=1"

              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black shadow-sm transition-opacity hover:bg-emerald-400"

            >

              Talk to our team

            </Link>

            <Link

              href="#complai"

              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:border-emerald-500/40 hover:bg-white/5"

            >

              About our GRC platform

            </Link>

          </div>

        </div>



        <div className="mt-12 lg:mt-14">

          <OrganizationRiskProfile />

        </div>

      </div>

    </section>

  );

}

