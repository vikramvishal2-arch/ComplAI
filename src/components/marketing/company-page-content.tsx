'use client';

import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, MapPin, Phone, Target } from 'lucide-react';
import { CompanyPageHub } from '@/components/marketing/company-page-hub';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  ORGANIZATION_NAME,
  PRODUCT_TAGLINE,
} from '@/lib/brand';
import { ComplAIBrandLink, ComplAIText } from '@/components/marketing/complai-brand-link';
import { ContactForm } from '@/components/marketing/contact-form';

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

  const goToContact = useCallback(() => {
    scrollToSection('contact');
  }, []);

  const goToAbout = useCallback(() => {
    scrollToSection('about');
  }, []);

  useEffect(() => {
    const contact = searchParams.get('contact');
    if (contact === '1' || contact === 'true') {
      goToContact();
    }
  }, [searchParams, goToContact]);

  useEffect(() => {
    if (openContactOnMount) {
      goToContact();
    }
  }, [openContactOnMount, goToContact]);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const id = hash.slice(1);
      window.setTimeout(() => {
        scrollToSection(id);
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

      <CompanyPageHub onAbout={goToAbout} onContact={goToContact} />

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

      <section
        id="contact"
        className="scroll-mt-32 border-t border-white/10 bg-marketing-surface-alt py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
            <div className="text-left">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
                Get in touch
              </h2>
              <p className="mt-4 max-w-xl text-zinc-400">
                Interested in <ComplAIBrandLink inheritWeight />, a demo, or GRC advisory from{' '}
                {ORGANIZATION_NAME}? Reach us directly or share your details using the form.
              </p>

              <div className="mt-8 space-y-3">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-scrut-navy-light/70 p-4 transition-colors hover:border-scrut-teal/30 hover:bg-scrut-navy-light"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-scrut-teal/15 text-scrut-teal">
                    <Mail className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
                      Email
                    </p>
                    <p className="mt-1 break-all text-base font-semibold text-zinc-100 hover:text-scrut-teal">
                      {CONTACT_EMAIL}
                    </p>
                  </div>
                </a>

                <a
                  href={`tel:${CONTACT_PHONE_TEL}`}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-scrut-navy-light/70 p-4 transition-colors hover:border-scrut-teal/30 hover:bg-scrut-navy-light"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-scrut-teal/15 text-scrut-teal">
                    <Phone className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
                      Handheld
                    </p>
                    <p className="mt-1 text-base font-semibold text-zinc-100 hover:text-scrut-teal">
                      {CONTACT_PHONE_DISPLAY}
                    </p>
                  </div>
                </a>
              </div>

              <p className="mt-6 text-sm text-zinc-500">
                <a
                  href="https://propelreadysolutions.in"
                  className="font-medium text-zinc-300 hover:text-scrut-teal hover:underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  propelreadysolutions.in
                </a>
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-lg font-semibold text-black">Send us a message</h3>
              <p className="mt-1 text-sm text-slate-600">
                Fill in the form and our team will respond promptly.
              </p>
              <div className="mt-6">
                <ContactForm idPrefix="contact-page" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
