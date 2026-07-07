'use client';

import { cn } from '@/lib/utils';

export type CharacterId =
  | 'Alex'
  | 'Jordan'
  | 'Priya'
  | 'Maria'
  | 'Sam'
  | 'Dev'
  | 'Caller'
  | 'Visitor';

type CharacterPose = 'idle' | 'talk' | 'listen' | 'phone' | 'point';

type TrainingCharacterSpriteProps = {
  character: CharacterId;
  pose: CharacterPose;
  /** When true, character faces left (right-side of scene) */
  flip?: boolean;
  playing: boolean;
  className?: string;
};

const CHARACTERS: Record<
  CharacterId,
  {
    skin: string;
    hair: string;
    shirt: string;
    accent: string;
    hairStyle: 'short' | 'long' | 'curly';
    glasses?: boolean;
  }
> = {
  Alex: { skin: '#FDDBB4', hair: '#5C4033', shirt: '#2563EB', accent: '#1D4ED8', hairStyle: 'short' },
  Jordan: { skin: '#C68642', hair: '#2C1810', shirt: '#0F766E', accent: '#115E59', hairStyle: 'short', glasses: true },
  Priya: { skin: '#8D5524', hair: '#1A1A1A', shirt: '#7C3AED', accent: '#6D28D9', hairStyle: 'long' },
  Maria: { skin: '#E0AC69', hair: '#1A1A1A', shirt: '#DB2777', accent: '#BE185D', hairStyle: 'long' },
  Sam: { skin: '#F1C27D', hair: '#3D2B1F', shirt: '#475569', accent: '#334155', hairStyle: 'short', glasses: true },
  Dev: { skin: '#FDDBB4', hair: '#4A3728', shirt: '#059669', accent: '#047857', hairStyle: 'curly' },
  Caller: { skin: '#A67C52', hair: '#2C1810', shirt: '#64748B', accent: '#475569', hairStyle: 'short' },
  Visitor: { skin: '#A67C52', hair: '#4A3728', shirt: '#78716C', accent: '#57534E', hairStyle: 'short' },
};

