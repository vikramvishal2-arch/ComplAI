'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, MapPin, Target } from 'lucide-react';
import { CompanyPageHub } from '@/components/marketing/company-page-hub';
import { ORGANIZATION_NAME, PRODUCT_TAGLINE } from '@/lib/brand';
import { ComplAIBrandLink, ComplAIText } from '@/components/marketing/complai-brand-link';
import { ContactFormDialog } from '@/components/marketing/contact-form-dialog';

const HEADER_OFFSET = 120;

const values = [
  {
    icon: Target,
    title: 'Our mission',
    body: 'Help organizations connect security, governance, and compliance into one continuous program — so audit readiness is built in, not bolted on before every review cycle.',
  },
  {
    icon: MapPin,
    title: 'What we do',
    body: `${ORGANIZATION_NAME} delivers GRC consulting and ComplAI, our ${PRODUCT_TAGLINE.toLowerCase()}, covering frameworks, ISMS policies, control evidence, integrations, and executive visibility.`,
  },
  {
    icon: Mail,
    title: 'Who we serve',
    body: 'Teams preparing for SOC 2, ISO 27001, India DPDP, SEBI CSCRF, and multi-framework programs — from first audit to enterprise-scale GRC operations.',
  },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;

  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  window.history.replaceState(null, '', `#${id}`);
  return true;
}

type CompanyPageContentProps = {
  openContactOnMount?: boolean;
};

export function CompanyPageContent({ openContactOnMount = false }: CompanyPageContentProps) {
  const searchParams = useSearchParams();
  const [contactOpen, setContactOpen] = useState(openContactOnMount);

  const openContact = useCallback(() => {
    setContactOpen(true);
    window.setTimeout(() => scrollToSection('contact'), 50);
  }, []);

  const goToAbout = useCallback(() => {
    scrollToSection('about');
  }, []);

  useEffect(() => {
    const contact = searchParams.get('contact');
    if (contact === '1' || contact === 'true') {
      openContact();
    }
  }, [searchParams, openContact]);

  useEffect(() => {
    if (openContactOnMount) {
      openContact();
    }
  }, [openContactOnMount, openContact]);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const id = hash.slice(1);
      window.setTimeout(() => {
        scrollToSection(id);
        if (id === 'contact') setContactOpen(true);
      }, 100);
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  return (
    <>
      <section className="bg-scrut-hero py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-scrut-teal">Company</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{ORGANIZATION_NAME}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            Connect. Secure. Advance. We build <ComplAIBrandLink inheritWeight /> so your team can
            run a security-first GRC program with clarity, speed, and confidence.
          </p>
        </div>
      </section>

      <CompanyPageHub onAbout={goToAbout} onContact={openContact} />

      <section id="about" className="scroll-mt-32 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {values.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-scrut-navy-light p-6 sm:p-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-scrut-gradient">
                  <Icon className="h-5 w-5 text-zinc-100" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-zinc-100">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  <ComplAIText>{body}</ComplAIText>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-32 border-t border-white/10 bg-marketing-surface-alt py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Get in touch
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Interested in <ComplAIBrandLink inheritWeight />, a demo, or GRC advisory from{' '}
            {ORGANIZATION_NAME}? Share your details and we&apos;ll respond promptly.
          </p>
          <div className="mt-8">
            <button
              type="button"
              onClick={openContact}
              className="inline-flex items-center justify-center rounded-full bg-scrut-gradient px-8 py-3.5 text-sm font-semibold text-black shadow-sm transition-opacity hover:opacity-90"
            >
              Open contact form
            </button>
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            <a
              href="https://propelreadysolutions.in"
              className="font-medium text-zinc-100 hover:underline"
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
