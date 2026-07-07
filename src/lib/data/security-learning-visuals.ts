import type { SecurityLearningScene } from './security-learning-scenes';

export type StatItem = {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  tone?: 'danger' | 'warning' | 'success' | 'info';
};

export type FlowStep = {
  label: string;
  sublabel?: string;
};

export type TrainingVisualIcon =
  | 'user'
  | 'id-card'
  | 'credit-card'
  | 'globe'
  | 'home'
  | 'users'
  | 'camera'
  | 'map-pin'
  | 'wifi'
  | 'shield'
  | 'lock'
  | 'eye'
  | 'phone'
  | 'message-square'
  | 'door-open'
  | 'mic'
  | 'bug'
  | 'smartphone'
  | 'unlock'
  | 'upload'
  | 'archive'
  | 'trash-2'
  | 'eraser'
  | 'folder'
  | 'flag'
  | 'rocket'
  | 'key'
  | 'bar-chart'
  | 'check';

export type IconItem = {
  label: string;
  icon: TrainingVisualIcon;
};

export type TimelineItem = {
  time: string;
  label: string;
  tone?: 'danger' | 'warning' | 'success';
};

export type TrainingInfographic =
  | { type: 'stats'; title: string; items: StatItem[] }
  | { type: 'flow'; title: string; steps: FlowStep[] }
  | { type: 'compare'; title: string; do: string[]; dont: string[] }
  | { type: 'icons'; title: string; items: IconItem[] }
  | { type: 'funnel'; title: string; stages: { label: string; width: number }[] }
  | { type: 'timeline'; title: string; items: TimelineItem[] }
  | { type: 'email-alert'; title: string; flags: string[] }
  | { type: 'layers'; title: string; layers: { label: string; level: string }[] };

const TONE_COLORS = {
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
  info: 'bg-blue-500',
};

export { TONE_COLORS };

function key(moduleId: string, sceneId: string) {
  return `${moduleId}:${sceneId}`;
}

