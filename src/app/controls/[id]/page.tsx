import { Suspense } from 'react';
import ControlDetailPage from './control-detail-content';

export default function ControlDetailRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />
        </div>
      }
    >
      <ControlDetailPage />
    </Suspense>
  );
}
