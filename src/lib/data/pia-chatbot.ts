export type PiaChatMessage = {
  id: string;
  role: 'pia' | 'user';
  text: string;
  links?: { label: string; href: string }[];
};

export const PIA_GREETING =
  "Hi, I'm Pia — your Propel Ready Solutions assistant. What would you like to explore today?";

export const PIA_VISITOR_PROMPT =
  'Looking for compliance guidance, ComplAI, or a demo? I can point you in the right direction.';

export const PIA_QUICK_PROMPTS = [
  { id: 'complai', label: 'What is ComplAI?' },
  { id: 'demo', label: 'Book a demo' },
  { id: 'frameworks', label: 'Frameworks & compliance' },
  { id: 'integrations', label: 'Integration help' },
  { id: 'contact', label: 'Talk to our team' },
] as const;

type QuickPromptId = (typeof PIA_QUICK_PROMPTS)[number]['id'];

const QUICK_REPLIES: Record<
  QuickPromptId,
  Omit<PiaChatMessage, 'id' | 'role'>
> = {
  complai: {
    text: 'ComplAI is our AI-powered GRC platform — policies, controls, evidence, risk, vendors, and leadership dashboards in one workspace. Built for SOC 2, ISO 27001, and multi-framework programs.',
    links: [
      { label: 'Explore the platform', href: '/platform' },
      { label: 'Why ComplAI', href: '/why-complai' },
    ],
  },
  demo: {
    text: "I'd love to connect you with our team for a walkthrough. Share your requirements on the contact form and we'll follow up quickly.",
    links: [{ label: 'Book a demo', href: '/company?contact=1' }],
  },
  frameworks: {
    text: 'We support SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, India DPDP, SEBI CSCRF, and more — with pre-mapped controls and reusable evidence across certifications.',
    links: [
      { label: 'View resources', href: '/resources' },
      { label: 'Platform capabilities', href: '/platform#frameworks' },
    ],
  },
  integrations: {
    text: 'ComplAI connects to HRMS, IAM, SIEM, VAPT, and SSO tools. Our Help Center has step-by-step setup guides for 80+ integrations.',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Integrations on platform', href: '/platform#integrations' },
    ],
  },
  contact: {
    text: 'Propel Ready Solutions combines GRC consulting with the ComplAI platform. Tell us about your frameworks, timeline, and team size — we respond within one business day.',
    links: [
      { label: 'Contact us', href: '/company?contact=1' },
      { label: 'About us', href: '/company' },
    ],
  },
};

function matchKeywordReply(input: string): Omit<PiaChatMessage, 'id' | 'role'> | null {
  const q = input.toLowerCase();

  if (/demo|walkthrough|meeting|call|schedule/.test(q)) return QUICK_REPLIES.demo;
  if (/complai|platform|product|grc/.test(q)) return QUICK_REPLIES.complai;
  if (/iso|soc ?2|gdpr|hipaa|pci|framework|audit|compliance|certification/.test(q))
    return QUICK_REPLIES.frameworks;
  if (/integrat|okta|siem|connect|tool|help center|setup/.test(q))
    return QUICK_REPLIES.integrations;
  if (/contact|email|phone|team|propel|support|price|pricing/.test(q))
    return QUICK_REPLIES.contact;
  if (/policy|policies|isms|template/.test(q)) {
    return {
      text: 'ComplAI includes 100+ auditor-ready ISMS templates mapped to Annex A controls — policies, procedures, and export to Word.',
      links: [{ label: 'Platform — Policies', href: '/platform#policies' }],
    };
  }
  if (/risk|vendor|third.?party/.test(q)) {
    return {
      text: 'Manage a living risk register and vendor assessments linked to your controls — visible on leadership dashboards.',
      links: [{ label: 'Solutions', href: '/solutions' }],
    };
  }

  return null;
}

export function getPiaReplyForQuickPrompt(id: QuickPromptId): Omit<PiaChatMessage, 'id' | 'role'> {
  return QUICK_REPLIES[id];
}

export function getPiaReplyForUserMessage(
  input: string
): Omit<PiaChatMessage, 'id' | 'role'> {
  const matched = matchKeywordReply(input);
  if (matched) return matched;

  return {
    text: "I'm best at questions about ComplAI, compliance frameworks, integrations, and getting in touch with our team. Try one of the suggestions below, or visit our contact page.",
    links: [
      { label: 'Contact us', href: '/company?contact=1' },
      { label: 'Help Center', href: '/help' },
    ],
  };
}

export function createPiaMessage(
  role: PiaChatMessage['role'],
  payload: Omit<PiaChatMessage, 'id' | 'role'>
): PiaChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    ...payload,
  };
}