export function TrainingCharacterSprite({
  character,
  pose,
  flip = false,
  playing,
  className,
}: TrainingCharacterSpriteProps) {
  const c = CHARACTERS[character] ?? CHARACTERS.Alex;
  const gestureBack = !flip;
  const talkAnim = (suffix: string) =>
    playing && pose === 'talk' ? `training-arm-${suffix}-talk` : '';
  const phoneAnim = (suffix: string) =>
    playing && pose === 'phone' ? `training-arm-${suffix}-phone` : '';
  const pointAnim = (suffix: string) =>
    playing && pose === 'point' ? `training-arm-${suffix}-point` : '';
  const listenAnim = (suffix: string) =>
    playing && pose === 'listen' ? `training-arm-${suffix}-listen` : '';

  const animBody = cn(
    playing && pose === 'talk' && 'training-char-talk',
    playing && pose === 'listen' && 'training-char-listen',
    playing && pose === 'idle' && 'training-char-idle',
    playing && pose === 'phone' && 'training-char-phone',
    playing && pose === 'point' && 'training-char-point'
  );

  return (
    <div
      className={cn('relative', flip && 'scale-x-[-1]', className)}
      aria-hidden
    >
      <svg viewBox="0 0 200 320" className={cn('h-full w-full drop-shadow-xl', animBody)}>
        {/* Shadow */}
        <ellipse cx="100" cy="308" rx="55" ry="10" fill="rgba(15,23,42,0.2)" />

        {/* Legs / lower body */}
        <path d="M 72 220 L 68 300 L 88 300 L 92 220 Z" fill="#1E293B" />
        <path d="M 108 220 L 104 300 L 124 300 L 128 220 Z" fill="#1E293B" />
        <ellipse cx="78" cy="302" rx="14" ry="5" fill="#0F172A" />
        <ellipse cx="118" cy="302" rx="14" ry="5" fill="#0F172A" />

        {/* Back arm (character's right — gestures toward partner when on left side) */}
        <g
          className={cn(
            'training-arm-back',
            gestureBack && talkAnim('back'),
            gestureBack && phoneAnim('back'),
            gestureBack && pointAnim('back'),
            gestureBack && listenAnim('back'),
            !gestureBack && playing && pose === 'idle' && 'training-arm-back-idle'
          )}
        >
          <path d="M 130 175 Q 148 190 142 215" stroke={c.shirt} strokeWidth="18" strokeLinecap="round" fill="none" />
          <path d="M 142 215 Q 148 235 138 248" stroke={c.skin} strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="136" cy="254" r="9" fill={c.skin} />
          {gestureBack && pose === 'phone' && (
            <rect x="124" y="232" width="18" height="28" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          )}
        </g>

        {/* Torso */}
        <path d="M 55 165 Q 100 150 145 165 L 150 235 Q 100 248 50 235 Z" fill={c.shirt} />
        <path d="M 55 165 Q 100 150 145 165" stroke={c.accent} strokeWidth="2" fill="none" opacity="0.4" />
        {/* Collar */}
        <path d="M 82 165 L 100 178 L 118 165" fill="white" opacity="0.25" />
        <rect x="94" y="165" width="12" height="22" rx="4" fill={c.skin} />

        {/* Front arm (character's left — gestures toward partner when flipped on right side) */}
        <g
          className={cn(
            'training-arm-front',
            !gestureBack && talkAnim('front'),
            !gestureBack && phoneAnim('front'),
            !gestureBack && pointAnim('front'),
            !gestureBack && listenAnim('front'),
            gestureBack && playing && pose === 'idle' && 'training-arm-front-idle'
          )}
        >
          <path d="M 70 175 Q 52 192 56 218" stroke={c.shirt} strokeWidth="18" strokeLinecap="round" fill="none" />
          <path d="M 56 218 Q 48 238 54 252" stroke={c.skin} strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="260" r="9" fill={c.skin} />
          {!gestureBack && pose === 'phone' && (
            <rect x="38" y="232" width="18" height="28" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          )}
        </g>

        {/* Head group */}
        <g
          className={cn(
            'training-head',
            pose === 'talk' && playing && 'training-head-talk',
            pose === 'listen' && playing && 'training-head-listen'
          )}
        >
          {/* Neck */}
          <rect x="88" y="148" width="24" height="22" rx="6" fill={c.skin} />

          {/* Face shape */}
          <ellipse cx="100" cy="105" rx="38" ry="42" fill={c.skin} />

          {/* Hair */}
          {c.hairStyle === 'short' && (
            <path
              d="M 62 95 Q 100 55 138 95 Q 132 72 100 65 Q 68 72 62 95"
              fill={c.hair}
            />
          )}
          {c.hairStyle === 'long' && (
            <>
              <path d="M 62 95 Q 100 52 138 95 Q 130 70 100 62 Q 70 70 62 95" fill={c.hair} />
              <path d="M 62 100 Q 55 140 58 165 Q 68 155 65 120 Q 62 100 62 100" fill={c.hair} />
              <path d="M 138 100 Q 145 140 142 165 Q 132 155 135 120 Q 138 100 138 100" fill={c.hair} />
            </>
          )}
          {c.hairStyle === 'curly' && (
            <>
              <circle cx="75" cy="78" r="14" fill={c.hair} />
              <circle cx="100" cy="68" r="16" fill={c.hair} />
              <circle cx="125" cy="78" r="14" fill={c.hair} />
              <circle cx="88" cy="88" r="10" fill={c.hair} />
              <circle cx="112" cy="88" r="10" fill={c.hair} />
            </>
          )}

          {/* Ears */}
          <ellipse cx="62" cy="108" rx="6" ry="9" fill={c.skin} />
          <ellipse cx="138" cy="108" rx="6" ry="9" fill={c.skin} />

          {/* Glasses */}
          {c.glasses && (
            <g stroke="#334155" strokeWidth="2.5" fill="none">
              <circle cx="82" cy="102" r="14" />
              <circle cx="118" cy="102" r="14" />
              <line x1="96" y1="102" x2="104" y2="102" />
            </g>
          )}

          {/* Eyes */}
          <g className={cn(playing && 'training-eyes-blink')}>
            <ellipse cx="82" cy="102" rx="5" ry="6" fill="#1E293B" />
            <ellipse cx="118" cy="102" rx="5" ry="6" fill="#1E293B" />
            <circle cx="84" cy="100" r="1.8" fill="white" />
            <circle cx="120" cy="100" r="1.8" fill="white" />
          </g>

          {/* Eyebrows */}
          <path
            d={pose === 'talk' ? 'M 72 88 Q 82 82 92 88' : 'M 72 90 Q 82 87 92 90'}
            stroke={c.hair}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={pose === 'talk' ? 'M 108 88 Q 118 82 128 88' : 'M 108 90 Q 118 87 128 90'}
            stroke={c.hair}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {/* Nose */}
          <path d="M 100 108 Q 102 116 98 118" stroke="rgba(0,0,0,0.12)" strokeWidth="2" fill="none" />

          {/* Mouth */}
          {pose === 'talk' && playing ? (
            <ellipse cx="100" cy="128" rx="10" ry="7" fill="#1E293B" className="training-mouth-talk" />
          ) : pose === 'listen' ? (
            <path d="M 88 126 Q 100 130 112 126" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M 90 128 Q 100 134 110 128" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
        </g>
      </svg>
    </div>
  );
}

export function isCharacterId(name: string): name is CharacterId {
  return name in CHARACTERS;
}
