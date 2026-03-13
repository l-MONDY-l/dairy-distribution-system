'use client';

import type { CompanyProfileCompletionResponse } from '@/lib/types/company-profile';

type Props = {
  completion: CompanyProfileCompletionResponse | null;
};

export function CompanyProfileProgress({ completion }: Props) {
  const percentage = completion?.percentage ?? 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Profile Completion</h3>
          <p className="mt-1 text-xs text-slate-400">
            Fill in company details to unlock all modules.
          </p>
        </div>
        <span className="text-sm font-semibold text-emerald-400">{percentage}%</span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {completion && completion.missingSections.length > 0 && (
        <p className="mt-2 text-[11px] text-slate-400">
          Missing sections:{' '}
          <span className="text-amber-300">
            {completion.missingSections
              .map((s) => s.replace(/([A-Z])/g, ' $1').trim())
              .join(', ')}
          </span>
        </p>
      )}
    </div>
  );
}

