'use client';

import AppLayout from '@/components/layout/app-layout';

export default function CreditsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Credits & Accounts</h1>
          <p className="mt-1 text-sm text-slate-400">
            Overview of customer credit limits, outstanding balances, and account status.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300">
          This section is ready for your future credit control features
          (limits, aging, settlements). For now it uses the standard layout so navigation works.
        </div>
      </div>
    </AppLayout>
  );
}

