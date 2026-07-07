'use client';

import type { ScenarioAction, ScenarioSetting } from '@/lib/data/security-learning-scenarios';
import { cn } from '@/lib/utils';

type TrainingSceneBackgroundProps = {
  setting: ScenarioSetting;
  action: ScenarioAction;
  progress: number;
  playing: boolean;
};

export function TrainingSceneBackground({
  setting,
  action,
  progress,
  playing,
}: TrainingSceneBackgroundProps) {
  return (
    <svg
      viewBox="0 0 800 450"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d6b896" />
          <stop offset="100%" stopColor="#b8956a" />
        </linearGradient>
        <linearGradient id="screenGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Wall */}
      <rect width="800" height="320" fill="url(#wallGrad)" />
      <rect y="320" width="800" height="130" fill="url(#floorGrad)" />

      {/* Floor perspective lines */}
      <path d="M0 320 L800 320" stroke="#a08060" strokeWidth="2" opacity="0.4" />
      <path d="M100 320 L350 450 M700 320 L450 450" stroke="#a08060" strokeWidth="1" opacity="0.2" />

      {setting === 'open-office' && <OpenOfficeDecor />}
      {setting === 'home-desk' && <HomeDeskDecor />}
      {setting === 'meeting-room' && <MeetingRoomDecor />}
      {setting === 'reception' && <ReceptionDecor />}
      {setting === 'dev-floor' && <DevFloorDecor />}

      <MonitorProps action={action} progress={progress} playing={playing} setting={setting} />

      {/* Ambient ceiling light */}
      <ellipse cx="400" cy="30" rx="120" ry="18" fill="white" opacity="0.55" />
      <ellipse cx="400" cy="30" rx="80" ry="10" fill="#fef9c3" opacity="0.35" />
    </svg>
  );
}

function OpenOfficeDecor() {
  return (
    <g>
      {/* Window */}
      <rect x="40" y="50" width="200" height="180" rx="4" fill="#94a3b8" />
      <rect x="48" y="58" width="184" height="164" rx="2" fill="url(#skyGrad)" />
      <rect x="135" y="58" width="4" height="164" fill="#94a3b8" opacity="0.6" />
      <rect x="48" y="137" width="184" height="4" fill="#94a3b8" opacity="0.6" />
      {/* City silhouette */}
      <path
        d="M48 200 L70 170 L95 185 L120 155 L150 175 L180 160 L232 200 Z"
        fill="#64748b"
        opacity="0.5"
      />
      {/* Left desk */}
      <g filter="url(#softShadow)">
        <rect x="80" y="260" width="160" height="14" rx="3" fill="#78716c" />
        <rect x="90" y="248" width="8" height="26" fill="#57534e" />
        <rect x="222" y="248" width="8" height="26" fill="#57534e" />
      </g>
      {/* Right desk area */}
      <g filter="url(#softShadow)">
        <rect x="560" y="260" width="160" height="14" rx="3" fill="#78716c" />
        <rect x="570" y="248" width="8" height="26" fill="#57534e" />
        <rect x="702" y="248" width="8" height="26" fill="#57534e" />
      </g>
      {/* Plant */}
      <ellipse cx="720" cy="310" rx="22" ry="8" fill="#57534e" />
      <rect x="714" y="280" width="12" height="30" fill="#854d0e" rx="2" />
      <circle cx="708" cy="268" r="16" fill="#16a34a" />
      <circle cx="726" cy="262" r="14" fill="#22c55e" />
      <circle cx="718" cy="252" r="12" fill="#4ade80" />
      {/* Whiteboard */}
      <rect x="300" y="80" width="180" height="100" rx="4" fill="white" stroke="#cbd5e1" strokeWidth="3" />
      <line x1="320" y1="110" x2="460" y2="110" stroke="#e2e8f0" strokeWidth="2" />
      <line x1="320" y1="130" x2="420" y2="130" stroke="#e2e8f0" strokeWidth="2" />
      <line x1="320" y1="150" x2="440" y2="150" stroke="#e2e8f0" strokeWidth="2" />
    </g>
  );
}

function HomeDeskDecor() {
  return (
    <g>
      <rect x="0" y="50" width="800" height="270" fill="#ede9fe" opacity="0.5" />
      {/* Bookshelf */}
      <rect x="600" y="70" width="140" height="200" rx="4" fill="#92400e" />
      <rect x="610" y="85" width="120" height="4" fill="#78350f" />
      <rect x="610" y="130" width="120" height="4" fill="#78350f" />
      <rect x="610" y="175" width="120" height="4" fill="#78350f" />
      <rect x="615" y="92" width="18" height="32" rx="1" fill="#6366f1" />
      <rect x="638" y="95" width="14" height="29" rx="1" fill="#ec4899" />
      <rect x="658" y="90" width="20" height="34" rx="1" fill="#14b8a6" />
      {/* Desk */}
      <g filter="url(#softShadow)">
        <rect x="200" y="265" width="400" height="14" rx="3" fill="#a16207" />
        <rect x="220" y="252" width="10" height="27" fill="#854d0e" />
        <rect x="570" y="252" width="10" height="27" fill="#854d0e" />
      </g>
      {/* Lamp */}
      <path d="M680 260 L690 200 L710 200 L700 260" fill="#fbbf24" opacity="0.8" />
      <rect x="687" y="195" width="26" height="8" rx="2" fill="#f59e0b" />
      <ellipse cx="700" cy="195" rx="30" ry="10" fill="#fef08a" opacity="0.4" />
      {/* Coffee mug */}
      <rect x="480" y="248" width="20" height="18" rx="3" fill="white" stroke="#cbd5e1" strokeWidth="2" />
    </g>
  );
}

