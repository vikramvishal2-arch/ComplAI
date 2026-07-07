import type { SecurityLearningScene } from './security-learning-scenes';

export type ScenarioSetting =
  | 'open-office'
  | 'home-desk'
  | 'meeting-room'
  | 'reception'
  | 'dev-floor';

export type ScenarioAction =
  | 'intro-walkthrough'
  | 'phishing-email'
  | 'hover-link-warning'
  | 'verify-phone-call'
  | 'report-to-security'
  | 'password-manager'
  | 'mfa-approve'
  | 'mfa-reject-scam'
  | 'share-file-mistake'
  | 'classify-data'
  | 'vpn-connect'
  | 'screen-share-leak'
  | 'vishing-call'
  | 'tailgating'
  | 'incident-hotline'
  | 'clean-desk'
  | 'lost-phone'
  | 'code-review'
  | 'board-meeting';

export type ScenarioDialogue = {
  speaker: string;
  text: string;
  /** 0–1 when dialogue appears within scene */
  at: number;
};

export type TrainingScenario = {
  setting: ScenarioSetting;
  action: ScenarioAction;
  cast: { name: string; role: string; side: 'left' | 'center' | 'right' }[];
  dialogues: ScenarioDialogue[];
};

const key = (moduleId: string, sceneId: string) => `${moduleId}:${sceneId}`;

