'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { getShops } from '@/lib/shops-api';
import { getAgents } from '@/lib/agents-api';
import { getDrivers } from '@/lib/drivers-api';
import { getProducts } from '@/lib/products-api';
import {
  createReturn,
  getReturns,
  updateReturnStatus,
} from '@/lib/returns-api';
import type {
  AgentProfile,
  CreateReturnItemInput,
  CreateReturnPayload,
  DriverProfile,
  Product,
  ReturnRecord,
  ReturnStatusType,
  Shop,
} from '@/lib/types';

const emptyItem: CreateReturnItemInput = {
  productId: '',
  goodQty: 0,
  brokenQty: 0,
  missingQty: 0,
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [shopId, setShopId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<CreateReturnItemInput[]>([emptyItem]);

  const [filterShopId, setFilterShopId] = useState('');
  const [filterStatus, setFilterStatus] =
    useState<ReturnStatusType | ''>('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const shopOptions = useMemo(
    () =>
      shops.map((s) => ({
        value: s.id,
        label: `${s.code} - ${s.shopName}`,
      })),
    [shops],
  );

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.sku})`,
      })),
    [products],
  );

  const agentOptions = useMemo(
    () =>
      agents.map((a) => ({
        value: a.id,
        label: a.user.fullName,
      })),
    [agents],
  );

  const driverOptions = useMemo(
    () =>
      drivers.map((d) => ({
        value: d.id,
        label: d.user.fullName,
      })),
    [drivers],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [returnsData, shopsData, agentsData, driversData, productsData] =
        await Promise.all([
          getReturns({
            shopId: filterShopId || undefined,
            status: (filterStatus as ReturnStatusType) || undefined,
            from: filterFrom || undefined,
            to: filterTo || undefined,
          }),
          getShops(),
          getAgents(),
          getDrivers(),
          getProducts(),
        ]);

      setReturns(returnsData);
      setShops(shopsData);
      setAgents(agentsData);
      setDrivers(driversData);
      setProducts(productsData);
    } catch {
      setError('Failed to load returns data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const reloadWithFilters = async () => {
    await loadData();
  };

  const handleItemChange = (
    index: number,
    field: keyof CreateReturnItemInput,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === 'productId'
                  ? value
                  : Math.max(0, Number(value) || 0),
            }
          : item,
      ),
    );
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, emptyItem]);
  };

  const removeItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!shopId) {
        setError('Select a shop.');
        return;
      }

      const cleanedItems = items.filter((i) => {
        const total = i.goodQty + i.brokenQty + i.missingQty;
        return i.productId && total > 0;
      });

      if (!cleanedItems.length) {
        setError('Add at least one item with quantity.');
        return;
      }

      if (!agentId && !driverId) {
        setError('Select an agent or driver.');
        return;
      }

      const payload: CreateReturnPayload = {
        shopId,
        agentId: agentId || undefined,
        driverId: driverId || undefined,
        notes: notes.trim() || undefined,
        items: cleanedItems,
      };

      await createReturn(payload);

      setSuccess('Return created successfully.');
      setShopId('');
      setAgentId('');
      setDriverId('');
      setNotes('');
      setItems([emptyItem]);

      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create return.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: ReturnStatusType,
  ) => {
    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      await updateReturnStatus(id, status);

      setSuccess(`Return ${status.toLowerCase()} successfully.`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update return.');
    } finally {
      setUpdating(false);
    }
  };

  const statusBadgeClass = (status: ReturnStatusType) => {
    if (status === 'APPROVED') return 'bg-emerald-500/15 text-emerald-400';
    if (status === 'REJECTED') return 'bg-red-500/15 text-red-400';
    return 'bg-blue-500/15 text-blue-400';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Admin Module
          </p>
          <h1 className="mt-1 text-2xl font-bold">Return Stock Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Log and approve bottle returns by shop, agent, and driver.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Create Return</h2>

            <form onSubmit={handleCreateReturn} className="mt-6 space-y-4">
              <select
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Select Shop</option>
                {shopOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Select Agent (optional)</option>
                {agentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Select Driver (optional)</option>
                {driverOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="h-20 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Items
                  </h3>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    + Add Item
                  </button>
                </div>

                {items.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950 p-3"
                  >
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        handleItemChange(index, 'productId', e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="">Select product</option>
                      {productOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400">
                          Good
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={item.goodQty}
                          onChange={(e) =>
                            handleItemChange(index, 'goodQty', e.target.value)
                          }
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400">
                          Broken
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={item.brokenQty}
                          onChange={(e) =>
                            handleItemChange(index, 'brokenQty', e.target.value)
                          }
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400">
                          Missing
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={item.missingQty}
                          onChange={(e) =>
                            handleItemChange(index, 'missingQty', e.target.value)
                          }
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="mt-2 text-xs text-slate-400 hover:text-slate-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? 'Creating...' : 'Create Return'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Return Logs</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Approve or reject return entries per shop.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={filterShopId}
                  onChange={(e) => setFilterShopId(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                >
                  <option value="">All shops</option>
                  {shopOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as ReturnStatusType | '')
                  }
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                >
                  <option value="">All statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
                <input
                  type="date"
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                />
                <input
                  type="date"
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={reloadWithFilters}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  Loading returns...
                </div>
              ) : returns.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  No returns found.
                </div>
              ) : (
                <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800">
                  <thead className="bg-slate-950">
                    <tr className="text-left text-sm text-slate-400">
                      <th className="px-4 py-3 font-medium">Return No</th>
                      <th className="px-4 py-3 font-medium">Shop</th>
                      <th className="px-4 py-3 font-medium">Agent/Driver</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Requested</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returns.map((ret) => (
                      <tr
                        key={ret.id}
                        className="border-t border-slate-800 bg-slate-900 text-sm"
                      >
                        <td className="px-4 py-3 text-slate-200">
                          {ret.returnNo}
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          {ret.shop.shopName}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {ret.agent?.user.fullName ||
                            ret.driver?.user.fullName ||
                            '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                              ret.status,
                            )}`}
                          >
                            {ret.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(ret.requestedAt)
                            .toISOString()
                            .slice(0, 10)}
                        </td>
                        <td className="px-4 py-3">
                          {ret.status === 'PENDING' ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={updating}
                                onClick={() =>
                                  void handleStatusUpdate(ret.id, 'APPROVED')
                                }
                                className="rounded-xl border border-emerald-500/60 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-500/15 disabled:opacity-60"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={updating}
                                onClick={() =>
                                  void handleStatusUpdate(ret.id, 'REJECTED')
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
      </div>
    </AppLayout>
  );
}

