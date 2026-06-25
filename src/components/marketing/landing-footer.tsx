import Link from 'next/link';

import { PropelReadyLogo } from '@/components/brand/propel-ready-logo';
import { ORGANIZATION_NAME } from '@/lib/brand';
import { ComplAIStyled } from '@/components/marketing/complai-brand-link';



export function LandingFooter() {

  return (

    <footer className="border-t border-white/10 bg-marketing-surface-alt text-white/70">

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <PropelReadyLogo variant="stacked" showTagline />

            <p className="mt-4 max-w-xs text-sm leading-relaxed">Connect. Secure. Advance.</p>

          </div>



          <div className="grid gap-8 sm:grid-cols-2 sm:gap-12">

            <div>

              <h3 className="text-sm font-semibold text-white">Company</h3>

              <ul className="mt-3 space-y-2 text-sm">

                <li>

                  <Link href="/company" className="hover:text-emerald-400">

                    About & mission

                  </Link>

                </li>

                <li>

                  <Link href="/company?contact=1" className="hover:text-emerald-400">

                    Contact us

                  </Link>

                </li>

                <li>

                  <Link href="/why-complai" className="hover:text-emerald-400">

                    Why ComplAI

                  </Link>

                </li>

              </ul>

            </div>

            <div>

              <h3 className="text-sm font-semibold text-white">Explore</h3>

              <ul className="mt-3 space-y-2 text-sm">

                <li>

                  <Link href="/platform" className="inline-flex items-center gap-1 hover:text-scrut-teal">

                    <ComplAIStyled className="text-sm font-medium" /> platform →

                  </Link>

                </li>

                <li>

                  <Link href="/solutions" className="hover:text-emerald-400">

                    Solutions

                  </Link>

                </li>

                <li>

                  <Link href="/resources" className="hover:text-emerald-400">

                    Resources

                  </Link>

                </li>

              </ul>

            </div>

          </div>

        </div>



        <p className="mt-10 border-t border-white/10 pt-6 text-sm text-white/45">

          © {new Date().getFullYear()} {ORGANIZATION_NAME}. All rights reserved.

        </p>

      </div>

    </footer>

  );

}