const SCENARIOS: Record<string, TrainingScenario> = {
  // Phishing
  [key('sl-phishing-basics', 'intro')]: {
    setting: 'open-office',
    action: 'intro-walkthrough',
    cast: [
      { name: 'Alex', role: 'Finance analyst', side: 'left' },
      { name: 'Jordan', role: 'Security lead', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Most breaches still start with one convincing email.', at: 0.15 },
      { speaker: 'Alex', text: 'It looks exactly like something our CFO would send…', at: 0.45 },
    ],
  },
  [key('sl-phishing-basics', 'red-flags')]: {
    setting: 'open-office',
    action: 'phishing-email',
    cast: [
      { name: 'Alex', role: 'Employee', side: 'left' },
      { name: 'Jordan', role: 'Security lead', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Alex', text: 'Got an urgent payroll email — wants me to verify in an hour.', at: 0.15 },
      { speaker: 'Jordan', text: 'Check the sender. Is the domain spelled correctly?', at: 0.4 },
      { speaker: 'Alex', text: 'It says paypa1-support.com — that is a one, not an L!', at: 0.65 },
    ],
  },
  [key('sl-phishing-basics', 'verify')]: {
    setting: 'open-office',
    action: 'verify-phone-call',
    cast: [
      { name: 'Alex', role: 'Employee', side: 'left' },
      { name: 'Sam', role: 'Real CFO', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Alex', text: 'Hi Sam — did you request a wire transfer by email?', at: 0.2 },
      { speaker: 'Sam', text: 'No. Call IT — that sounds like a phish.', at: 0.55 },
    ],
  },
  [key('sl-phishing-basics', 'report')]: {
    setting: 'open-office',
    action: 'report-to-security',
    cast: [
      { name: 'Alex', role: 'Employee', side: 'left' },
      { name: 'Jordan', role: 'Security', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Alex', text: 'I reported it — one click in Outlook.', at: 0.25 },
      { speaker: 'Jordan', text: 'Perfect. We quarantine the lure for everyone.', at: 0.6 },
    ],
  },
  // MFA
  [key('sl-mfa-passwords', 'intro')]: {
    setting: 'home-desk',
    action: 'intro-walkthrough',
    cast: [
      { name: 'Priya', role: 'Remote engineer', side: 'left' },
      { name: 'Jordan', role: 'Security lead', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Priya', text: 'I reused the same password on three different sites.', at: 0.15 },
      { speaker: 'Jordan', text: 'One breach exposes all of them — let us fix that today.', at: 0.5 },
    ],
  },
  [key('sl-mfa-passwords', 'manager')]: {
    setting: 'open-office',
    action: 'password-manager',
    cast: [
      { name: 'Priya', role: 'Engineer', side: 'left' },
      { name: 'Jordan', role: 'Security lead', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Use the company password vault — unique 20-character passwords.', at: 0.2 },
      { speaker: 'Priya', text: 'It auto-fills everything. Much easier than sticky notes.', at: 0.55 },
    ],
  },
  [key('sl-mfa-passwords', 'mfa')]: {
    setting: 'home-desk',
    action: 'mfa-approve',
    cast: [
      { name: 'Priya', role: 'Engineer', side: 'left' },
      { name: 'Jordan', role: 'Security lead', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Priya', text: 'My phone says approve sign-in from Singapore — I am in London.', at: 0.15 },
      { speaker: 'Jordan', text: 'Deny it immediately. Someone is trying to push past MFA.', at: 0.45 },
      { speaker: 'Priya', text: 'Denied and reported. I did not trigger that login.', at: 0.7 },
    ],
  },
  [key('sl-mfa-passwords', 'close')]: {
    setting: 'open-office',
    action: 'mfa-reject-scam',
    cast: [
      { name: 'Priya', role: 'Engineer', side: 'left' },
      { name: 'Jordan', role: 'Security', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Never approve MFA you did not trigger yourself.', at: 0.2 },
      { speaker: 'Priya', text: 'Understood — if I did not log in, I deny and call you.', at: 0.55 },
    ],
  },
  // Data handling
  [key('sl-data-handling', 'classify')]: {
    setting: 'meeting-room',
    action: 'classify-data',
    cast: [
      { name: 'Maria', role: 'HR manager', side: 'left' },
      { name: 'Alex', role: 'Analyst', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Maria', text: 'This salary file has customer PII — label it Restricted first.', at: 0.2 },
      { speaker: 'Alex', text: 'Right. I will not share it until the label is applied.', at: 0.55 },
    ],
  },
  [key('sl-data-handling', 'pii')]: {
    setting: 'open-office',
    action: 'share-file-mistake',
    cast: [
      { name: 'Alex', role: 'Analyst', side: 'left' },
      { name: 'Jordan', role: 'Security', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Alex', text: 'I almost sent personal data through my personal Gmail.', at: 0.2 },
      { speaker: 'Jordan', text: 'Personal data needs legal basis and approved tools only.', at: 0.55 },
    ],
  },
  [key('sl-data-handling', 'tools')]: {
    setting: 'open-office',
    action: 'classify-data',
    cast: [
      { name: 'Maria', role: 'Compliance', side: 'left' },
      { name: 'Alex', role: 'Analyst', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Maria', text: 'Use the approved drive — DLP blocks everything else.', at: 0.2 },
      { speaker: 'Alex', text: 'Got it. No USB sticks or personal cloud storage.', at: 0.55 },
    ],
  },
  [key('sl-data-handling', 'incident')]: {
    setting: 'open-office',
    action: 'report-to-security',
    cast: [
      { name: 'Alex', role: 'Analyst', side: 'left' },
      { name: 'Jordan', role: 'Security', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Alex', text: 'I emailed the wrong attachment — reporting now.', at: 0.2 },
      { speaker: 'Jordan', text: 'Good — we have one hour to assess exposure.', at: 0.55 },
    ],
  },
  // Remote work
  [key('sl-remote-work', 'intro')]: {
    setting: 'home-desk',
    action: 'intro-walkthrough',
    cast: [
      { name: 'Dev', role: 'Remote PM', side: 'left' },
      { name: 'Jordan', role: 'Security lead', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Your home network is now part of the company perimeter.', at: 0.2 },
      { speaker: 'Dev', text: 'So the same rules apply — even from my kitchen table.', at: 0.55 },
    ],
  },
  [key('sl-remote-work', 'vpn')]: {
    setting: 'home-desk',
    action: 'vpn-connect',
    cast: [
      { name: 'Dev', role: 'Remote PM', side: 'left' },
      { name: 'Jordan', role: 'IT security', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Connect VPN before opening any internal dashboards.', at: 0.2 },
      { speaker: 'Dev', text: 'VPN first, then email. Every single time.', at: 0.55 },
    ],
  },
  [key('sl-remote-work', 'calls')]: {
    setting: 'home-desk',
    action: 'screen-share-leak',
    cast: [
      { name: 'Dev', role: 'Remote PM', side: 'left' },
      { name: 'Maria', role: 'Colleague', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Maria', text: 'Wait — your customer list is visible on the second monitor.', at: 0.2 },
      { speaker: 'Dev', text: 'Good catch. Blurring background and closing that window now.', at: 0.55 },
    ],
  },
  [key('sl-remote-work', 'close')]: {
    setting: 'reception',
    action: 'intro-walkthrough',
    cast: [
      { name: 'Dev', role: 'Traveling staff', side: 'left' },
      { name: 'Jordan', role: 'Security', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Use your phone hotspot — not café Wi‑Fi — for customer data.', at: 0.2 },
      { speaker: 'Dev', text: 'Hotspot only when I travel. No public networks.', at: 0.55 },
    ],
  },
  // Social engineering
  [key('sl-social-engineering', 'intro')]: {
    setting: 'open-office',
    action: 'vishing-call',
    cast: [
      { name: 'Caller', role: 'Unknown voice', side: 'left' },
      { name: 'Alex', role: 'Accounts payable', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Caller', text: "I'm the CEO — wire $50k now, no questions.", at: 0.15 },
      { speaker: 'Alex', text: 'That does not sound right. I need to verify before any transfer.', at: 0.5 },
    ],
  },
  [key('sl-social-engineering', 'channels')]: {
    setting: 'open-office',
    action: 'vishing-call',
    cast: [
      { name: 'Alex', role: 'AP clerk', side: 'left' },
      { name: 'Jordan', role: 'Security', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Smishing, vishing, fake badges — same social-engineering playbook.', at: 0.2 },
      { speaker: 'Alex', text: 'They all rush you so you skip verification.', at: 0.55 },
    ],
  },
  [key('sl-social-engineering', 'verify')]: {
    setting: 'open-office',
    action: 'verify-phone-call',
    cast: [
      { name: 'Alex', role: 'AP clerk', side: 'left' },
      { name: 'Sam', role: 'CFO', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Alex', text: 'Sam, did you request an urgent wire transfer by email?', at: 0.2 },
      { speaker: 'Sam', text: 'No. Call IT — that sounds like a phish.', at: 0.55 },
    ],
  },
  [key('sl-social-engineering', 'close')]: {
    setting: 'meeting-room',
    action: 'intro-walkthrough',
    cast: [
      { name: 'Jordan', role: 'Security', side: 'left' },
      { name: 'Alex', role: 'Staff', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Pausing to verify is always the right move.', at: 0.2 },
      { speaker: 'Alex', text: 'Better a two-minute call than a $50k mistake.', at: 0.55 },
    ],
  },
  // Incident
  [key('sl-incident-reporting', 'what')]: {
    setting: 'dev-floor',
    action: 'intro-walkthrough',
    cast: [
      { name: 'Priya', role: 'Engineer', side: 'left' },
      { name: 'Jordan', role: 'SOC lead', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Priya', text: 'Ransomware banner on my laptop — is that an incident?', at: 0.2 },
      { speaker: 'Jordan', text: 'Yes. Call the hotline now — not a regular IT ticket.', at: 0.55 },
    ],
  },
  [key('sl-incident-reporting', 'when')]: {
    setting: 'open-office',
    action: 'incident-hotline',
    cast: [
      { name: 'Alex', role: 'Employee', side: 'left' },
      { name: 'Jordan', role: 'SOC', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Alex', text: 'I think someone is actively in our systems.', at: 0.2 },
      { speaker: 'Jordan', text: 'Active attack means call security now — not tomorrow.', at: 0.55 },
    ],
  },
  [key('sl-incident-reporting', 'how')]: {
    setting: 'open-office',
    action: 'incident-hotline',
    cast: [
      { name: 'Alex', role: 'Employee', side: 'left' },
      { name: 'Jordan', role: 'SOC', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Tell me what happened, when, and which systems — keep the machine on.', at: 0.2 },
      { speaker: 'Alex', text: 'Suspicious login at 9:14 on the finance share. Laptop still running.', at: 0.55 },
    ],
  },
  [key('sl-incident-reporting', 'dont')]: {
    setting: 'dev-floor',
    action: 'intro-walkthrough',
    cast: [
      { name: 'Priya', role: 'Engineer', side: 'left' },
      { name: 'Jordan', role: 'SOC', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Do not wipe logs or reimage — IR needs the evidence.', at: 0.2 },
      { speaker: 'Priya', text: 'Understood. I will leave everything exactly as it is.', at: 0.55 },
    ],
  },
  // Clean desk
  [key('sl-clean-desk', 'intro')]: {
    setting: 'open-office',
    action: 'clean-desk',
    cast: [
      { name: 'Alex', role: 'Employee', side: 'left' },
      { name: 'Jordan', role: 'Security', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Printed customer lists go in a locked drawer — not on the desk.', at: 0.2 },
      { speaker: 'Alex', text: 'I will shred anything I am done with before I leave.', at: 0.55 },
    ],
  },
  [key('sl-clean-desk', 'desk')]: {
    setting: 'open-office',
    action: 'clean-desk',
    cast: [
      { name: 'Alex', role: 'Employee', side: 'left' },
      { name: 'Maria', role: 'Colleague', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Maria', text: 'Heading to lunch — did you lock your screen?', at: 0.2 },
      { speaker: 'Alex', text: 'Whiteboard erased, papers shredded, Win+L done.', at: 0.55 },
    ],
  },
  [key('sl-clean-desk', 'access')]: {
    setting: 'reception',
    action: 'tailgating',
    cast: [
      { name: 'Visitor', role: 'Unbadged guest', side: 'left' },
      { name: 'Alex', role: 'Employee', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Visitor', text: 'Can you hold the door? I forgot my badge upstairs.', at: 0.15 },
      { speaker: 'Alex', text: 'Do you have an escort? Let me get reception first.', at: 0.5 },
    ],
  },
  [key('sl-clean-desk', 'close')]: {
    setting: 'open-office',
    action: 'clean-desk',
    cast: [
      { name: 'Alex', role: 'Employee', side: 'left' },
      { name: 'Jordan', role: 'Security', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Win+L before coffee — every single time.', at: 0.2 },
      { speaker: 'Alex', text: 'Screen locked. See you in five.', at: 0.55 },
    ],
  },
  // Mobile
  [key('sl-mobile-security', 'intro')]: {
    setting: 'open-office',
    action: 'lost-phone',
    cast: [
      { name: 'Maria', role: 'Sales rep', side: 'left' },
      { name: 'Jordan', role: 'IT', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Maria', text: 'My phone has email, MFA, and customer chats on it.', at: 0.2 },
      { speaker: 'Jordan', text: 'That is why we enforce encryption and remote wipe.', at: 0.55 },
    ],
  },
  [key('sl-mobile-security', 'mdm')]: {
    setting: 'open-office',
    action: 'intro-walkthrough',
    cast: [
      { name: 'Jordan', role: 'IT', side: 'left' },
      { name: 'Maria', role: 'Sales', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'MDM enforces encryption, passcodes, and remote wipe.', at: 0.2 },
      { speaker: 'Maria', text: 'So if I lose the device, you can lock it down fast.', at: 0.55 },
    ],
  },
  [key('sl-mobile-security', 'apps')]: {
    setting: 'open-office',
    action: 'intro-walkthrough',
    cast: [
      { name: 'Maria', role: 'Sales', side: 'left' },
      { name: 'Jordan', role: 'IT', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Work apps come from the company catalog only.', at: 0.2 },
      { speaker: 'Maria', text: 'No random apps from the store for customer data.', at: 0.55 },
    ],
  },
  [key('sl-mobile-security', 'lost')]: {
    setting: 'reception',
    action: 'lost-phone',
    cast: [
      { name: 'Maria', role: 'Sales', side: 'left' },
      { name: 'Jordan', role: 'IT', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Maria', text: 'Lost my phone in the taxi — need a wipe now.', at: 0.2 },
      { speaker: 'Jordan', text: 'Wipe initiated — sessions rotated in five minutes.', at: 0.55 },
    ],
  },
  // Secure coding
  [key('sl-secure-coding', 'intro')]: {
    setting: 'dev-floor',
    action: 'code-review',
    cast: [
      { name: 'Priya', role: 'Developer', side: 'left' },
      { name: 'Jordan', role: 'Security', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'SQL concatenation in prod — that is our breach path.', at: 0.2 },
      { speaker: 'Priya', text: 'Switching to parameterized queries before merge.', at: 0.55 },
    ],
  },
  [key('sl-secure-coding', 'secrets')]: {
    setting: 'dev-floor',
    action: 'code-review',
    cast: [
      { name: 'Priya', role: 'Developer', side: 'left' },
      { name: 'Jordan', role: 'Security', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'API key in git history — vault injection only from now on.', at: 0.2 },
      { speaker: 'Priya', text: 'Rotating the key and scrubbing the commit today.', at: 0.55 },
    ],
  },
  [key('sl-secure-coding', 'scan')]: {
    setting: 'dev-floor',
    action: 'code-review',
    cast: [
      { name: 'Priya', role: 'Developer', side: 'left' },
      { name: 'Jordan', role: 'Security', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'SAST failed on this PR — fix before merge.', at: 0.2 },
      { speaker: 'Priya', text: 'On it. No deploy until the scan is clean.', at: 0.55 },
    ],
  },
  [key('sl-secure-coding', 'deploy')]: {
    setting: 'dev-floor',
    action: 'code-review',
    cast: [
      { name: 'Priya', role: 'Developer', side: 'left' },
      { name: 'Jordan', role: 'Security', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Canary deploy with authZ on every endpoint.', at: 0.2 },
      { speaker: 'Priya', text: 'Rolling out to 5% first, then full release.', at: 0.55 },
    ],
  },
  // Leadership
  [key('sl-leadership-governance', 'intro')]: {
    setting: 'meeting-room',
    action: 'board-meeting',
    cast: [
      { name: 'Sam', role: 'CEO', side: 'left' },
      { name: 'Jordan', role: 'CISO', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Sam', text: 'Security is a board topic — not just an IT line item.', at: 0.2 },
      { speaker: 'Jordan', text: 'Exactly. Risk appetite starts with leadership.', at: 0.55 },
    ],
  },
  [key('sl-leadership-governance', 'metrics')]: {
    setting: 'meeting-room',
    action: 'board-meeting',
    cast: [
      { name: 'Sam', role: 'CEO', side: 'left' },
      { name: 'Jordan', role: 'CISO', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'Readiness at 78% — four critical findings still open.', at: 0.2 },
      { speaker: 'Sam', text: 'What resources do you need to close them this quarter?', at: 0.55 },
    ],
  },
  [key('sl-leadership-governance', 'incidents')]: {
    setting: 'meeting-room',
    action: 'board-meeting',
    cast: [
      { name: 'Sam', role: 'CEO', side: 'left' },
      { name: 'Jordan', role: 'CISO', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: 'We have a severity-one incident — bridge is live.', at: 0.2 },
      { speaker: 'Sam', text: 'I am joining within fifteen minutes.', at: 0.55 },
    ],
  },
  [key('sl-leadership-governance', 'close')]: {
    setting: 'open-office',
    action: 'intro-walkthrough',
    cast: [
      { name: 'Sam', role: 'CEO', side: 'left' },
      { name: 'Alex', role: 'Staff', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Sam', text: 'I finished my awareness training — leaders go first.', at: 0.2 },
      { speaker: 'Alex', text: 'That sets the tone for the whole company.', at: 0.55 },
    ],
  },
};

function fallbackScenario(scene: SecurityLearningScene): TrainingScenario {
  return {
    setting: 'open-office',
    action: 'intro-walkthrough',
    cast: [
      { name: 'Alex', role: 'Employee', side: 'left' },
      { name: 'Jordan', role: 'Security lead', side: 'right' },
    ],
    dialogues: [
      { speaker: 'Jordan', text: scene.title, at: 0.2 },
      { speaker: 'Alex', text: 'Got it — I will apply that on the job.', at: 0.55 },
    ],
  };
}

export function getTrainingScenario(
  moduleId: string,
  scene: SecurityLearningScene
): TrainingScenario {
  return SCENARIOS[key(moduleId, scene.id)] ?? fallbackScenario(scene);
}

export function enrichScenesWithScenarios(
  moduleId: string,
  scenes: SecurityLearningScene[]
) {
  return scenes.map((scene) => ({
    ...scene,
    scenario: getTrainingScenario(moduleId, scene),
  }));
}
