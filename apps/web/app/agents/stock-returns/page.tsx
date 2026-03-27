'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { getAgents } from '@/lib/agents-api';
import type { AgentProfile } from '@/lib/types';

export default function AgentStockReturnsPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getAgents();
        setAgents(data);
      } catch {
        setError('Failed to load agents.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            View agent territories alongside stock allocation and returns.
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
            <div className="rounded-2xl border border-emerald-500/60 bg-emerald-500/15 p-4 text-left text-xs font-medium text-slate-100 ring-2 ring-emerald-500/30 min-h-[7rem] flex flex-col justify-center">
              <span className="block text-2xl font-bold text-white">
                {agents.length}
              </span>
              <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                Agent stock &amp; returns
              </span>
              <p className="mt-1 text-[11px] text-slate-400/80">
                Allocated stock, usage, and returns overview.
              </p>
            </div>
            <Link
              href="/agents/targets-rewards"
              className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-left text-xs text-slate-200 hover:border-emerald-500 hover:bg-slate-800 min-h-[7rem] flex flex-col justify-center"
            >
              <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                Agent targets &amp; rewards
              </span>
              <p className="mt-1 text-[11px] text-slate-500">
                Track targets, performance, and incentive rewards.
              </p>
            </Link>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-4 overflow-x-auto">
            {loading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                Loading agents...
              </div>
            ) : (
              <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800 text-sm">
                <thead className="bg-slate-950 text-xs text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Agent</th>
                    <th className="px-4 py-3 text-left font-medium">Region</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Contact number
                    </th>
                    <th className="px-4 py-3 text-left font-medium">City</th>
                    <th className="px-4 py-3 text-left font-medium">Town</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Allocated stock
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Claimed / used
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Remaining
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Returns
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-t border-slate-800 bg-slate-900 text-slate-200"
                    >
                      <td className="px-4 py-3 font-medium">
                        {agent.user.fullName}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {agent.region.name}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {agent.user.email}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {agent.user.phone ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {(() => {
                          const directCities =
                            agent.cityAssignments?.map((a) => a.city.name) ??
                            [];
                          const citiesFromTowns =
                            agent.townAssignments?.map(
                              (a) => a.town.city.name,
                            ) ?? [];
                          const allCities = Array.from(
                            new Set([...directCities, ...citiesFromTowns]),
                          ).filter(Boolean);
                          if (!allCities.length) return '—';
                          return allCities.join(', ');
                        })()}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {(() => {
                          const towns =
                            agent.townAssignments?.map(
                              (a) => a.town.name,
                            ) ?? [];
                          if (!towns.length) return '—';
                          return towns.join(', ');
                        })()}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-200">
                        0
                      </td>
                      <td className="px-4 py-3 text-right text-slate-200">
                        0
                      </td>
                      <td className="px-4 py-3 text-right text-slate-200">
                        0
                      </td>
                      <td className="px-4 py-3 text-right text-slate-200">
                        0
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="rounded-xl border border-slate-600 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
                        >
                          View return details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

