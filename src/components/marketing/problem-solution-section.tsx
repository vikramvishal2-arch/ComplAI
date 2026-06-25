import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import { ComplAIText } from '@/components/marketing/complai-brand-link';

const pillars = [
  {
    title: 'Get complete visibility into all your risks.',
    description:
      'Don\'t stay limited to surface-level protection that stops at endpoints and IP addresses. Get insights across all cloud infrastructure, applications, people, and third party risks.',
  },
  {
    title: 'Build controls that manage your risks, not just compliance.',
    description:
      'Map controls across all your security initiatives, tie risks to mitigating controls, and cut out redundancy by reusing controls as you scale.',
  },
  {
    title: 'Let your GRC program run (almost) on its own.',
    description:
      'Automate control monitoring, evidence collection, and approval workflows. Connect ComplAI to HRMS, IAM, and SIEM tools and get instant alerts on tasks that need attention.',
  },
  {
    title: 'Make audit day just another Tuesday, with ComplAI.',
    description:
      'Track your compliance status against every framework under the sun. When it\'s audit time, breeze through both internal and external reviews with confidence. No panic, no surprises.',
  },
];

export function ProblemSolutionSection() {
  return (
    <section className="bg-marketing-surface py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-zinc-400">
            Your current GRC program does the bare minimum. But it&apos;s time to aim higher. It
            helps you: close deals, pass audits, stay technically &ldquo;secure&rdquo;. But
            that&apos;s not enough anymore.
          </p>
          <p className="mt-6 text-zinc-400">
            To scale, you need a security program that maps controls to your real, unique risks;
            provides real-time visibility into your security posture; and simplifies audits so they
            don&apos;t derail your business.
          </p>
          <h2 className="mt-10 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Move past surface-level compliance and take control of your security program
          </h2>
          <div className="mt-8">
            <ScrutPrimaryButton href="/company?contact=1">Book a demo</ScrutPrimaryButton>
          </div>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-white/10 bg-scrut-navy-light p-6 sm:p-8">
              <h3 className="text-lg font-bold text-zinc-100">
                <ComplAIText>{pillar.title}</ComplAIText>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                <ComplAIText>{pillar.description}</ComplAIText>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
