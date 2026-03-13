'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { getShops } from '@/lib/shops-api';
import { getAgents } from '@/lib/agents-api';
import { getDrivers } from '@/lib/drivers-api';
import { getOrderReport, exportOrderReport } from '@/lib/order-report-api';
import type { Order, Shop, AgentProfile, DriverProfile } from '@/lib/types';

export default function OrdersReportPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shopId, setShopId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [shopsData, agentsData, driversData, ordersData] = await Promise.all([
        getShops(),
        getAgents(),
        getDrivers(),
        getOrderReport({
          shopId: shopId || undefined,
          agentId: agentId || undefined,
          driverId: driverId || undefined,
          status: (status as any) || undefined,
          from: from || undefined,
          to: to || undefined,
        }),
      ]);
      setShops(shopsData);
      setAgents(agentsData);
      setDrivers(driversData);
      setOrders(ordersData);
    } catch {
      setError('Failed to load order report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = () => {
    exportOrderReport({
      shopId: shopId || undefined,
      agentId: agentId || undefined,
      driverId: driverId || undefined,
      status: status || undefined,
      from: from || undefined,
      to: to || undefined,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Reports
          </p>
          <h1 className="mt-1 text-2xl font-bold">Order Report</h1>
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
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
          >
            <option value="">All drivers</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.user.fullName}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
          >
            <option value="">All statuses</option>
            <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
            <option value="APPROVED">APPROVED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="DISPATCHED">DISPATCHED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
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

          <button
            type="button"
            onClick={handleExport}
            className="rounded-2xl border border-emerald-500 px-4 py-2 text-emerald-300 hover:bg-emerald-500/10"
          >
            Export CSV
          </button>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Orders</h2>
            <span className="text-sm text-slate-400">
              Total: {orders.length}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            {loading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                Loading...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-sm text-slate-400">
                No orders for this filter.
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-2 text-left">Order No</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Shop</th>
                    <th className="px-4 py-2 text-left">Agent</th>
                    <th className="px-4 py-2 text-left">Driver</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-slate-800 bg-slate-900"
                    >
                      <td className="px-4 py-2 text-slate-200">
                        {o.orderNo}
                      </td>
                      <td className="px-4 py-2 text-slate-400">
                        {new Date(o.orderedAt).toISOString().slice(0, 10)}
                      </td>
                      <td className="px-4 py-2 text-slate-200">
                        {o.shop.shopName}
                      </td>
                      <td className="px-4 py-2 text-slate-300">
                        {o.agent?.user.fullName || '-'}
                      </td>
                      <td className="px-4 py-2 text-slate-300">
                        {o.driver?.user.fullName || '-'}
                      </td>
                      <td className="px-4 py-2 text-slate-300">
                        {o.orderStatus}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-200">
                        LKR {Number(o.grandTotal).toFixed(2)}
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

