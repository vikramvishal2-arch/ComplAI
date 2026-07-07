'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SecurityLearningCategory } from '@/lib/data/security-learning';
import { getTrainingSceneAudioPath } from '@/lib/data/security-learning';
import type { TrainingInfographic } from '@/lib/data/security-learning-visuals';
import { TrainingExplainerStage } from '@/components/security-learning/training-explainer-stage';
import {
  estimateNarrationSeconds,
  useTrainingNarration,
} from '@/hooks/use-training-narration';
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

type TrainingScene = {
  id: string;
  title: string;
  narration: string;
  highlights?: string[];
  durationSeconds: number;
  visual: TrainingInfographic;
};

type AiTrainingVideoPlayerProps = {
  moduleId: string;
  title: string;
  category: SecurityLearningCategory;
  scenes: TrainingScene[];
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AiTrainingVideoPlayer({ moduleId, title, category, scenes }: AiTrainingVideoPlayerProps) {
  const totalDuration = useMemo(
    () => scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0),
    [scenes]
  );

  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneElapsed, setSceneElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  const tickRef = useRef<number | null>(null);
  const advancingRef = useRef(false);
  const spokenSceneRef = useRef<number | null>(null);

  const { speak, cancel, pause: pauseSpeech, resume: resumeSpeech, speaking, muted, toggleMute, supported, mode } =
    useTrainingNarration();
  const speakRef = useRef(speak);
  speakRef.current = speak;

  const currentScene = scenes[sceneIndex];

  const sceneDuration = useMemo(() => {
    if (!currentScene) return 30;
    return Math.max(currentScene.durationSeconds, estimateNarrationSeconds(currentScene.narration));
  }, [currentScene]);

  const sceneProgress = useMemo(() => {
    if (!currentScene || sceneDuration <= 0) return 0;
    const timerProgress = Math.min(1, sceneElapsed / sceneDuration);
    if (!muted && supported && speechProgress > 0) {
      return Math.max(speechProgress, timerProgress * 0.15);
    }
    return timerProgress;
  }, [currentScene, sceneDuration, sceneElapsed, speechProgress, muted, supported]);

  const elapsedTotal = useMemo(() => {
    const prior = scenes.slice(0, sceneIndex).reduce((sum, s) => sum + s.durationSeconds, 0);
    return prior + sceneElapsed;
  }, [sceneIndex, sceneElapsed, scenes]);

  const clearTick = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const advanceScene = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;

    if (sceneIndex >= scenes.length - 1) {
      setPlaying(false);
      setFinished(true);
      cancel();
    } else {
      setSceneIndex((i) => i + 1);
      setSceneElapsed(0);
      spokenSceneRef.current = null;
    }

    window.setTimeout(() => {
      advancingRef.current = false;
    }, 300);
  }, [sceneIndex, scenes.length, cancel]);

  const restart = useCallback(() => {
    clearTick();
    cancel();
    setSceneIndex(0);
    setSceneElapsed(0);
    setSpeechProgress(0);
    setFinished(false);
    spokenSceneRef.current = null;
    advancingRef.current = false;
    setPlaying(true);
  }, [clearTick, cancel]);

  // Start narration when scene begins playing
  useEffect(() => {
    if (!playing || finished || !currentScene) return;

    if (spokenSceneRef.current === sceneIndex) {
      resumeSpeech();
      return;
    }

    spokenSceneRef.current = sceneIndex;
    setSceneElapsed(0);
    setSpeechProgress(0);

    speakRef.current(currentScene.narration, {
      audioSrc: getTrainingSceneAudioPath(moduleId, currentScene.id),
      onProgress: setSpeechProgress,
      onEnd: () => {
        setSpeechProgress(1);
        window.setTimeout(() => advanceScene(), 400);
      },
    });
  }, [playing, finished, sceneIndex, moduleId, currentScene?.id, currentScene?.narration, resumeSpeech, advanceScene]);

  // Pause narration when player paused
  useEffect(() => {
    if (finished) return;
    if (!playing) pauseSpeech();
  }, [playing, finished, pauseSpeech]);

  // Progress timer + fallback advance if speech unavailable
  useEffect(() => {
    if (!playing || finished) {
      clearTick();
      return;
    }

    tickRef.current = window.setInterval(() => {
      setSceneElapsed((prev) => {
        const next = prev + 0.1;
        if (next >= sceneDuration) advanceScene();
        return next;
      });
    }, 100);

    return clearTick;
  }, [playing, finished, clearTick, sceneDuration, advanceScene]);

  useEffect(() => () => {
    clearTick();
    cancel();
  }, [clearTick, cancel]);

  if (scenes.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-900 text-sm text-slate-400">
        Training video is being prepared.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-black shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        {finished ? (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-sky-950 via-indigo-950 to-slate-950 px-6 text-center">
            <div className="training-complete-badge mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white shadow-lg">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white sm:text-2xl">{title}</h3>
            <p className="mt-2 max-w-md text-sm text-slate-300">Module complete. Great work staying cyber smart.</p>
          </div>
        ) : (
          <TrainingExplainerStage
            key={currentScene.id}
            sceneKey={`${sceneIndex}-${currentScene.id}`}
            title={currentScene.title}
            category={category}
            visual={currentScene.visual}
            playing={playing}
            progress={sceneProgress}
            speaking={speaking && !muted}
            sceneIndex={sceneIndex}
            sceneCount={scenes.length}
            moduleTitle={title}
          />
        )}

        {!playing && !finished && (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/35"
            aria-label="Play video"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-600 shadow-xl">
              <Play className="h-7 w-7 fill-current pl-1" />
            </span>
          </button>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
        <div className="mb-2 flex gap-1">
          {scenes.map((scene, i) => (
            <div
              key={scene.id}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"
              title={scene.title}
            >
              <div
                className="h-full rounded-full bg-brand-500 transition-[width] duration-100 ease-linear"
                style={{
                  width:
                    i < sceneIndex ? '100%' : i === sceneIndex ? `${sceneProgress * 100}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {finished ? (
              <button
                type="button"
                onClick={restart}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                aria-label="Replay module"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              </button>
            )}
            {supported && (
              <button
                type="button"
                onClick={toggleMute}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                aria-label={muted ? 'Unmute narration' : 'Mute narration'}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}
            <span className="text-xs tabular-nums text-slate-500">
              {formatTime(elapsedTotal)} / {formatTime(totalDuration)}
            </span>
          </div>
          {!finished && (
            <span className="text-xs text-slate-400">
              Part {sceneIndex + 1} of {scenes.length}
              {mode === 'bundled' && !muted && (
                <span className="ml-2 hidden text-emerald-600 sm:inline">· Natural voice</span>
              )}
              {mode === 'neural' && !muted && (
                <span className="ml-2 hidden text-emerald-600 sm:inline">· Natural voice</span>
              )}
              {mode === 'browser' && !muted && (
                <span className="ml-2 hidden text-slate-500 sm:inline">· Device voice</span>
              )}
              {mode === 'captions' && (
                <span className="ml-2 hidden text-slate-500 sm:inline">· Captions only</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
