'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function CopilotChat({ controlId }: { controlId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    const userMsg: Message = { role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          controlId,
          history: messages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Request failed');
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const suggestions = controlId
    ? [
        'What evidence do I need for audit readiness?',
        'Suggest an implementation approach for this control.',
        'What are the top remediation steps?',
      ]
    : [
        'Summarize our compliance posture.',
        'Which controls need attention before audit?',
        'How should we prioritize red controls?',
      ];

  return (
    <div className="flex h-[480px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="rounded-lg bg-brand-50 p-4 text-sm text-brand-900">
            <p className="font-medium">Ask ComplAI Copilot anything about GRC.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs text-brand-700 hover:bg-brand-100"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                <Bot className="h-4 w-4 text-brand-600" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 text-slate-800'
              )}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200">
                <User className="h-4 w-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {error && (
        <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>
      )}
      <div className="flex gap-2 border-t border-slate-200 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Ask about controls, gaps, remediation, audit prep…"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={send}
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
