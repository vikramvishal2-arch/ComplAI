'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ComplAILogo } from '@/components/brand/complai-logo';
import { PRODUCT_NAME } from '@/lib/brand';
import { LockKeyhole } from 'lucide-react';

export function DemoAccessForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/demo/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not sign in to the demo portal');
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <ComplAILogo showTagline />
        </div>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Sign in to ComplAI Lab</h1>
          <p className="mt-2 text-sm text-slate-500">
            Use the demo credentials provided by your Propel Ready contact to explore{' '}
            {PRODUCT_NAME} modules. Dashboard and frameworks are view-only for customer demos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="demo-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="demo-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="demo-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="demo-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in to demo portal'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Need a guided walkthrough?{' '}
          <Link href="/company?contact=1" className="font-medium text-brand-600 hover:underline">
            Book a demo
          </Link>
        </p>
      </div>
    </div>
  );
}
