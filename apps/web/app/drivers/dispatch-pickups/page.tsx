'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/app-layout';

type DriverTab = 'DISPATCH' | 'PICKUPS';

export default function DriverDispatchPickupsPage() {
  const [activeTab, setActiveTab] = useState<DriverTab>('DISPATCH');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Driver Module
          </p>
          <div>
            <h1 className="mt-1 text-2xl font-bold">Dispatch &amp; pickups</h1>
            <p className="mt-1 text-sm text-slate-400">
              Plan daily dispatches and view completed pickups for each driver.
            </p>
          </div>
        </div>

        <div className="flex gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-1 text-xs font-medium text-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab('DISPATCH')}
            className={`flex-1 rounded-xl px-3 py-2 transition ${
              activeTab === 'DISPATCH'
                ? 'bg-emerald-500 text-slate-950'
                : 'hover:bg-slate-900'
            }`}
          >
            Dispatch
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PICKUPS')}
            className={`flex-1 rounded-xl px-3 py-2 transition ${
              activeTab === 'PICKUPS'
                ? 'bg-emerald-500 text-slate-950'
                : 'hover:bg-slate-900'
            }`}
          >
            Pickups
          </button>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          {activeTab === 'DISPATCH' ? (
            <div className="space-y-3 text-sm text-slate-300">
              <h2 className="text-base font-semibold text-white">
                Dispatch planning (coming soon)
              </h2>
              <p>
                This screen will show pending orders assigned to drivers, with
                routes and dispatch schedules.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-slate-300">
              <h2 className="text-base font-semibold text-white">
                Pickups tracking (coming soon)
              </h2>
              <p>
                This screen will show completed deliveries / pickups with
                status, quantities, and return notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

