import { getModuleDurationSeconds, getModuleScenes as getBaseScenes } from './security-learning-scenes';
import { enrichScenesWithVisuals } from './security-learning-visuals';

export type { SecurityLearningScene } from './security-learning-scenes';
export type { TrainingInfographic } from './security-learning-visuals';

export type SecurityLearningCategory =
  | 'phishing'
  | 'authentication'
  | 'data-protection'
  | 'remote-work'
  | 'social-engineering'
  | 'incident-response'
  | 'physical-security'
  | 'mobile-devices';

export type SecurityLearningAudience = 'all-staff' | 'engineering' | 'leadership' | 'hr-finance';

export type SecurityLearningModule = {
  id: string;
  title: string;
  description: string;
  category: SecurityLearningCategory;
  audience: SecurityLearningAudience;
  durationMinutes: number;
  learningObjectives: string[];
  relatedControlRefs: string[];
  assignedCount: number;
  completionRate: number;
};

export type SecurityLearningModuleWithScenes = SecurityLearningModule & {
  scenes: ReturnType<typeof enrichScenesWithVisuals>;
};

export const SECURITY_LEARNING_CATEGORY_LABELS: Record<SecurityLearningCategory, string> = {
  phishing: 'Phishing & email',
  authentication: 'Passwords & MFA',
  'data-protection': 'Data protection',
  'remote-work': 'Remote work',
  'social-engineering': 'Social engineering',
  'incident-response': 'Incident reporting',
  'physical-security': 'Physical security',
  'mobile-devices': 'Mobile devices',
};

export const SECURITY_LEARNING_AUDIENCE_LABELS: Record<SecurityLearningAudience, string> = {
  'all-staff': 'All staff',
  engineering: 'Engineering',
  leadership: 'Leadership',
  'hr-finance': 'HR & Finance',
};

export const SECURITY_LEARNING_CATEGORY_STYLES: Record<SecurityLearningCategory, string> = {
  phishing: 'bg-red-100 text-red-800',
  authentication: 'bg-violet-100 text-violet-800',
  'data-protection': 'bg-blue-100 text-blue-800',
  'remote-work': 'bg-teal-100 text-teal-800',
  'social-engineering': 'bg-orange-100 text-orange-800',
  'incident-response': 'bg-amber-100 text-amber-800',
  'physical-security': 'bg-slate-100 text-slate-800',
  'mobile-devices': 'bg-indigo-100 text-indigo-800',
};

