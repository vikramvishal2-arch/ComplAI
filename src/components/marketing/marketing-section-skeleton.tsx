export function MarketingSectionSkeleton({
  minHeight = 320,
  className = '',
}: {
  minHeight?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/[0.04] ${className}`}
      style={{ minHeight }}
      aria-hidden
    />
  );
}
