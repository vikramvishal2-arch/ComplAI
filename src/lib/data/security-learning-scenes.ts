export type SecurityLearningScene = {
  id: string;
  title: string;
  narration: string;
  highlights?: string[];
  durationSeconds: number;
};

/** Spoken scripts — written for the ear, not the page. */
export const SECURITY_LEARNING_SCENES: Record<string, SecurityLearningScene[]> = {
  'sl-sample-cyber-basics': [
    {
      id: 'intro',
      title: 'Four habits that protect everyone',
      narration:
        "Hey, thanks for taking a few minutes for this. I'm not here to drown you in tech jargon. Honestly, four everyday habits stop most attacks cold. We'll walk through them together — quick and practical.",
      highlights: ['Phishing awareness', 'Strong passwords', 'MFA', 'Software updates'],
      durationSeconds: 38,
    },
    {
      id: 'phishing',
      title: 'Recognize and report phishing',
      narration:
        "First up — phishing. You know that message that makes your stomach drop? 'Urgent, verify your account now.' That's the one. Pause. Don't tap the link. Report it to security, then delete it. That single pause protects your whole team.",
      highlights: ['Pause before clicking', 'Report suspicious mail', 'Delete the message'],
      durationSeconds: 42,
    },
    {
      id: 'passwords-mfa',
      title: 'Passwords and MFA',
      narration:
        "Passwords next. Use long, unique ones — think sixteen characters or more — and let your company password manager remember them for you. Then turn on multi-factor auth wherever you can. Even if someone steals a password, MFA still stops them at the door.",
      highlights: ['16+ character passwords', 'Password manager', 'Enable MFA'],
      durationSeconds: 45,
    },
    {
      id: 'updates',
      title: 'Keep software updated',
      narration:
        "Last one — updates. I know, they're annoying. But those patches close holes attackers actually use. Turn on automatic updates when you can. Small habit, big payoff. Thanks for listening — stay safe out there.",
      highlights: ['Install updates promptly', 'Enable auto-update', 'Patch phones too'],
      durationSeconds: 40,
    },
  ],
  'sl-phishing-basics': [
    {
      id: 'intro',
      title: 'Why phishing still works',
      narration:
        "So, phishing. Still the number one way bad actors get in — and it's not because people are careless. These emails look real. Your bank, your boss, IT support. You've got seconds to decide. Let's make sure you trust your gut.",
      highlights: ['#1 workforce threat', 'Looks trustworthy', 'Decide in seconds'],
      durationSeconds: 42,
    },
    {
      id: 'red-flags',
      title: 'Spot the red flags',
      narration:
        "What do I look for? Urgency — 'act now or lose access.' Senders that are almost right but not quite. Links that look fine until you hover. Attachments you weren't expecting. If it feels weird, it probably is. Trust that.",
      highlights: ['Fake urgency', 'Spoofed domains', 'Suspicious links'],
      durationSeconds: 48,
    },
    {
      id: 'verify',
      title: 'Verify out of band',
      narration:
        "Someone wants a wire transfer, a password reset, a data export — in email or chat? Don't confirm in the same thread. Call a number you already trust. Your company directory, not the number in the message.",
      highlights: ['Call a known number', 'Use official portals', 'Never reply in-thread'],
      durationSeconds: 44,
    },
    {
      id: 'report',
      title: 'Report and protect others',
      narration:
        "When you catch one, hit Report Phishing — or forward to your security alias. That teaches the filters. Your coworkers might never even see the same attack. Report it, delete it, carry on. You just helped everyone.",
      highlights: ['Report in one click', 'Helps filter learn', 'Delete after reporting'],
      durationSeconds: 42,
    },
  ],
  'sl-mfa-passwords': [
    {
      id: 'intro',
      title: 'Credentials are the keys',
      narration:
        "Think of your work password like your house key. Reuse it everywhere, or pick something easy — and one leak from some random shopping site can unlock your work email too. It happens every day.",
      highlights: ['Unique passwords only', 'No shared accounts', 'Breaches happen daily'],
      durationSeconds: 38,
    },
    {
      id: 'manager',
      title: 'Use the approved password manager',
      narration:
        "Use the password manager your company gave you. Let it generate long, random passwords — you don't have to memorize them. And please don't stash production passwords in your personal browser on a home laptop.",
      highlights: ['Auto-generate 16+ chars', 'Vault shared team secrets', 'Audit access regularly'],
      durationSeconds: 42,
    },
    {
      id: 'mfa',
      title: 'Multi-factor authentication',
      narration:
        "Turn on MFA — that extra prompt on your phone. Only approve when you just tried to log in. Got a push out of nowhere? Deny it and tell security. That's someone testing your account.",
      highlights: ['Authenticator app preferred', 'Reject unknown prompts', 'No MFA code sharing'],
      durationSeconds: 40,
    },
    {
      id: 'close',
      title: 'Daily habits',
      narration:
        "Little things matter. Lock your screen when you grab coffee. Don't paste passwords in chat. If security asks you to reset, do it — they're not trying to annoy you, they're closing a risk.",
      highlights: ['Lock screen policy', 'Zero credential sharing', 'Follow reset notices'],
      durationSeconds: 36,
    },
  ],
  'sl-data-handling': [
    {
      id: 'classify',
      title: 'Classify before you share',
      narration:
        "Before you hit send on a file, ask yourself — is this public, internal, confidential, or restricted? Not sure? Treat it as confidential until someone who owns the data tells you otherwise.",
      highlights: ['Label in ComplAI & M365', 'Default to confidential', 'Ask data owners'],
      durationSeconds: 40,
    },
    {
      id: 'pii',
      title: 'Personal & regulated data',
      narration:
        "Customer names, employee records, payment info — that's regulated stuff. GDPR, DPDP, contracts — pick up only what you need, keep it only as long as policy says, then get rid of it properly.",
      highlights: ['Data minimization', 'Retention schedules', 'Cross-border rules'],
      durationSeconds: 42,
    },
    {
      id: 'tools',
      title: 'Approved tools only',
      narration:
        "Share sensitive files through company drives and approved transfer tools. Personal Gmail, random WhatsApp groups — that's how data walks out the door by accident. When DLP warns you, take it seriously.",
      highlights: ['No personal Dropbox/WhatsApp', 'Encrypted transfer links', 'DLP warnings matter'],
      durationSeconds: 42,
    },
    {
      id: 'incident',
      title: 'When data goes wrong',
      narration:
        "Email the wrong person? Laptop left in a cab? Don't panic-hide it. Tell security within the hour. Early heads-up means we can contain it before it becomes a headline.",
      highlights: ['Report within 1 hour', 'Do not delete sent items', 'Preserve logs'],
      durationSeconds: 38,
    },
  ],
  'sl-remote-work': [
    {
      id: 'intro',
      title: 'Your home is an office',
      narration:
        "Working from home means your living room is part of the company network now. Shared Wi‑Fi, family tablets, a webcam pointed at your kitchen — attackers know that, and they'll use it.",
      highlights: ['Home Wi‑Fi hygiene', 'Dedicated work profile', 'Physical privacy'],
      durationSeconds: 38,
    },
    {
      id: 'vpn',
      title: 'VPN and managed devices',
      narration:
        "VPN on before you touch internal apps. Use the laptop IT enrolled — encrypted disk, patches managed. Your personal PC might be fine for Netflix, but not for production data.",
      highlights: ['VPN required for prod', 'MDM enrollment', 'No personal PCs for prod'],
      durationSeconds: 40,
    },
    {
      id: 'calls',
      title: 'Video call discipline',
      narration:
        "On video calls, blur the background if you can. Mute when you're not talking. And before you share your screen — glance at what's open. Dashboards and tickets shouldn't flash in front of guests.",
      highlights: ['Check screen before share', 'Lock meeting rooms', 'No public café screens'],
      durationSeconds: 42,
    },
    {
      id: 'close',
      title: 'Travel and co-working',
      narration:
        "Coffee shop Wi‑Fi? Use your phone hotspot or VPN. Shoulder surfers are real. Traveling — laptop in the hotel safe beats leaving it on the desk.",
      highlights: ['Hotspot over café Wi‑Fi', 'Privacy filters', 'Hotel safe for laptops'],
      durationSeconds: 36,
    },
  ],
  'sl-social-engineering': [
    {
      id: 'intro',
      title: 'Humans are the target',
      narration:
        "Social engineering isn't fancy hacking — it's someone playing on trust. Fake IT, fake exec, fake auditor. They rush you so you skip the checks. Slow down. That's your superpower.",
      highlights: ['Authority impersonation', 'Artificial urgency', 'Emotional manipulation'],
      durationSeconds: 38,
    },
    {
      id: 'channels',
      title: 'Phone, chat, and in person',
      narration:
        "It shows up everywhere. A caller asking for your MFA code. A text with a login link. Someone tailgating through the door with a smile and a fake badge. Same playbook — pressure and pretend trust.",
      highlights: ['Vishing & smishing', 'Tailgating risk', 'Deepfake voice rising'],
      durationSeconds: 40,
    },
    {
      id: 'verify',
      title: 'Always verify',
      narration:
        "Wire transfer, gift cards, 'reset my password real quick' — never use the contact details in the request. Call back on a number you look up yourself, or walk over and confirm face to face.",
      highlights: ['Separate verification channel', 'Executive approval for wires', 'Escalate anomalies'],
      durationSeconds: 42,
    },
    {
      id: 'close',
      title: 'Culture of safe refusal',
      narration:
        "You're never in trouble for double-checking. Security would rather get ten false alarms than miss one real scam. Report weird interactions — you're protecting everyone, including yourself.",
      highlights: ['No penalty for verifying', 'Report every attempt', 'Share lessons learned'],
      durationSeconds: 36,
    },
  ],
  'sl-incident-reporting': [
    {
      id: 'what',
      title: 'What is a security incident?',
      narration:
        "An incident is anything that puts data or systems at risk — malware, a lost phone, someone in an account they shouldn't be, a weird email you already clicked. If you're wondering 'is this bad?' — treat it as yes.",
      highlights: ['Malware & ransomware', 'Lost devices', 'Unauthorized access'],
      durationSeconds: 38,
    },
    {
      id: 'when',
      title: 'When to report',
      narration:
        "Active attack happening now? Report immediately. Think data might have leaked? Within the hour. Still unsure? Report anyway. We'd rather help early than clean up a mess later.",
      highlights: ['Active attack: now', 'Data spill: 1 hour', 'When unsure: report anyway'],
      durationSeconds: 36,
    },
    {
      id: 'how',
      title: 'How to report',
      narration:
        "Use the security hotline, the Slack channel, or the incident form in ComplAI. What happened, when, what systems, what you've already done — that's enough to get the right people moving.",
      highlights: ['Hotline & portal', 'Preserve screenshots', 'List affected systems'],
      durationSeconds: 38,
    },
    {
      id: 'dont',
      title: 'What not to do',
      narration:
        "Don't power off machines unless they tell you to. Don't delete emails to 'clean up.' And please don't post about it in a public chat. Let the incident team lead — they're trained for this.",
      highlights: ['Preserve evidence', 'No public discussion', 'Follow IR playbook'],
      durationSeconds: 36,
    },
  ],
  'sl-clean-desk': [
    {
      id: 'intro',
      title: 'Physical security matters',
      narration:
        "We talk a lot about firewalls, but a printed customer list on a desk or an unlocked screen in the break room — that's a breach too. Physical security still shows up on audits for a reason.",
      highlights: ['Clean desk policy', 'Clear screen', 'Badge visibility'],
      durationSeconds: 36,
    },
    {
      id: 'desk',
      title: 'Clean desk rules',
      narration:
        "Lock confidential papers away. Shred what you're done with — cross-cut, not the little strip shredder. Whiteboard full of customer names? Wipe it before you leave the room.",
      highlights: ['Lock storage', 'Cross-cut shredding', 'Erase whiteboards'],
      durationSeconds: 36,
    },
    {
      id: 'access',
      title: 'Badges and visitors',
      narration:
        "Wear your badge where people can see it. Walk visitors in — don't let strangers wander. Someone behind you without a badge? A polite 'can I help you find someone?' is exactly what we want.",
      highlights: ['Escort visitors', 'Challenge tailgaters', 'Report lost badges same day'],
      durationSeconds: 38,
    },
    {
      id: 'close',
      title: 'Quick checklist',
      narration:
        "Leaving your desk — Win+L to lock, dock the laptop, badge in your bag not dangling on your lanyard. Takes ten seconds, saves a world of hurt.",
      highlights: ['Lock workstation', 'Secure devices', 'No papers in transit'],
      durationSeconds: 32,
    },
  ],
  'sl-mobile-security': [
    {
      id: 'intro',
      title: 'Mobile is a primary endpoint',
      narration:
        "Your phone has your email, your MFA app, Slack with sensitive threads. Lose the phone or install the wrong app, and it's often game over for your accounts.",
      highlights: ['Email + MFA on device', 'High theft risk', 'App store threats'],
      durationSeconds: 36,
    },
    {
      id: 'mdm',
      title: 'MDM enrollment',
      narration:
        "Enroll any device that touches company data in MDM — that's mobile device management. It keeps encryption on, patches current, and lets us wipe remotely if the phone goes missing.",
      highlights: ['Required enrollment', 'Encryption enforced', 'Remote wipe ready'],
      durationSeconds: 40,
    },
    {
      id: 'apps',
      title: 'App hygiene',
      narration:
        "Work apps from the company catalog or official stores only. Sideloaded APKs, jailbroken phones — that's a hard no for company email. Check permissions when an app asks for more than it needs.",
      highlights: ['No sideloading', 'No jailbreak/root', 'Review app permissions'],
      durationSeconds: 40,
    },
    {
      id: 'lost',
      title: 'Lost or stolen devices',
      narration:
        "Phone gone? Tell security right away — even if you think it's powered off. We'll wipe it and rotate sessions so your accounts stay yours. Waiting until tomorrow is the expensive option.",
      highlights: ['Report within 30 minutes', 'Change passwords if delayed', 'File police report if stolen'],
      durationSeconds: 38,
    },
  ],
  'sl-secure-coding': [
    {
      id: 'intro',
      title: 'Shift-left security',
      narration:
        "As engineers, you're on the front line. Most production incidents I've seen trace back to missing validation, a secret in git, or a dependency nobody updated. Security isn't someone else's ticket.",
      highlights: ['OWASP Top 10', 'Secure SDLC', 'Shared responsibility'],
      durationSeconds: 40,
    },
    {
      id: 'secrets',
      title: 'Secrets and configuration',
      narration:
        "API keys in code — we've all seen it, don't be that commit. Vault and environment injection exist for a reason. Someone leaves, a repo goes public — rotate everything that could've leaked.",
      highlights: ['Vault-only secrets', 'Pre-commit hooks', 'Rotate on exposure'],
      durationSeconds: 42,
    },
    {
      id: 'scan',
      title: 'Automated testing',
      narration:
        "Let the pipeline run SAST, dependency scans, image checks. Critical finding on your merge request? Fix it before merge. Waivers need security sign-off — not a silent ignore.",
      highlights: ['SAST on every MR', 'SCA for dependencies', 'Container scanning'],
      durationSeconds: 40,
    },
    {
      id: 'deploy',
      title: 'Safe release practices',
      narration:
        "Feature flags, canary deploys, immutable infra — use them. And check authorization on every API endpoint, not just the login page. Attackers script the rest.",
      highlights: ['AuthZ on every endpoint', 'Canary releases', 'Structured security logs'],
      durationSeconds: 38,
    },
  ],
  'sl-leadership-governance': [
    {
      id: 'intro',
      title: 'Tone from the top',
      narration:
        "Auditors aren't just looking at firewalls — they want to see leadership set expectations, fund controls, and hold people accountable. Your visible support matters more than another policy PDF.",
      highlights: ['CC1.1 accountability', 'Board oversight', 'Risk appetite statements'],
      durationSeconds: 40,
    },
    {
      id: 'metrics',
      title: 'Metrics that matter',
      narration:
        "Quarterly, look at readiness scores, open critical findings, training completion, vendor risk. When you decide to accept a risk, document it in ComplAI — owner, date, rationale. Future you will thank present you.",
      highlights: ['Quarterly security review', 'Risk register decisions', 'Training completion targets'],
      durationSeconds: 42,
    },
    {
      id: 'incidents',
      title: 'Incident and crisis governance',
      narration:
        "Have comms templates and regulatory paths agreed before the bad day. On a severity-one, executives join the bridge and sign off on external statements. Practice beats improvisation.",
      highlights: ['Pre-approved comms', 'Regulatory timelines', 'Executive bridge roster'],
      durationSeconds: 40,
    },
    {
      id: 'close',
      title: 'Champion the program',
      narration:
        "Complete your own training on time. Attest to policies. When a team reports phishing instead of clicking — say thank you publicly. Culture is what leaders reward.",
      highlights: ['Complete your training', 'Attest to policies', 'Reward reporting'],
      durationSeconds: 38,
    },
  ],
};

export function getModuleScenes(moduleId: string): SecurityLearningScene[] {
  return SECURITY_LEARNING_SCENES[moduleId] ?? [];
}

export function getModuleDurationSeconds(moduleId: string): number {
  return getModuleScenes(moduleId).reduce((sum, scene) => sum + scene.durationSeconds, 0);
}