export const SECURITY_LEARNING_MODULES: SecurityLearningModule[] = [
  {
    id: 'sl-sample-cyber-basics',
    title: 'Security awareness fundamentals',
    description:
      'Animated explainer covering the four core habits: recognize phishing, use strong passwords, enable MFA, and keep software updated.',
    category: 'authentication',
    audience: 'all-staff',
    durationMinutes: 3,
    learningObjectives: [
      'Recognize and report phishing before clicking links or attachments',
      'Use strong, unique passwords with an approved password manager',
      'Enable MFA and install software updates promptly',
    ],
    relatedControlRefs: ['CC1.4', 'CC2.2', 'A.6.3'],
    assignedCount: 248,
    completionRate: 100,
  },
  {
    id: 'sl-phishing-basics',
    title: 'Recognizing phishing emails',
    description:
      'Narrated walkthrough of real phishing tactics — urgency, spoofed senders, malicious links — and how to verify and report.',
    category: 'phishing',
    audience: 'all-staff',
    durationMinutes: 4,
    learningObjectives: [
      'Identify common phishing red flags in subject lines and body copy',
      'Verify sender identity before clicking links or opening attachments',
      'Report suspected phishing using the company reporting channel',
    ],
    relatedControlRefs: ['CC1.4', 'CC2.2', 'A.6.3'],
    assignedCount: 248,
    completionRate: 91,
  },
  {
    id: 'sl-mfa-passwords',
    title: 'Password hygiene & multi-factor authentication',
    description:
      'Why unique passwords and MFA matter, and how to use your approved password manager and authenticator app.',
    category: 'authentication',
    audience: 'all-staff',
    durationMinutes: 3,
    learningObjectives: [
      'Create and store passwords using the approved password manager',
      'Enroll and use MFA on all workforce and privileged accounts',
      'Never share credentials or approve unexpected MFA prompts',
    ],
    relatedControlRefs: ['CC6.1', 'CC6.5', 'A.5.17'],
    assignedCount: 248,
    completionRate: 88,
  },
  {
    id: 'sl-data-handling',
    title: 'Handling sensitive & personal data',
    description:
      'Classify data correctly, limit sharing, and follow retention rules for customer PII and confidential business data.',
    category: 'data-protection',
    audience: 'all-staff',
    durationMinutes: 5,
    learningObjectives: [
      'Apply data classification labels before sharing files',
      'Use approved tools for storing and transferring sensitive data',
      'Recognize personal data under GDPR, DPDP, and contract obligations',
    ],
    relatedControlRefs: ['CC6.7', 'P4.1', 'A.5.34'],
    assignedCount: 248,
    completionRate: 76,
  },
  {
    id: 'sl-remote-work',
    title: 'Secure remote & hybrid work',
    description:
      'Home network basics, VPN usage, video-call privacy, and keeping company data off personal devices.',
    category: 'remote-work',
    audience: 'all-staff',
    durationMinutes: 4,
    learningObjectives: [
      'Use VPN and company-managed devices for accessing production systems',
      'Prevent shoulder surfing and screen sharing leaks on calls',
      'Secure home Wi‑Fi and avoid public networks for sensitive work',
    ],
    relatedControlRefs: ['CC6.6', 'CC6.7', 'A.6.7'],
    assignedCount: 212,
    completionRate: 82,
  },
  {
    id: 'sl-social-engineering',
    title: 'Social engineering & pretexting',
    description:
      'How attackers manipulate people via phone, chat, and in person — and how to verify requests out-of-band.',
    category: 'social-engineering',
    audience: 'all-staff',
    durationMinutes: 3,
    learningObjectives: [
      'Recognize vishing, smishing, and impersonation attempts',
      'Validate wire-transfer and access requests through a second channel',
      'Escalate suspicious interactions to security promptly',
    ],
    relatedControlRefs: ['CC1.4', 'CC2.2', 'A.6.3'],
    assignedCount: 248,
    completionRate: 79,
  },
  {
    id: 'sl-incident-reporting',
    title: 'Reporting security incidents',
    description:
      'What counts as an incident, how fast to report, and what details help the SOC respond effectively.',
    category: 'incident-response',
    audience: 'all-staff',
    durationMinutes: 2,
    learningObjectives: [
      'Distinguish incidents from routine IT support requests',
      'Use the incident hotline / portal within required timeframes',
      'Preserve evidence and avoid actions that destroy logs',
    ],
    relatedControlRefs: ['CC7.3', 'CC7.4', 'A.5.24'],
    assignedCount: 248,
    completionRate: 94,
  },
  {
    id: 'sl-clean-desk',
    title: 'Clean desk & physical access',
    description:
      'Badge policy, visitor escorts, locking screens, and keeping sensitive papers off shared workspaces.',
    category: 'physical-security',
    audience: 'all-staff',
    durationMinutes: 2,
    learningObjectives: [
      'Follow clean-desk and clear-screen policies',
      'Challenge unescorted visitors and protect badge credentials',
      'Secure printed material and devices when leaving workspaces',
    ],
    relatedControlRefs: ['CC6.4', 'A.7.1', 'A.7.2'],
    assignedCount: 186,
    completionRate: 85,
  },
  {
    id: 'sl-mobile-security',
    title: 'Mobile device & app security',
    description:
      'MDM enrollment, OS updates, app store hygiene, and what not to install on devices that access company email.',
    category: 'mobile-devices',
    audience: 'all-staff',
    durationMinutes: 3,
    learningObjectives: [
      'Keep mobile OS and apps patched on enrolled devices',
      'Install work apps only from approved stores and MDM catalog',
      'Report lost or stolen devices immediately for remote wipe',
    ],
    relatedControlRefs: ['CC6.6', 'CC6.7', 'A.6.7'],
    assignedCount: 198,
    completionRate: 71,
  },
  {
    id: 'sl-secure-coding',
    title: 'Secure development essentials',
    description:
      'OWASP Top 10 overview for engineers: injection, broken auth, secrets in code, and dependency risk.',
    category: 'data-protection',
    audience: 'engineering',
    durationMinutes: 6,
    learningObjectives: [
      'Apply secure SDLC checkpoints before production release',
      'Run SAST/DAST and dependency scans on every merge request',
      'Never commit secrets; use vault and environment injection',
    ],
    relatedControlRefs: ['CC8.1', 'CC8.2', 'A.8.25'],
    assignedCount: 64,
    completionRate: 68,
  },
  {
    id: 'sl-leadership-governance',
    title: 'Security governance for leaders',
    description:
      'Board and executive responsibilities: tone from the top, risk appetite, and accountability for compliance outcomes.',
    category: 'incident-response',
    audience: 'leadership',
    durationMinutes: 5,
    learningObjectives: [
      'Understand executive accountability under SOC 2 and ISO 27001',
      'Review quarterly security metrics and open risk decisions',
      'Champion training completion and policy attestation targets',
    ],
    relatedControlRefs: ['CC1.1', 'CC1.2', 'A.5.1'],
    assignedCount: 18,
    completionRate: 100,
  },
];

export function getSecurityLearningModule(id: string): SecurityLearningModuleWithScenes | undefined {
  const module = SECURITY_LEARNING_MODULES.find((item) => item.id === id);
  if (!module) return undefined;
  return { ...module, scenes: enrichScenesWithVisuals(id, getBaseScenes(id)) };
}

export function getModuleDurationMinutes(moduleId: string): number {
  const seconds = getModuleDurationSeconds(moduleId);
  return Math.max(1, Math.round(seconds / 60));
}

export function getTrainingSceneAudioPath(moduleId: string, sceneId: string): string {
  return `/training-narration/${moduleId}/${sceneId}.wav`;
}

export function getSecurityLearningSummary() {
  const totalModules = SECURITY_LEARNING_MODULES.length;
  const totalMinutes = Math.round(
    SECURITY_LEARNING_MODULES.reduce((sum, m) => sum + getModuleDurationMinutes(m.id), 0)
  );
  const avgCompletion = Math.round(
    SECURITY_LEARNING_MODULES.reduce((sum, m) => sum + m.completionRate, 0) / totalModules
  );
  const learnersAssigned = Math.max(...SECURITY_LEARNING_MODULES.map((m) => m.assignedCount));

  return { totalModules, totalMinutes, avgCompletion, learnersAssigned };
}
