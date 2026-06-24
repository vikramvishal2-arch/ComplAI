'use client';

import { useEffect, useState } from 'react';
import { Mail, MapPin, Target } from 'lucide-react';
import { MarketingPageHub } from '@/components/marketing/marketing-page-hub';
import { ORGANIZATION_NAME, PRODUCT_NAME, PRODUCT_TAGLINE } from '@/lib/brand';
import { COMPANY_PAGE_HUB } from '@/lib/data/marketing-page-hubs';
import { ContactFormDialog } from '@/components/marketing/contact-form-dialog';

const values = [
  {
    icon: Target,
    title: 'Our mission',
    body: 'Help organizations connect security, governance, and compliance into one continuous program — so audit readiness is built in, not bolted on before every review cycle.',
  },
  {
    icon: MapPin,
    title: 'What we do',
    body: `${ORGANIZATION_NAME} delivers GRC consulting and ${PRODUCT_NAME}, our ${PRODUCT_TAGLINE.toLowerCase()}, covering frameworks, ISMS policies, control evidence, integrations, and executive visibility.`,
  },
  {
    icon: Mail,
    title: 'Who we serve',
    body: 'Teams preparing for SOC 2, ISO 27001, India DPDP, SEBI CSCRF, and multi-framework programs — from first audit to enterprise-scale GRC operations.',
  },
];

type CompanyPageContentProps = {
  openContactOnMount?: boolean;
};

export function CompanyPageContent({ openContactOnMount = false }: CompanyPageContentProps) {
  const [contactOpen, setContactOpen] = useState(openContactOnMount);

  useEffect(() => {
    if (openContactOnMount) setContactOpen(true);
  }, [openContactOnMount]);

  return (
    <>
      <section className="bg-scrut-navy bg-scrut-hero py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-scrut-teal">Company</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{ORGANIZATION_NAME}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            Connect. Secure. Advance. We build {PRODUCT_NAME} so your team can run a security-first
            GRC program with clarity, speed, and confidence.
          </p>
        </div>
      </section>

      <MarketingPageHub groups={COMPANY_PAGE_HUB} />

      <section id="about" className="scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {values.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-[#f4f7fb] p-6 sm:p-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-scrut-gradient">
                  <Icon className="h-5 w-5 text-scrut-navy" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-scrut-navy">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-scrut-navy sm:text-4xl">
            Get in touch
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Interested in {PRODUCT_NAME}, a demo, or GRC advisory from {ORGANIZATION_NAME}? Share
            your details and we&apos;ll respond promptly.
          </p>
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-scrut-gradient px-8 py-3.5 text-sm font-semibold text-scrut-navy shadow-sm transition-opacity hover:opacity-90"
            >
              Open contact form
            </button>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            <a
              href="https://propelreadysolutions.in"
              className="font-medium text-scrut-navy hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              propelreadysolutions.in
            </a>
          </p>
        </div>
      </section>

      <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}
