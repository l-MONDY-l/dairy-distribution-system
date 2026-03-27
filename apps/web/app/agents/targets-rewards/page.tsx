'use client';

import Link from 'next/link';
import AppLayout from '@/components/layout/app-layout';

export default function AgentTargetsRewardsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Track sales targets, achievement, and rewards for field agents.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 md:p-6">
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3 md:max-w-4xl">
            <Link
              href="/agents"
              className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left text-xs text-slate-200 hover:border-emerald-500 hover:bg-slate-800 min-h-[7rem] flex flex-col justify-center"
            >
              <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                Agent status
              </span>
              <p className="mt-1 text-[11px] text-slate-500">
                Current activity, performance, and status by agent.
              </p>
            </Link>
            <Link
              href="/agents/stock-returns"
              className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left text-xs text-slate-200 hover:border-emerald-500 hover:bg-slate-800 min-h-[7rem] flex flex-col justify-center"
            >
              <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                Agent stock &amp; returns
              </span>
              <p className="mt-1 text-[11px] text-slate-500">
                Allocated stock, usage, and returns overview.
              </p>
            </Link>
            <div className="rounded-2xl border border-emerald-500/60 bg-emerald-500/15 p-4 text-left text-xs font-medium text-slate-100 ring-2 ring-emerald-500/30 min-h-[7rem] flex flex-col justify-center">
              <span className="block text-2xl font-bold text-white">–</span>
              <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                Agent targets &amp; rewards
              </span>
              <p className="mt-1 text-[11px] text-slate-400/80">
                Track targets, performance, and incentive rewards.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-sm text-slate-300">
            This page will show monthly/quarterly targets, progress, and reward
            summaries for each agent. It currently acts as a dedicated landing
            tab so you can design the KPIs you want.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

