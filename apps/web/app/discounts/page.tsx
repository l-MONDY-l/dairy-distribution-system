'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { getShops } from '@/lib/shops-api';
import { getAgents } from '@/lib/agents-api';
import type { AgentProfile, Shop } from '@/lib/types';
import {
  approveDiscount,
  getDiscounts,
  rejectDiscount,
  type DiscountRecord,
} from '@/lib/discounts-api';
import { getUser } from '@/lib/auth';

export default function DiscountsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [discounts, setDiscounts] = useState<DiscountRecord[]>([]);
  const [shopId, setShopId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [status, setStatus] = useState<
    'PENDING' | 'APPROVED' | 'REJECTED' | ''
  >('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const currentUser = getUser();

  const loadData = async () => {
    try {
      setError('');
      const [shopsData, agentsData, discountsData] = await Promise.all([
        getShops(),
        getAgents(),
        getDiscounts({
          shopId: shopId || undefined,
          agentId: agentId || undefined,
          status: (status as any) || undefined,
          from: from || undefined,
          to: to || undefined,
        }),
      ]);

      setShops(shopsData);
      setAgents(agentsData);
      setDiscounts(discountsData);
    } catch {
      setError('Failed to load discount data.');
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (
    discountId: string,
    approve: boolean,
  ) => {
    if (!currentUser) return;
    try {
      setSaving(true);
      setError('');
      if (approve) {
        await approveDiscount(discountId, currentUser.id);
      } else {
        await rejectDiscount(discountId, currentUser.id);
      }
      await loadData();
    } catch {
      setError('Failed to update discount.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="mt-1 text-2xl font-bold">
            Discounts & Special Pricing
          </h1>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <select
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
          >
            <option value="">All shops</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.shopName}
              </option>
            ))}
          </select>

          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
          >
            <option value="">All agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.user.fullName}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED' | '',
              )
            }
            className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
          >
            <option value="">All statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

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
            onClick={loadData}
            className="rounded-2xl border border-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-800"
          >
            Apply
          </button>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Discounts</h2>

          <div className="mt-4 overflow-x-auto">
            {discounts.length === 0 ? (
              <div className="text-sm text-slate-400">
                No discounts found.
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Shop</th>
                    <th className="px-4 py-2 text-left">Agent</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-right">Value</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((d) => (
                    <tr
                      key={d.id}
                      className="border-t border-slate-800 bg-slate-900"
                    >
                      <td className="px-4 py-2 text-slate-400">
                        {new Date(d.createdAt).toISOString().slice(0, 10)}
                      </td>
                      <td className="px-4 py-2 text-slate-200">
                        {d.shop.shopName}
                      </td>
                      <td className="px-4 py-2 text-slate-200">
                        {d.agent?.user.fullName || '-'}
                      </td>
                      <td className="px-4 py-2 text-slate-300">
                        {d.discountType}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-200">
                        {d.discountType === 'PERCENTAGE'
                          ? `${Number(d.discountValue).toFixed(2)}%`
                          : `LKR ${Number(d.discountValue).toFixed(2)}`}
                      </td>
                      <td className="px-4 py-2 text-slate-300">
                        {d.approvalStatus}
                      </td>
                      <td className="px-4 py-2">
                        {d.approvalStatus === 'PENDING' ? (
                          <div className="flex gap-2">
                            <button
                              disabled={saving}
                              onClick={() =>
                                void handleStatusChange(d.id, true)
                              }
                              className="rounded-xl border border-emerald-500/60 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-500/15 disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              disabled={saving}
                              onClick={() =>
                                void handleStatusChange(d.id, false)
                              }
                              className="rounded-xl border border-red-500/60 px-3 py-2 text-xs text-red-300 hover:bg-red-500/15 disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">
                            No actions
                          </span>
                        )}
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

