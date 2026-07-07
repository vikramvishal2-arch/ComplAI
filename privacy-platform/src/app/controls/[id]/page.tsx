import { Suspense } from 'react';
import ControlDetailContent from './control-detail-content';

export default function ControlDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading control...</div>}>
      <ControlDetailContent />
    </Suspense>
  );
}