function MeetingRoomDecor() {
  return (
    <g>
      <rect x="150" y="290" width="500" height="40" rx="20" fill="#92400e" opacity="0.35" />
      <rect x="150" y="285" width="500" height="12" rx="6" fill="#a16207" filter="url(#softShadow)" />
      {/* Chairs silhouettes */}
      {[200, 320, 440, 560].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="340" rx="28" ry="10" fill="#64748b" opacity="0.3" />
          <rect x={x - 20} y="310" width="40" height="30" rx="8" fill="#475569" opacity="0.25" />
        </g>
      ))}
      {/* Projector screen */}
      <rect x="280" y="60" width="240" height="130" rx="4" fill="white" stroke="#94a3b8" strokeWidth="4" />
      <rect x="295" y="80" width="210" height="90" rx="2" fill="#f1f5f9" />
      <text x="400" y="135" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="system-ui">
        Security Awareness
      </text>
    </g>
  );
}

function ReceptionDecor() {
  return (
    <g>
      {/* Reception desk */}
      <path d="M100 280 L700 280 L680 330 L120 330 Z" fill="#475569" filter="url(#softShadow)" />
      <rect x="100" y="270" width="600" height="14" rx="2" fill="#64748b" />
      {/* Glass door */}
      <rect x="320" y="80" width="160" height="190" rx="2" fill="#bae6fd" opacity="0.4" stroke="#64748b" strokeWidth="3" />
      <line x1="400" y1="80" x2="400" y2="270" stroke="#64748b" strokeWidth="2" />
      {/* Badge reader */}
      <rect x="490" y="200" width="24" height="36" rx="3" fill="#1e293b" />
      <circle cx="502" cy="215" r="6" fill="#22c55e" className="scenario-badge-blink" />
    </g>
  );
}

function DevFloorDecor() {
  return (
    <g>
      <rect x="40" y="50" width="200" height="180" rx="4" fill="#94a3b8" />
      <rect x="48" y="58" width="184" height="164" rx="2" fill="url(#skyGrad)" />
      <g filter="url(#softShadow)">
        <rect x="80" y="260" width="160" height="14" rx="3" fill="#78716c" />
        <rect x="560" y="260" width="160" height="14" rx="3" fill="#78716c" />
      </g>
      <rect x="300" y="80" width="180" height="100" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="3" />
      <text x="390" y="135" textAnchor="middle" fill="#22c55e" fontSize="12" fontFamily="monospace">
        {'> npm run deploy'}
      </text>
      <g opacity="0.85">
        <rect x="310" y="240" width="50" height="32" rx="2" fill="#1e293b" />
        <rect x="314" y="244" width="42" height="24" rx="1" fill="#0f172a" />
        <rect x="370" y="240" width="50" height="32" rx="2" fill="#1e293b" />
        <rect x="374" y="244" width="42" height="24" rx="1" fill="#22c55e" opacity="0.5" />
      </g>
    </g>
  );
}

function MonitorProps({
  action,
  progress,
  playing,
  setting,
}: {
  action: ScenarioAction;
  progress: number;
  playing: boolean;
  setting: ScenarioSetting;
}) {
  const showPhish = action === 'phishing-email' && progress > 0.12;
  const showMfa = (action === 'mfa-approve' || action === 'mfa-reject-scam') && progress > 0.15;
  const deskX = setting === 'home-desk' ? 280 : 120;
  const deskY = setting === 'home-desk' ? 210 : 205;

  return (
    <g filter="url(#softShadow)">
      {/* Monitor stand */}
      <rect x={deskX + 45} y={deskY + 38} width="30" height="8" rx="2" fill="#475569" />
      <rect x={deskX + 55} y={deskY + 44} width="10" height="14" fill="#475569" />

      {/* Monitor frame */}
      <rect x={deskX} y={deskY} width="120" height="44" rx="4" fill="#1e293b" />
      <rect x={deskX + 4} y={deskY + 4} width="112" height="36" rx="2" fill="url(#screenGlow)" className={cn(playing && 'scenario-screen-flicker')} />

      {showPhish && (
        <g className="scenario-pop-in">
          <rect x={deskX + 8} y={deskY + 8} width="96" height="28" rx="2" fill="white" />
          <text x={deskX + 14} y={deskY + 20} fill="#dc2626" fontSize="7" fontWeight="700" fontFamily="system-ui">
            URGENT PAYROLL
          </text>
          <text x={deskX + 14} y={deskY + 30} fill="#64748b" fontSize="6" fontFamily="system-ui">
            paypa1-support.com
          </text>
        </g>
      )}

      {showMfa && (
        <g className="scenario-pop-in">
          <rect x={deskX + 20} y={deskY + 6} width="72" height="32" rx="6" fill="#0f172a" />
          <text x={deskX + 56} y={deskY + 18} textAnchor="middle" fill="white" fontSize="6" fontFamily="system-ui">
            Approve sign-in?
          </text>
          <rect x={deskX + 26} y={deskY + 24} width="26" height="10" rx="3" fill="#ef4444" />
          <rect x={deskX + 58} y={deskY + 24} width="26" height="10" rx="3" fill="#22c55e" />
        </g>
      )}

      {!showPhish && !showMfa && (
        <g opacity="0.6">
          <rect x={deskX + 12} y={deskY + 12} width="40" height="4" rx="1" fill="white" />
          <rect x={deskX + 12} y={deskY + 20} width="60" height="3" rx="1" fill="white" opacity="0.7" />
          <rect x={deskX + 12} y={deskY + 26} width="50" height="3" rx="1" fill="white" opacity="0.5" />
        </g>
      )}
    </g>
  );
}
