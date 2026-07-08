'use client';

import { useEffect, useState } from 'react';

export type DemoSessionInfo = {
  signedIn: boolean;
  portalEnabled: boolean;
  role: 'admin' | 'customer';
  email: string;
  displayName: string;
  readOnlyAreas: string[];
  canAccessSettings: boolean;
};

const DEFAULT_SESSION: DemoSessionInfo = {
  signedIn: false,
  portalEnabled: false,
  role: 'customer',
  email: '',
  displayName: '',
  readOnlyAreas: [],
  canAccessSettings: false,
};

export function useDemoSession() {
  const [session, setSession] = useState<DemoSessionInfo>(DEFAULT_SESSION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/demo/session', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setSession({
          signedIn: Boolean(data.signedIn),
          portalEnabled: Boolean(data.portalEnabled),
          role: data.role === 'admin' ? 'admin' : 'customer',
          email: data.email ?? '',
          displayName: data.displayName ?? '',
          readOnlyAreas: Array.isArray(data.readOnlyAreas) ? data.readOnlyAreas : [],
          canAccessSettings: Boolean(data.canAccessSettings),
        });
      })
      .catch(() => {
        if (!cancelled) setSession(DEFAULT_SESSION);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ...session,
    loading,
    isCustomer: session.role === 'customer',
    isAdmin: session.role === 'admin',
    isReadOnlyArea: (area: string) => session.readOnlyAreas.includes(area),
  };
}
