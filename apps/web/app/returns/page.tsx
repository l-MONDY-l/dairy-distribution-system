'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { getShops } from '@/lib/shops-api';
import { getAgents } from '@/lib/agents-api';
import { getDrivers } from '@/lib/drivers-api';
import { getProducts } from '@/lib/products-api';
import {
  createReturn,
  deleteReturn,
  getReturns,
  updateReturn,
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingReturn, setEditingReturn] = useState<ReturnRecord | null>(null);
  const [editNotes, setEditNotes] = useState('');

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

  const returnLogsRef = useRef<HTMLDivElement>(null);

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
      returnLogsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      setUpdatingId(id);
      setError('');
      setSuccess('');

      await updateReturnStatus(id, status);

      setSuccess(`Return ${status.toLowerCase()} successfully.`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update return.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEditReturn = (ret: ReturnRecord) => {
    setEditingReturn(ret);
    setEditNotes(ret.notes ?? '');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReturn) return;
    try {
      setUpdatingId(editingReturn.id);
      setError('');
      setSuccess('');
      await updateReturn(editingReturn.id, { notes: editNotes.trim() || undefined });
      setSuccess('Return updated successfully.');
      setEditingReturn(null);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update return.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteReturn = async (ret: ReturnRecord) => {
    if (
      !window.confirm(
        `Do you want to delete this return? (${ret.returnNo})\n\nThis cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      setDeletingId(ret.id);
      setError('');
      setSuccess('');
      await deleteReturn(ret.id);
      setSuccess('Return deleted successfully.');
      setReturns((prev) => prev.filter((r) => r.id !== ret.id));
      if (editingReturn?.id === ret.id) setEditingReturn(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete return.');
    } finally {
      setDeletingId(null);
    }
  };

  const statusBadgeClass = (status: ReturnStatusType) => {
    if (status === 'APPROVED') return 'bg-emerald-500/15 text-emerald-400';
    if (status === 'REJECTED') return 'bg-red-500/15 text-red-400';
    if (status === 'HOLD') return 'bg-amber-500/15 text-amber-400';
    return 'bg-blue-500/15 text-blue-400';
  };

  const canChangeStatus = (ret: ReturnRecord) =>
    ret.status === 'PENDING' || ret.status === 'HOLD';
  const canEdit = (ret: ReturnRecord) =>
    ret.status === 'PENDING' || ret.status === 'HOLD';

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
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

          <div ref={returnLogsRef} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
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
                  <option value="HOLD">HOLD</option>
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
                          <div className="flex flex-wrap gap-2">
                            {canChangeStatus(ret) && (
                              <>
                                <button
                                  type="button"
                                  disabled={updatingId !== null}
                                  onClick={() =>
                                    void handleStatusUpdate(ret.id, 'APPROVED')
                                  }
                                  className="rounded-xl border border-emerald-500/60 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-500/15 disabled:opacity-60"
                                >
                                  Approve
                                </button>
                                {ret.status === 'PENDING' && (
                                  <button
                                    type="button"
                                    disabled={updatingId !== null}
                                    onClick={() =>
                                      void handleStatusUpdate(ret.id, 'HOLD')
                                    }
                                    className="rounded-xl border border-amber-500/60 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/15 disabled:opacity-60"
                                  >
                                    Hold
                                  </button>
                                )}
                                <button
                                  type="button"
                                  disabled={updatingId !== null}
                                  onClick={() =>
                                    void handleStatusUpdate(ret.id, 'REJECTED')
                                  }
                                  className="rounded-xl border border-red-500/60 px-3 py-2 text-xs text-red-300 hover:bg-red-500/15 disabled:opacity-60"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {canEdit(ret) && (
                              <button
                                type="button"
                                disabled={updatingId !== null}
                                onClick={() => handleEditReturn(ret)}
                                className="rounded-xl border border-slate-600 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={deletingId !== null}
                              onClick={() => handleDeleteReturn(ret)}
                              className="rounded-xl border border-red-500/70 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                            >
                              {deletingId === ret.id ? 'Deleting…' : 'Delete'}
                            </button>
                          </div>
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

      {editingReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">
                Edit Return {editingReturn.returnNo}
              </h2>
              <button
                type="button"
                onClick={() => setEditingReturn(null)}
                disabled={updatingId !== null}
                className="rounded-xl border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-60"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  rows={3}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingReturn(null)}
                  disabled={updatingId !== null}
                  className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId !== null}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {updatingId === editingReturn.id ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

