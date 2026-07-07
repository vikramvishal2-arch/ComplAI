'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import {
  createPiaMessage,
  getPiaReplyForQuickPrompt,
  getPiaReplyForUserMessage,
  PIA_GREETING,
  PIA_QUICK_PROMPTS,
  PIA_VISITOR_PROMPT,
  type PiaChatMessage,
} from '@/lib/data/pia-chatbot';
import { useMarketingPathname } from '@/hooks/use-marketing-pathname';
import { cn } from '@/lib/utils';

const TEASER_KEY = 'pia-teaser-dismissed';
const OPEN_KEY = 'pia-chat-opened';

function PiaAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-scrut-gradient text-sm font-bold text-black shadow-sm',
        className
      )}
      aria-hidden
    >
      P
    </div>
  );
}

function MessageBubble({ message }: { message: PiaChatMessage }) {
  const isPia = message.role === 'pia';

  return (
    <div className={cn('flex gap-2.5', isPia ? 'justify-start' : 'justify-end')}>
      {isPia && <PiaAvatar className="mt-0.5 h-8 w-8 text-xs" />}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isPia
            ? 'rounded-tl-md border border-white/10 bg-scrut-navy-light text-zinc-200'
            : 'rounded-tr-md bg-emerald-500 text-black'
        )}
      >
        <p>{message.text}</p>
        {message.links && message.links.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {message.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30 transition-colors hover:bg-emerald-500/20"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PiaChatbot() {
  const pathname = useMarketingPathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [messages, setMessages] = useState<PiaChatMessage[]>(() => [
    createPiaMessage('pia', { text: PIA_GREETING }),
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(TEASER_KEY)) return;

    const timer = window.setTimeout(() => setShowTeaser(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
    setShowTeaser(false);
  }, [pathname]);

  const dismissTeaser = useCallback(() => {
    setShowTeaser(false);
    sessionStorage.setItem(TEASER_KEY, '1');
  }, []);

  const openChat = useCallback(() => {
    dismissTeaser();
    setIsOpen(true);
    sessionStorage.setItem(OPEN_KEY, '1');
  }, [dismissTeaser]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const appendPiaReply = useCallback((payload: Omit<PiaChatMessage, 'id' | 'role'>) => {
    setIsTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, createPiaMessage('pia', payload)]);
      setIsTyping(false);
    }, 450);
  }, []);

  const handleQuickPrompt = useCallback(
    (id: (typeof PIA_QUICK_PROMPTS)[number]['id'], label: string) => {
      setMessages((prev) => [...prev, createPiaMessage('user', { text: label })]);
      appendPiaReply(getPiaReplyForQuickPrompt(id));
    },
    [appendPiaReply]
  );

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setInput('');
    setMessages((prev) => [...prev, createPiaMessage('user', { text: trimmed })]);
    appendPiaReply(getPiaReplyForUserMessage(trimmed));
  }, [appendPiaReply, input, isTyping]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3 safe-bottom sm:bottom-6 sm:right-6" style={{ paddingRight: 'env(safe-area-inset-right, 0px)' }}>
      {showTeaser && !isOpen && (
        <div className="pointer-events-auto relative max-w-[min(320px,calc(100vw-2rem))]">
          <button
            type="button"
            onClick={dismissTeaser}
            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-white shadow-md hover:bg-slate-600"
            aria-label="Dismiss Pia message"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={openChat}
            className="flex w-full items-start gap-3 rounded-2xl border border-emerald-500/25 bg-scrut-navy-light p-4 text-left shadow-xl shadow-black/30 ring-1 ring-white/10 transition-colors hover:border-emerald-500/40"
          >
            <PiaAvatar />
            <div>
              <p className="text-sm font-semibold text-white">
                Pia <Sparkles className="ml-1 inline h-3.5 w-3.5 text-emerald-400" />
              </p>
              <p className="mt-1 text-sm leading-snug text-zinc-300">{PIA_VISITOR_PROMPT}</p>
              <span className="mt-2 inline-block text-xs font-semibold text-emerald-400">
                Ask Pia →
              </span>
            </div>
          </button>
        </div>
      )}

      {isOpen && (
        <div
          className="pointer-events-auto flex w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-marketing-surface shadow-2xl shadow-black/40 ring-1 ring-emerald-500/15"
          role="dialog"
          aria-label="Chat with Pia"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-scrut-navy-light/90 px-4 py-3">
            <div className="flex items-center gap-3">
              <PiaAvatar />
              <div>
                <p className="text-sm font-semibold text-white">Pia</p>
                <p className="text-xs text-emerald-400">Propel Ready assistant</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="max-h-[min(420px,50vh)] space-y-3 overflow-y-auto p-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <PiaAvatar className="h-7 w-7 text-[10px]" />
                <span className="animate-pulse">Pia is typing…</span>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-scrut-navy-light/50 px-3 py-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {PIA_QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  disabled={isTyping}
                  onClick={() => handleQuickPrompt(prompt.id, prompt.label)}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-emerald-500/30 hover:text-emerald-300 disabled:opacity-50"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Pia about ComplAI, compliance, or demos…"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-marketing-surface px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-black transition-opacity hover:bg-emerald-400 disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-scrut-gradient px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-black/30 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label="Open chat with Pia"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Pia</span>
        </button>
      )}
    </div>
  );
}
