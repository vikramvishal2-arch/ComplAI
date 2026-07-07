'use client';

import type { ScenarioAction, ScenarioSetting, TrainingScenario } from '@/lib/data/security-learning-scenarios';
import {
  TrainingCharacterSprite,
  isCharacterId,
  type CharacterId,
} from '@/components/security-learning/training-character-sprite';
import { TrainingSceneBackground } from '@/components/security-learning/training-scene-background';
import { cn } from '@/lib/utils';

type TrainingScenarioStageProps = {
  scenario: TrainingScenario;
  playing: boolean;
  progress: number;
  sceneKey?: string;
};

const POSITION: Record<'left' | 'center' | 'right', string> = {
  left: 'absolute bottom-[2%] left-[4%] z-20 h-[62%] w-[28%] sm:left-[6%] sm:w-[26%]',
  center: 'absolute bottom-[2%] left-1/2 z-20 h-[65%] w-[30%] -translate-x-1/2',
  right: 'absolute bottom-[2%] right-[4%] z-20 h-[62%] w-[28%] sm:right-[6%] sm:w-[26%]',
};

export function TrainingScenarioStage({
  scenario,
  playing,
  progress,
  sceneKey,
}: TrainingScenarioStageProps) {
  const characterDialogues = scenario.dialogues.filter(
    (d) => !['Email', 'Phone', 'Narrator'].includes(d.speaker)
  );
  const activeDialogue = [...characterDialogues].reverse().find((d) => progress >= d.at);
  const activeSpeaker = activeDialogue?.speaker;
  const dialogueIndex = activeDialogue
    ? characterDialogues.findIndex((d) => d === activeDialogue)
    : -1;

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-900">
      <div
        key={sceneKey}
        className={cn(
          'absolute inset-0 training-scene-enter',
          !playing && 'training-anim-paused'
        )}
      >
        <TrainingSceneBackground
          setting={scenario.setting}
          action={scenario.action}
          progress={progress}
          playing={playing}
        />

        <ActionProps action={scenario.action} progress={progress} setting={scenario.setting} />

        {scenario.cast.map((person) => {
          const isSpeaking = activeSpeaker === person.name;
          const isListening = Boolean(activeSpeaker && !isSpeaking && playing);
          const charId = isCharacterId(person.name) ? person.name : 'Alex';

          return (
            <div key={`${person.name}-${person.side}`} className={POSITION[person.side]}>
              {isSpeaking && activeDialogue && (
                <SpeechBubble
                  key={`${dialogueIndex}-${activeDialogue.text}`}
                  text={activeDialogue.text}
                  name={person.name}
                  side={person.side}
                />
              )}

              <TrainingCharacterSprite
                character={charId}
                flip={person.side === 'right'}
                playing={playing}
                pose={resolvePose(scenario.action, isSpeaking, isListening, person.side)}
                className={cn(
                  'h-full w-full transition-transform duration-500',
                  isSpeaking && 'scale-[1.04] brightness-105',
                  isListening && 'scale-[0.98] brightness-95'
                )}
              />

              <div
                className={cn(
                  'absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold text-white shadow-md sm:text-xs',
                  isSpeaking ? 'bg-brand-600' : 'bg-slate-800/80'
                )}
              >
                {person.name}
              </div>
            </div>
          );
        })}

        {/* Cinematic vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(15,23,42,0.35)_100%)]" />
      </div>
    </div>
  );
}

function resolvePose(
  action: ScenarioAction,
  speaking: boolean,
  listening: boolean,
  side: 'left' | 'center' | 'right'
): 'idle' | 'talk' | 'listen' | 'phone' | 'point' {
  if (speaking) {
    if (action === 'verify-phone-call' || action === 'vishing-call') return 'phone';
    if (action === 'phishing-email' && side === 'left') return 'point';
    return 'talk';
  }
  if (listening) return 'listen';
  return 'idle';
}

function SpeechBubble({
  text,
  name,
  side,
}: {
  text: string;
  name: string;
  side: 'left' | 'center' | 'right';
}) {
  return (
    <div
      className={cn(
        'scenario-dialogue absolute z-30 w-[min(13rem,85vw)] rounded-2xl border-2 border-slate-900 bg-white px-4 py-3 shadow-2xl sm:w-56',
        side === 'left' && '-top-2 left-0 sm:-top-4',
        side === 'center' && '-top-4 left-1/2 -translate-x-1/2',
        side === 'right' && '-top-2 right-0 sm:-top-4'
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-brand-600 sm:text-xs">{name}</p>
      <p className="mt-1 text-xs font-medium leading-relaxed text-slate-800 sm:text-sm">{text}</p>
      <div
        className={cn(
          'absolute -bottom-2.5 h-4 w-4 rotate-45 border-b-2 border-r-2 border-slate-900 bg-white',
          side === 'left' && 'left-8',
          side === 'center' && 'left-1/2 -translate-x-1/2',
          side === 'right' && 'right-8'
        )}
      />
    </div>
  );
}

function ActionProps({
  action,
  progress,
  setting,
}: {
  action: ScenarioAction;
  progress: number;
  setting: ScenarioSetting;
}) {
  if (action === 'tailgating' && progress > 0.2) {
    return (
      <div className="scenario-pop-in absolute left-[18%] top-[38%] z-10 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-2 shadow-lg">
        <p className="text-xs font-bold text-red-700 sm:text-sm">⚠ No badge visible</p>
      </div>
    );
  }

  if (action === 'lost-phone' && progress > 0.25) {
    return (
      <div className="scenario-shake absolute left-[22%] top-[35%] z-10 flex flex-col items-center gap-1">
        <div className="rounded-2xl bg-slate-900 p-3 text-2xl shadow-xl">📱</div>
        <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">LOST</span>
      </div>
    );
  }

  if (action === 'screen-share-leak' && progress > 0.2) {
    return (
      <div className="scenario-pop-in absolute right-[15%] top-[30%] z-10 rounded-lg border-2 border-amber-500 bg-amber-50 px-3 py-2 shadow-lg">
        <p className="text-xs font-bold text-amber-900">Customer data visible!</p>
      </div>
    );
  }

  if (action === 'report-to-security' && progress > 0.35) {
    return (
      <div className="scenario-pop-in absolute right-[20%] top-[28%] z-10 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white shadow-lg">
        <span className="text-lg">✓</span>
        <span className="text-xs font-semibold sm:text-sm">Reported to security</span>
      </div>
    );
  }

  if (action === 'incident-hotline' && progress > 0.15 && setting !== 'reception') {
    return (
      <div className="scenario-pop-in absolute left-1/2 top-[22%] z-10 -translate-x-1/2 rounded-xl bg-red-600 px-5 py-2 text-white shadow-xl">
        <p className="text-center text-xs font-bold sm:text-sm">🚨 Security Hotline: 1-800-SEC-HELP</p>
      </div>
    );
  }

  return null;
}
