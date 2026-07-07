'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type SpeakOptions = {
  onEnd?: () => void;
  onStart?: () => void;
  onProgress?: (progress: number) => void;
  /** Pre-generated bundled narration (public/training-narration) */
  audioSrc?: string;
};

export type NarrationMode = 'bundled' | 'neural' | 'browser' | 'captions' | 'idle';

const clientAudioCache = new Map<string, string>();
const NEURAL_TIMEOUT_MS = 3_000;
let neuralAvailableCache: boolean | null = null;

async function isNeuralAvailable(): Promise<boolean> {
  if (neuralAvailableCache !== null) return neuralAvailableCache;
  try {
    const res = await fetch('/api/training/narration', { credentials: 'same-origin' });
    if (!res.ok) {
      neuralAvailableCache = false;
      return false;
    }
    const data = (await res.json()) as { available?: boolean };
    neuralAvailableCache = Boolean(data.available);
    return neuralAvailableCache;
  } catch {
    neuralAvailableCache = false;
    return false;
  }
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

function waitForVoices(timeoutMs = 1200): Promise<void> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return Promise.resolve();
  }
  if (window.speechSynthesis.getVoices().length > 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const done = () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', done);
      resolve();
    };
    window.speechSynthesis.addEventListener('voiceschanged', done);
    window.setTimeout(done, timeoutMs);
  });
}

function pickBrowserVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const score = (v: SpeechSynthesisVoice): number => {
    let s = 0;
    if (!v.lang.startsWith('en')) return -1;
    const name = v.name.toLowerCase();
    if (name.includes('natural')) s += 50;
    if (name.includes('neural')) s += 45;
    if (name.includes('online')) s += 20;
    if (name.includes('aria')) s += 30;
    if (name.includes('jenny')) s += 28;
    if (name.includes('guy')) s += 25;
    if (name.includes('samantha')) s += 22;
    if (name.includes('google us english')) s += 18;
    if (name.includes('microsoft')) s += 12;
    if (v.lang === 'en-US') s += 8;
    return s;
  };
  const ranked = voices
    .map((v) => ({ v, s: score(v) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s);
  return ranked[0]?.v ?? voices.find((v) => v.lang.startsWith('en')) ?? voices[0] ?? null;
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

export function useTrainingNarration() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const generationRef = useRef(0);

  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mode, setMode] = useState<NarrationMode>('idle');

  useEffect(() => {
    setSupported(typeof window !== 'undefined');
    void waitForVoices().then(() => {
      voiceRef.current = pickBrowserVoice();
    });
  }, []);

  const cancel = useCallback(() => {
    generationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setSpeaking(false);
    setMode('idle');
  }, []);

  const speakWithCaptionsOnly = useCallback(
    async (text: string, options: SpeakOptions, signal: AbortSignal) => {
      setMode('captions');
      const durationMs = Math.max(6000, estimateNarrationSeconds(text) * 1000);
      options.onStart?.();
      options.onProgress?.(0);
      setSpeaking(true);

      const started = Date.now();
      while (Date.now() - started < durationMs) {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        const elapsed = Date.now() - started;
        options.onProgress?.(Math.min(1, elapsed / durationMs));
        await delay(120, signal);
      }
      options.onProgress?.(1);
    },
    []
  );

  const speakWithBrowser = useCallback(
    async (text: string, options: SpeakOptions, signal: AbortSignal) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        throw new Error('Browser speech unavailable');
      }

      await waitForVoices();
      voiceRef.current = pickBrowserVoice();
      setMode('browser');

      const sentences = splitSentences(text);
      const totalChars = Math.max(text.length, 1);
      let spokenChars = 0;

      for (const sentence of sentences) {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

        await new Promise<void>((resolve, reject) => {
          const utterance = new SpeechSynthesisUtterance(sentence);
          utterance.rate = 0.91;
          utterance.pitch = 1;
          utterance.volume = 1;
          if (voiceRef.current) utterance.voice = voiceRef.current;

          utterance.onstart = () => {
            setSpeaking(true);
            if (spokenChars === 0) options.onStart?.();
          };

          utterance.onboundary = (event) => {
            if (event.name === 'word' && event.charIndex !== undefined) {
              options.onProgress?.(Math.min(1, (spokenChars + event.charIndex) / totalChars));
            }
          };

          utterance.onend = () => {
            spokenChars += sentence.length + 1;
            options.onProgress?.(Math.min(1, spokenChars / totalChars));
            utteranceRef.current = null;
            resolve();
          };

          utterance.onerror = (event) => {
            utteranceRef.current = null;
            const err = event.error ?? 'unknown';
            if (err === 'interrupted' || err === 'canceled') {
              resolve();
              return;
            }
            reject(new Error(`Speech error: ${err}`));
          };

          utteranceRef.current = utterance;
          window.speechSynthesis.speak(utterance);
        });

        if (!signal.aborted && sentences.indexOf(sentence) < sentences.length - 1) {
          await delay(350, signal);
        }
      }
    },
    []
  );

  const speakWithBundled = useCallback(
    async (audioSrc: string, options: SpeakOptions, signal: AbortSignal) => {
      setMode('bundled');
      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      await new Promise<void>((resolve, reject) => {
        audio.onloadeddata = () => {
          options.onStart?.();
          options.onProgress?.(0);
        };

        audio.onplay = () => setSpeaking(true);

        audio.ontimeupdate = () => {
          if (audio.duration > 0) {
            options.onProgress?.(Math.min(1, audio.currentTime / audio.duration));
          }
        };

        audio.onended = () => {
          options.onProgress?.(1);
          resolve();
        };

        audio.onerror = () => reject(new Error('Bundled audio playback error'));

        signal.addEventListener(
          'abort',
          () => {
            audio.pause();
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true }
        );

        void audio.play().catch(reject);
      });
    },
    []
  );

  const speakWithNeural = useCallback(
    async (text: string, options: SpeakOptions, signal: AbortSignal) => {
      let url = clientAudioCache.get(text);
      if (!url) {
        const timeout = new AbortController();
        const timeoutId = window.setTimeout(() => timeout.abort(), NEURAL_TIMEOUT_MS);
        const merged = new AbortController();
        const onAbort = () => merged.abort();
        signal.addEventListener('abort', onAbort, { once: true });
        timeout.signal.addEventListener('abort', onAbort, { once: true });
        try {
          const response = await fetch('/api/training/narration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ text }),
            signal: merged.signal,
          });
          if (!response.ok) throw new Error('Neural TTS failed');
          const contentType = response.headers.get('content-type') ?? '';
          if (!contentType.includes('audio')) throw new Error('Invalid audio response');
          const blob = await response.blob();
          if (blob.size < 256) throw new Error('Empty audio response');
          url = URL.createObjectURL(blob);
          clientAudioCache.set(text, url);
        } finally {
          window.clearTimeout(timeoutId);
          signal.removeEventListener('abort', onAbort);
        }
      }

      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

      setMode('neural');
      const audio = new Audio(url);
      audioRef.current = audio;

      await new Promise<void>((resolve, reject) => {
        audio.onplay = () => {
          setSpeaking(true);
          options.onStart?.();
          options.onProgress?.(0);
        };

        audio.ontimeupdate = () => {
          if (audio.duration > 0) {
            options.onProgress?.(Math.min(1, audio.currentTime / audio.duration));
          }
        };

        audio.onended = () => {
          options.onProgress?.(1);
          resolve();
        };

        audio.onerror = () => reject(new Error('Audio playback error'));

        signal.addEventListener(
          'abort',
          () => {
            audio.pause();
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true }
        );

        void audio.play().catch(reject);
      });
    },
    []
  );

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (typeof window === 'undefined' || !text.trim()) return;

      cancel();
      const generation = ++generationRef.current;
      const controller = new AbortController();
      abortRef.current = controller;

      void (async () => {
        if (muted) {
          try {
            await speakWithCaptionsOnly(text, options, controller.signal);
          } catch {
            if (generation === generationRef.current && !controller.signal.aborted) options.onEnd?.();
            return;
          }
          if (generation === generationRef.current && !controller.signal.aborted) {
            setSpeaking(false);
            options.onEnd?.();
          }
          setMode('idle');
          return;
        }

        try {
          if (options.audioSrc) {
            await speakWithBundled(options.audioSrc, options, controller.signal);
          } else if (await isNeuralAvailable()) {
            await speakWithNeural(text, options, controller.signal);
          } else {
            throw new Error('Neural TTS not configured');
          }
        } catch {
          if (controller.signal.aborted || generation !== generationRef.current) return;
          if (options.audioSrc) {
            // Bundled narration only — advance visuals without robotic browser read-aloud
            await speakWithCaptionsOnly(text, options, controller.signal);
            return;
          }
          try {
            await speakWithBrowser(text, options, controller.signal);
          } catch {
            if (controller.signal.aborted || generation !== generationRef.current) return;
            await speakWithCaptionsOnly(text, options, controller.signal);
          }
        }

        if (generation === generationRef.current && !controller.signal.aborted) {
          setSpeaking(false);
          options.onEnd?.();
        }
        setMode('idle');
      })();
    },
    [cancel, muted, speakWithBrowser, speakWithBundled, speakWithCaptionsOnly, speakWithNeural]
  );

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setSpeaking(false);
      return;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
      setSpeaking(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (muted) return;
    if (audioRef.current?.paused) {
      void audioRef.current.play();
      setSpeaking(true);
      return;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
      setSpeaking(true);
    }
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (!m) cancel();
      return !m;
    });
  }, [cancel]);

  useEffect(() => () => cancel(), [cancel]);

  return {
    supported,
    speaking,
    muted,
    mode,
    speak,
    cancel,
    pause,
    resume,
    toggleMute,
    setMuted,
  };
}

/** Rough seconds for progress bar when speech timing is unknown */
export function estimateNarrationSeconds(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(8, Math.ceil(words / 2.1));
}
