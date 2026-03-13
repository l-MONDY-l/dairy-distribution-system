'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { getAgents } from '@/lib/agents-api';
import type { AgentProfile } from '@/lib/types';
import { api } from '@/lib/api';

type AgentSummary = {
  agentId: string;
  name: string;
  region: string;
  netSales: number;
  orders: number;
};

export default function AgentsReportPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [topAgents, setTopAgents] = useState<AgentSummary[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const a = await getAgents();
        setAgents(a);
      } catch {
        setError('Failed to load agents.');
      }
    })();
  }, []);

  const loadTop = async () => {
    try {
      setError('');
      const res = await api.get('/agents/admin/top', {
        params: { from: from || undefined, to: to || undefined },
      });
      setTopAgents(res.data);
    } catch {
      setError('Failed to load top agents.');
    }
  };

  useEffect(() => {
    void loadTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Reports
          </p>
          <h1 className="mt-1 text-2xl font-bold">Sales & Targets</h1>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
          />
          <button
            onClick={loadTop}
            className="rounded-2xl border border-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-800"
          >
            Apply
          </button>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Top Agents by Net Sales</h2>
          <div className="mt-4 overflow-x-auto">
            {topAgents.length === 0 ? (
              <div className="text-sm text-slate-400">
                No data for this period.
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-2 text-left">Agent</th>
                    <th className="px-4 py-2 text-left">Region</th>
                    <th className="px-4 py-2 text-right">Orders</th>
                    <th className="px-4 py-2 text-right">Net Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {topAgents.map((a) => (
                    <tr
                      key={a.agentId}
                      className="border-t border-slate-800 bg-slate-900"
                    >
                      <td className="px-4 py-2 text-slate-200">{a.name}</td>
                      <td className="px-4 py-2 text-slate-300">
                        {a.region}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-300">
                        {a.orders}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-200">
                        LKR {a.netSales.toFixed(2)}
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