const VISUALS: Record<string, TrainingInfographic> = {
  // Fundamentals
  [key('sl-sample-cyber-basics', 'intro')]: {
    type: 'flow',
    title: 'Secure Our World',
    steps: [
      { label: 'Phishing', sublabel: 'Recognize & report' },
      { label: 'Passwords', sublabel: 'Strong & unique' },
      { label: 'MFA', sublabel: 'Extra layer' },
      { label: 'Updates', sublabel: 'Stay patched' },
    ],
  },
  [key('sl-sample-cyber-basics', 'phishing')]: {
    type: 'email-alert',
    title: 'Spot the phish',
    flags: ['Urgent tone', 'Strange sender', 'Unexpected link', 'Report & delete'],
  },
  [key('sl-sample-cyber-basics', 'passwords-mfa')]: {
    type: 'layers',
    title: 'Account protection',
    layers: [
      { label: '16+ char passwords', level: 'Unique per account' },
      { label: 'Password manager', level: 'Encrypted vault' },
      { label: 'Multifactor auth', level: 'Blocks stolen passwords' },
    ],
  },
  [key('sl-sample-cyber-basics', 'updates')]: {
    type: 'timeline',
    title: 'Update rhythm',
    items: [
      { time: 'Alert', label: 'Update notification appears', tone: 'warning' },
      { time: 'Act', label: 'Install within 24 hours', tone: 'warning' },
      { time: 'Auto', label: 'Enable automatic updates', tone: 'success' },
    ],
  },
  // Phishing
  [key('sl-phishing-basics', 'intro')]: {
    type: 'stats',
    title: 'Phishing impact',
    items: [
      { label: 'Breaches start with email', value: 91, unit: '%', tone: 'danger' },
      { label: 'Avg. time to click', value: 60, unit: 'sec', tone: 'warning' },
      { label: 'Reports stop spread', value: 3, unit: '× faster', tone: 'success' },
    ],
  },
  [key('sl-phishing-basics', 'red-flags')]: {
    type: 'email-alert',
    title: 'Anatomy of a phish',
    flags: ['Urgent subject line', 'Mismatched sender domain', 'Hover link ≠ display text', 'Unexpected attachment'],
  },
  [key('sl-phishing-basics', 'verify')]: {
    type: 'flow',
    title: 'Out-of-band verification',
    steps: [
      { label: 'Suspicious request', sublabel: 'Email / chat' },
      { label: 'Stop & pause', sublabel: 'Do not click' },
      { label: 'Call known number', sublabel: 'Directory only' },
      { label: 'Confirm or report', sublabel: 'Security wins' },
    ],
  },
  [key('sl-phishing-basics', 'report')]: {
    type: 'funnel',
    title: 'Report → protect everyone',
    stages: [
      { label: 'You report', width: 100 },
      { label: 'Filter learns', width: 72 },
      { label: 'Org protected', width: 48 },
    ],
  },
  // MFA
  [key('sl-mfa-passwords', 'intro')]: {
    type: 'stats',
    title: 'Password risk',
    items: [
      { label: 'Reused passwords', value: 65, unit: '% users', tone: 'danger' },
      { label: 'Credential leaks / day', value: 24, unit: 'M+', tone: 'warning' },
      { label: 'MFA blocks bots', value: 99, unit: '%', tone: 'success' },
    ],
  },
  [key('sl-mfa-passwords', 'manager')]: {
    type: 'layers',
    title: 'Password manager stack',
    layers: [
      { label: 'Unique 16+ char passwords', level: 'Every app' },
      { label: 'Encrypted vault', level: 'At rest' },
      { label: 'Team shared secrets', level: 'Audited access' },
    ],
  },
  [key('sl-mfa-passwords', 'mfa')]: {
    type: 'flow',
    title: 'MFA login flow',
    steps: [
      { label: 'Password', sublabel: 'Something you know' },
      { label: 'Push / TOTP', sublabel: 'Something you have' },
      { label: 'Access granted', sublabel: 'Both required' },
    ],
  },
  [key('sl-mfa-passwords', 'close')]: {
    type: 'compare',
    title: 'Daily credential habits',
    do: ['Lock screen (Win+L)', 'Use password manager', 'Reject unknown MFA'],
    dont: ['Share passwords in chat', 'Approve random pushes', 'Save prod creds in browser'],
  },
  // Data handling
  [key('sl-data-handling', 'classify')]: {
    type: 'layers',
    title: 'Data classification',
    layers: [
      { label: 'Restricted', level: 'Regulated PII' },
      { label: 'Confidential', level: 'Internal business' },
      { label: 'Internal', level: 'Employees only' },
      { label: 'Public', level: 'Marketing OK' },
    ],
  },
  [key('sl-data-handling', 'pii')]: {
    type: 'icons',
    title: 'Regulated data types',
    items: [
      { icon: 'user', label: 'Customer PII' },
      { icon: 'id-card', label: 'Employee records' },
      { icon: 'credit-card', label: 'Payment data' },
      { icon: 'globe', label: 'Cross-border rules' },
    ],
  },
  [key('sl-data-handling', 'tools')]: {
    type: 'compare',
    title: 'Approved vs. risky sharing',
    do: ['Company SharePoint / Drive', 'Encrypted transfer portal', 'Ticket attachments'],
    dont: ['Personal Gmail', 'WhatsApp / Telegram', 'USB on untrusted PCs'],
  },
  [key('sl-data-handling', 'incident')]: {
    type: 'timeline',
    title: 'Data spill response',
    items: [
      { time: '0 min', label: 'Notice mis-send / loss', tone: 'danger' },
      { time: '≤60 min', label: 'Report to security', tone: 'warning' },
      { time: '2 hrs', label: 'Containment assessment', tone: 'warning' },
      { time: '24 hrs', label: 'Customer notification decision', tone: 'success' },
    ],
  },
  // Remote work
  [key('sl-remote-work', 'intro')]: {
    type: 'icons',
    title: 'Expanded attack surface',
    items: [
      { icon: 'home', label: 'Home Wi‑Fi' },
      { icon: 'users', label: 'Shared devices' },
      { icon: 'camera', label: 'Webcam risk' },
      { icon: 'map-pin', label: 'Public spaces' },
    ],
  },
  [key('sl-remote-work', 'vpn')]: {
    type: 'flow',
    title: 'Secure access path',
    steps: [
      { label: 'MDM laptop', sublabel: 'Encrypted disk' },
      { label: 'Company VPN', sublabel: 'Tunnel' },
      { label: 'Internal apps', sublabel: 'Prod access' },
    ],
  },
  [key('sl-remote-work', 'calls')]: {
    type: 'compare',
    title: 'Video call hygiene',
    do: ['Blur background', 'Mute when idle', 'Check screen before share'],
    dont: ['Show dashboards to guests', 'Open links in chat blindly', 'Record without consent'],
  },
  [key('sl-remote-work', 'close')]: {
    type: 'icons',
    title: 'Travel & co-working',
    items: [
      { icon: 'wifi', label: 'Hotspot > café Wi‑Fi' },
      { icon: 'shield', label: 'Privacy filter' },
      { icon: 'lock', label: 'Hotel safe' },
      { icon: 'eye', label: 'Shoulder surf aware' },
    ],
  },
  // Social engineering
  [key('sl-social-engineering', 'intro')]: {
    type: 'funnel',
    title: 'Trust exploitation',
    stages: [
      { label: 'Research target', width: 100 },
      { label: 'Build false trust', width: 78 },
      { label: 'Bypass controls', width: 52 },
    ],
  },
  [key('sl-social-engineering', 'channels')]: {
    type: 'icons',
    title: 'Attack channels',
    items: [
      { icon: 'phone', label: 'Vishing (voice)' },
      { icon: 'message-square', label: 'Smishing (SMS)' },
      { icon: 'door-open', label: 'Tailgating' },
      { icon: 'mic', label: 'Deepfake voice' },
    ],
  },
  [key('sl-social-engineering', 'verify')]: {
    type: 'flow',
    title: 'Wire-transfer verification',
    steps: [
      { label: 'Urgent payment request', sublabel: 'Email or chat' },
      { label: 'Call finance lead', sublabel: 'Known number' },
      { label: 'Dual approval', sublabel: 'Policy gate' },
    ],
  },
  [key('sl-social-engineering', 'close')]: {
    type: 'stats',
    title: 'Safe refusal culture',
    items: [
      { label: 'Verified before pay', value: 100, unit: '% policy', tone: 'success' },
      { label: 'Reports rewarded', value: 0, unit: 'penalty', tone: 'info' },
      { label: 'Avg. verify time', value: 2, unit: 'min', tone: 'warning' },
    ],
  },
  // Incident reporting
  [key('sl-incident-reporting', 'what')]: {
    type: 'icons',
    title: 'Incident types',
    items: [
      { icon: 'bug', label: 'Malware' },
      { icon: 'smartphone', label: 'Lost device' },
      { icon: 'unlock', label: 'Unauthorized access' },
      { icon: 'upload', label: 'Data exposure' },
    ],
  },
  [key('sl-incident-reporting', 'when')]: {
    type: 'timeline',
    title: 'Reporting SLAs',
    items: [
      { time: 'Now', label: 'Active ransomware / attack', tone: 'danger' },
      { time: '≤1 hr', label: 'Suspected data spill', tone: 'warning' },
      { time: 'Same day', label: 'Policy violation', tone: 'success' },
    ],
  },
  [key('sl-incident-reporting', 'how')]: {
    type: 'flow',
    title: 'What to include',
    steps: [
      { label: 'What happened', sublabel: 'Symptoms' },
      { label: 'When & who', sublabel: 'Timeline' },
      { label: 'Systems affected', sublabel: 'Scope' },
      { label: 'Actions taken', sublabel: 'Containment' },
    ],
  },
  [key('sl-incident-reporting', 'dont')]: {
    type: 'compare',
    title: 'Preserve evidence',
    do: ['Screenshot alerts', 'Note exact times', 'Follow IR guidance'],
    dont: ['Power off servers', 'Delete suspicious mail', 'Discuss on public Slack'],
  },
  // Clean desk
  [key('sl-clean-desk', 'intro')]: {
    type: 'stats',
    title: 'Physical audit findings',
    items: [
      { label: 'Unlocked screens', value: 34, unit: '% tours', tone: 'danger' },
      { label: 'Visible documents', value: 28, unit: '% desks', tone: 'warning' },
      { label: 'Clean desk pass', value: 92, unit: '% target', tone: 'success' },
    ],
  },
  [key('sl-clean-desk', 'desk')]: {
    type: 'icons',
    title: 'Desk checklist',
    items: [
      { icon: 'lock', label: 'Lock drawers' },
      { icon: 'trash-2', label: 'Cross-cut shred' },
      { icon: 'eraser', label: 'Erase whiteboards' },
      { icon: 'folder', label: 'File papers' },
    ],
  },
  [key('sl-clean-desk', 'access')]: {
    type: 'flow',
    title: 'Visitor protocol',
    steps: [
      { label: 'Badge visible', sublabel: 'Always' },
      { label: 'Escort visitor', sublabel: 'No exceptions' },
      { label: 'Challenge unknown', sublabel: 'Notify security' },
    ],
  },
  [key('sl-clean-desk', 'close')]: {
    type: 'timeline',
    title: 'Leaving checklist',
    items: [
      { time: '1', label: 'Win+L lock', tone: 'success' },
      { time: '2', label: 'Dock laptop', tone: 'success' },
      { time: '3', label: 'Hide badge', tone: 'warning' },
      { time: '4', label: 'Clear desk', tone: 'success' },
    ],
  },
  // Mobile
  [key('sl-mobile-security', 'intro')]: {
    type: 'stats',
    title: 'Mobile threat stats',
    items: [
      { label: 'Phones hold MFA', value: 78, unit: '% orgs', tone: 'warning' },
      { label: 'Lost devices / yr', value: 12, unit: '% staff', tone: 'danger' },
      { label: 'MDM wipe success', value: 99, unit: '%', tone: 'success' },
    ],
  },
  [key('sl-mobile-security', 'mdm')]: {
    type: 'layers',
    title: 'MDM protections',
    layers: [
      { label: 'Full-disk encryption', level: 'Enforced' },
      { label: 'Patch compliance', level: '14-day SLA' },
      { label: 'Remote wipe', level: 'On report' },
    ],
  },
  [key('sl-mobile-security', 'apps')]: {
    type: 'compare',
    title: 'App policy',
    do: ['Managed app catalog', 'Official app stores', 'Review permissions'],
    dont: ['Sideload APKs', 'Jailbreak / root', 'Personal apps for work mail'],
  },
  [key('sl-mobile-security', 'lost')]: {
    type: 'timeline',
    title: 'Lost device playbook',
    items: [
      { time: '≤30m', label: 'Report to security', tone: 'danger' },
      { time: '≤1 hr', label: 'Remote wipe issued', tone: 'warning' },
      { time: 'Same day', label: 'Sessions rotated', tone: 'success' },
    ],
  },
  // Secure coding
  [key('sl-secure-coding', 'intro')]: {
    type: 'funnel',
    title: 'Vulnerability sources',
    stages: [
      { label: 'Input validation gaps', width: 100 },
      { label: 'Exposed secrets', width: 74 },
      { label: 'Vulnerable deps', width: 58 },
    ],
  },
  [key('sl-secure-coding', 'secrets')]: {
    type: 'compare',
    title: 'Secrets handling',
    do: ['Vault injection', 'Pre-commit scans', 'Rotate on exit'],
    dont: ['Commit .env files', 'Hard-code API keys', 'Share in Slack'],
  },
  [key('sl-secure-coding', 'scan')]: {
    type: 'flow',
    title: 'Shift-left pipeline',
    steps: [
      { label: 'SAST', sublabel: 'Every MR' },
      { label: 'SCA / deps', sublabel: 'CVE gate' },
      { label: 'Container scan', sublabel: 'Before deploy' },
      { label: 'Merge', sublabel: 'Security OK' },
    ],
  },
  [key('sl-secure-coding', 'deploy')]: {
    type: 'icons',
    title: 'Release safeguards',
    items: [
      { icon: 'flag', label: 'Feature flags' },
      { icon: 'rocket', label: 'Canary deploy' },
      { icon: 'key', label: 'AuthZ every API' },
      { icon: 'bar-chart', label: 'Security logs' },
    ],
  },
  // Leadership
  [key('sl-leadership-governance', 'intro')]: {
    type: 'layers',
    title: 'Tone from the top',
    layers: [
      { label: 'Board oversight', level: 'CC1.1' },
      { label: 'Risk appetite', level: 'Documented' },
      { label: 'Fund controls', level: 'Budgeted' },
    ],
  },
  [key('sl-leadership-governance', 'metrics')]: {
    type: 'stats',
    title: 'Quarterly review metrics',
    items: [
      { label: 'Readiness score', value: 78, unit: '%', tone: 'info' },
      { label: 'Open critical findings', value: 4, unit: 'items', tone: 'danger' },
      { label: 'Training completion', value: 86, unit: '%', tone: 'success' },
    ],
  },
  [key('sl-leadership-governance', 'incidents')]: {
    type: 'timeline',
    title: 'Crisis governance',
    items: [
      { time: 'T+0', label: 'Exec bridge activated', tone: 'danger' },
      { time: 'T+1h', label: 'Regulatory assessment', tone: 'warning' },
      { time: 'T+4h', label: 'Approved comms draft', tone: 'success' },
    ],
  },
  [key('sl-leadership-governance', 'close')]: {
    type: 'flow',
    title: 'Leadership actions',
    steps: [
      { label: 'Complete training', sublabel: 'Set example' },
      { label: 'Attest policies', sublabel: 'On time' },
      { label: 'Celebrate reports', sublabel: 'Build culture' },
    ],
  },
};

function fallbackVisual(scene: SecurityLearningScene): TrainingInfographic {
  if (scene.highlights && scene.highlights.length >= 3) {
    return {
      type: 'icons',
      title: scene.title,
      items: scene.highlights.slice(0, 4).map((label, i) => ({
        label,
        icon: (['check', 'shield', 'lock', 'eye'] as const)[i % 4],
      })),
    };
  }
  return {
    type: 'flow',
    title: scene.title,
    steps: [{ label: scene.title, sublabel: 'Key concept' }],
  };
}

export function getTrainingInfographic(
  moduleId: string,
  scene: SecurityLearningScene,
  sceneIndex: number
): TrainingInfographic {
  return VISUALS[key(moduleId, scene.id)] ?? fallbackVisual(scene);
}

export function enrichScenesWithVisuals(
  moduleId: string,
  scenes: SecurityLearningScene[]
): (SecurityLearningScene & { visual: TrainingInfographic })[] {
  return scenes.map((scene, index) => ({
    ...scene,
    visual: getTrainingInfographic(moduleId, scene, index),
  }));
}
