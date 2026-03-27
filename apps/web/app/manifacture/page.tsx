'use client';

import AppLayout from '@/components/layout/app-layout';

export default function ManifacturePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manufacture</h1>
          <p className="mt-1 text-slate-400">
            Configure and monitor manufacturing-related data. This section uses the standard app layout and theme.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

