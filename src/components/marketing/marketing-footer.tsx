import Link from 'next/link';
import {
  COMPLAI_ICON,
  INTEGRATION_HELP_BASE_URL,
  ORGANIZATION_NAME,
} from '@/lib/brand';
import { ComplAIBrandLink, ComplAIStyled } from '@/components/marketing/complai-brand-link';
import { FRAMEWORK_GUIDES, MARKETING_SOLUTIONS } from '@/lib/data/marketing-resources';
import { PLATFORM_CAPABILITIES } from '@/lib/data/marketing-platform';

const platformLinks = PLATFORM_CAPABILITIES.map((cap) => ({
  label: cap.title,
  href: `/platform#${cap.id}`,
}));

const solutionLinks = MARKETING_SOLUTIONS.slice(0, 5).map((s) => ({
  label: s.title,
  href: `/solutions#${s.id}`,
}));

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-marketing-surface-alt text-white/70">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/platform" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={COMPLAI_ICON} alt="" aria-hidden className="h-9 w-9 shrink-0" />
              <div>
                <ComplAIStyled />
                <p className="text-xs text-white/50">{ORGANIZATION_NAME}</p>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed">Connect. Secure. Advance.</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Platform</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/platform" className="hover:text-scrut-teal">
                  Platform overview
                </Link>
              </li>
              {platformLinks.slice(0, 6).map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-scrut-teal">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/platform#capabilities" className="font-medium text-scrut-teal hover:underline">
                  All capabilities
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Solutions</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {solutionLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-scrut-teal">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/solutions" className="font-medium text-scrut-teal hover:underline">
                  All solutions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Resources</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/resources#faqs" className="hover:text-scrut-teal">
                  FAQs
                </Link>
              </li>
              {FRAMEWORK_GUIDES.slice(0, 5).map((guide) => (
                <li key={guide.slug}>
                  <Link href={`/resources/${guide.slug}`} className="hover:text-scrut-teal">
                    {guide.shortName} guide
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/resources#frameworks" className="font-medium text-scrut-teal hover:underline">
                  All guides
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/why-complai" className="hover:text-scrut-teal">
                  Why <ComplAIStyled className="font-medium" />
                </Link>
              </li>
              <li>
                <Link href="/company" className="hover:text-scrut-teal">
                  About & mission
                </Link>
              </li>
              <li>
                <Link href="/company?contact=1" className="hover:text-scrut-teal">
                  Contact us
                </Link>
              </li>
              <li>
                <a
                  href="https://propelreadysolutions.in"
                  className="hover:text-scrut-teal"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  propelreadysolutions.in
                </a>
              </li>
              <li>
                <a
                  href={INTEGRATION_HELP_BASE_URL}
                  className="hover:text-scrut-teal"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Integration help centre
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {ORGANIZATION_NAME}. All rights reserved.</p>
          <p>
            <ComplAIBrandLink /> — GRC Compliance Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
