'use client';

import { Suspense } from 'react';
import EmployeeApprovalReviewContent from './review-content';

export default function EmployeeApprovalReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
          Loading review…
        </div>
      }
    >
      <EmployeeApprovalReviewContent />
    </Suspense>
  );
}
