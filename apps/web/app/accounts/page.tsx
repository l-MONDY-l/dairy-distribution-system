'use client';

import AppLayout from '@/components/layout/app-layout';

export default function AccountsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Accounts</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage account balances, settlements, and reconciliation. This page is ready for detailed features later.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

