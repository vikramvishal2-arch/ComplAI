import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';

export function CtaSection() {
  return (
    <section className="bg-[#f4f7fb] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-scrut-navy px-6 py-14 text-center sm:px-12 sm:py-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to see what security-first GRC really looks like?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            The {PRODUCT_NAME} Platform helps you move fast, stay compliant, and build securely from
            the start — from {ORGANIZATION_NAME}.
          </p>
          <div className="mt-8">
            <ScrutPrimaryButton href="/company?contact=1">Book a demo</ScrutPrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}
