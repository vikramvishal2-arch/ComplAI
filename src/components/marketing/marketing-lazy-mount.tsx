'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type MarketingLazyMountProps = {
  children: ReactNode;
  fallback: ReactNode;
  minHeight?: number;
  rootMargin?: string;
};

/** Mount children only when near the viewport — defers heavy JS until the user scrolls. */
export function MarketingLazyMount({
  children,
  fallback,
  minHeight = 320,
  rootMargin = '280px 0px',
}: MarketingLazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [mounted, rootMargin]);

  return (
    <div ref={ref} style={{ minHeight }}>
      {mounted ? children : fallback}
    </div>
  );
}
