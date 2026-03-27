'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { getShops } from '@/lib/shops-api';
import { getAgents } from '@/lib/agents-api';
import { getDrivers } from '@/lib/drivers-api';
import { getProducts } from '@/lib/products-api';
import { getStockBatches } from '@/lib/stock-batches-api';
import {
  createClientOrder,
  deleteClientOrder,
  getClientOrders,
  updateClientOrder,
  type UpdateClientOrderPayload,
} from '@/lib/client-orders-api';
import type {
  AgentProfile,
  CreateOrderPayload,
  Order,
  OrderItemInput,
  DriverProfile,
  Product,
  Shop,
  StockBatch,
} from '@/lib/types';
import { getUser } from '@/lib/auth';

const paymentTypes = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ONLINE', label: 'Online' },
] as const;

const emptyItem: OrderItemInput = {
  productId: '',
  stockBatchId: '',
  qty: 1,
};

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockBatches, setStockBatches] = useState<StockBatch[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<Order['orderStatus'] | ''>('');
  const [editNotes, setEditNotes] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editPaymentType, setEditPaymentType] =
    useState<CreateOrderPayload['paymentType']>('CASH');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editAgentId, setEditAgentId] = useState<string>('');
  const [editDriverId, setEditDriverId] = useState<string>('');

  const [shopId, setShopId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [paymentType, setPaymentType] =
    useState<CreateOrderPayload['paymentType']>('CASH');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItemInput[]>([emptyItem]);
  const [shopSearch, setShopSearch] = useState('');

  const [orderFilter, setOrderFilter] = useState<
    'PENDING' | 'APPROVED' | 'HOLD' | 'CANCELLED' | 'REJECTED' | 'ALL'
  >('PENDING');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [confirmAction, setConfirmAction] = useState<
    | null
    | {
        type: 'edit' | 'approve' | 'hold' | 'cancel' | 'reject' | 'delete';
        order: Order;
      }
  >(null);

  const currentUser = getUser();

  const handleShopChange = (value: string) => {
    setShopId(value);
    const s = shops.find((sh) => sh.id === value);
    if (s?.assignedAgent) {
      setAgentId(s.assignedAgent.id);
    } else {
      setAgentId('');
    }
    if (s?.assignedDriver) {
      setDriverId(s.assignedDriver.id);
    } else {
      setDriverId('');
    }
  };

  const filteredShops = useMemo(() => {
    const query = shopSearch.trim().toLowerCase();
    if (!query) return shops;

    return shops.filter((s) => {
      const name = s.shopName?.toLowerCase() ?? '';
      const code = s.code?.toLowerCase() ?? '';
      const phone = (s as any)?.ownerPhone?.toString().toLowerCase() ?? '';
      const ownerNic = (s as any)?.ownerNationalId?.toLowerCase() ?? '';
      return (
        name.includes(query) ||
        code.includes(query) ||
        phone.includes(query) ||
        ownerNic.includes(query)
      );
    });
  }, [shops, shopSearch]);

  useEffect(() => {
    if (filteredShops.length === 1 && shopSearch.trim()) {
      const only = filteredShops[0];
      if (only && shopId !== only.id) {
        handleShopChange(only.id);
      }
    }
  }, [filteredShops, shopSearch, shopId]);

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

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.sku})`,
      })),
    [products],
  );

  const stockStatsByProduct = useMemo(() => {
    const map: Record<
      string,
      { totalQty: number; totalSold: number; totalRemaining: number }
    > = {};
    for (const b of stockBatches) {
      const id = b.productId;
      if (!map[id]) {
        map[id] = { totalQty: 0, totalSold: 0, totalRemaining: 0 };
      }
      map[id].totalQty += b.quantity ?? 0;
      map[id].totalSold += b.soldQty ?? 0;
      map[id].totalRemaining += b.remainingQty ?? 0;
    }
    return map;
  }, [stockBatches]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Always load master data (shops, agents, drivers, products, stock)
      const [shopsData, agentsData, productsData, driversData, batchesData] =
        await Promise.all([
          getShops(),
          getAgents(),
          getProducts(),
          getDrivers(),
          getStockBatches(),
        ]);

      setShops(shopsData);
      setAgents(agentsData);
      setProducts(productsData);
      setDrivers(driversData);
      setStockBatches(batchesData);

      // Load client orders separately so a missing/failed endpoint
      // does not break shop search / master data loading.
      try {
        const ordersData = await getClientOrders();
        setOrders(ordersData);
      } catch {
        setOrders([]);
        setError('Failed to load client orders list. Shops still loaded.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleItemChange = (
    index: number,
    field: keyof OrderItemInput,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === 'qty' ? Number(value) || 1 : value,
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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const cleanedItems = items.filter(
        (i) => i.productId && i.stockBatchId && i.qty && i.qty > 0,
      );

      if (!shopId) {
        setError('Select a shop.');
        return;
      }

      if (!cleanedItems.length) {
        setError('Add at least one product.');
        return;
      }

      const payload: CreateOrderPayload = {
        shopId,
        placedByUserId: currentUser.id,
        agentId: agentId || undefined,
        driverId: driverId || undefined,
        paymentType,
        notes: notes.trim() || undefined,
        items: cleanedItems,
      };

      await createClientOrder(payload);
      setSuccess('Client order created successfully.');

      setShopId('');
      setPaymentType('CASH');
      setNotes('');
      setItems([emptyItem]);

      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create client order.');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (order: Order) => {
    setEditingOrder(order);
    setEditOrderId(order.id);
    setEditStatus(order.orderStatus);
    setEditNotes(order.notes ?? '');
    setEditPaymentType(order.paymentType);
    setEditAgentId(order.agent?.id ?? '');
    setEditDriverId(order.driver?.id ?? '');
    setError('');
    setSuccess('');
  };

  const closeEdit = () => {
    if (!editSaving) {
      setEditOrderId(null);
      setEditStatus('');
      setEditNotes('');
      setEditingOrder(null);
      setEditAgentId('');
      setEditDriverId('');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrderId || !editStatus) return;
    try {
      setEditSaving(true);
      setError('');
      const payload: UpdateClientOrderPayload = {
        orderStatus: editStatus as Order['orderStatus'],
        notes: editNotes.trim() || undefined,
        paymentType: editPaymentType,
        performedByUserId: currentUser?.id,
        agentId: editAgentId || null,
        driverId: editDriverId || null,
      };
      await updateClientOrder(editOrderId, payload);
      setSuccess('Client order updated.');
      await loadData();
      closeEdit();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update client order.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleStatusUpdate = async (
    order: Order,
    status: UpdateClientOrderPayload['orderStatus'],
  ) => {
    try {
      setError('');
      await updateClientOrder(order.id, {
        orderStatus: status,
        performedByUserId: currentUser?.id,
      });
      setSuccess(`Client order ${order.orderNo} set to ${status}.`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (order: Order) => {
    try {
      setError('');
      await deleteClientOrder(order.id);
      setSuccess('Client order deleted.');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete client order.');
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, order } = confirmAction;
    try {
      if (type === 'edit') {
        openEdit(order);
      } else if (type === 'approve') {
        await handleStatusUpdate(order, 'APPROVED');
      } else if (type === 'hold') {
        await handleStatusUpdate(order, 'DRAFT');
      } else if (type === 'cancel') {
        await handleStatusUpdate(order, 'CANCELLED');
      } else if (type === 'reject') {
        await handleStatusUpdate(order, 'REJECTED');
      } else if (type === 'delete') {
        await handleDelete(order);
      }
    } finally {
      setConfirmAction(null);
    }
  };

  const filteredOrders = useMemo(() => {
    switch (orderFilter) {
      case 'PENDING':
        return orders.filter((o) => o.orderStatus === 'PENDING_APPROVAL');
      case 'APPROVED':
        return orders.filter((o) => o.orderStatus === 'APPROVED');
      case 'HOLD':
        return orders.filter((o) => o.orderStatus === 'DRAFT');
      case 'CANCELLED':
        return orders.filter((o) => o.orderStatus === 'CANCELLED');
      case 'REJECTED':
        return orders.filter((o) => o.orderStatus === 'REJECTED');
      case 'ALL':
        return orders;
      default:
        return orders;
    }
  }, [orders, orderFilter]);

  const orderStatusOptions: { value: Order['orderStatus']; label: string }[] = [
    { value: 'PENDING_APPROVAL', label: 'Pending orders' },
    { value: 'APPROVED', label: 'Approved orders' },
    { value: 'DRAFT', label: 'Hold orders' },
    { value: 'CANCELLED', label: 'Cancelled orders' },
    { value: 'REJECTED', label: 'Rejected orders' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Client Orders</h1>
            <p className="mt-1 text-sm text-slate-400">
              View and manage orders placed directly by clients. Create new
              orders via the button.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="ml-auto rounded-2xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Create Order
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          <button
            type="button"
            onClick={() => setOrderFilter('PENDING')}
            className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
              orderFilter === 'PENDING'
                ? 'border-emerald-500/60 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <span className="block text-2xl font-bold text-white">
              {orders.filter((o) => o.orderStatus === 'PENDING_APPROVAL').length}
            </span>
            <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Pending orders
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOrderFilter('APPROVED')}
            className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
              orderFilter === 'APPROVED'
                ? 'border-emerald-500/60 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <span className="block text-2xl font-bold text-white">
              {orders.filter((o) => o.orderStatus === 'APPROVED').length}
            </span>
            <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Approved orders
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOrderFilter('HOLD')}
            className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
              orderFilter === 'HOLD'
                ? 'border-amber-500/60 bg-amber-500/15 ring-2 ring-amber-500/30'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <span className="block text-2xl font-bold text-white">
              {orders.filter((o) => o.orderStatus === 'DRAFT').length}
            </span>
            <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Hold orders
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOrderFilter('CANCELLED')}
            className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
              orderFilter === 'CANCELLED'
                ? 'border-red-500/60 bg-red-500/15 ring-2 ring-red-500/30'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <span className="block text-2xl font-bold text-white">
              {orders.filter((o) => o.orderStatus === 'CANCELLED').length}
            </span>
            <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Cancelled orders
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOrderFilter('REJECTED')}
            className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
              orderFilter === 'REJECTED'
                ? 'border-red-500/60 bg-red-500/15 ring-2 ring-red-500/30'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <span className="block text-2xl font-bold text-white">
              {orders.filter((o) => o.orderStatus === 'REJECTED').length}
            </span>
            <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Rejected orders
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOrderFilter('ALL')}
            className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
              orderFilter === 'ALL'
                ? 'border-emerald-500/60 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <span className="block text-2xl font-bold text-white">
              {orders.length}
            </span>
            <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              All orders
            </span>
          </button>
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

        <div className="grid gap-6 xl:grid-cols-1">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Client orders</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Filter orders created directly by clients.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">
                Total: {orders.length}
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  Loading client orders...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  No client orders found.
                </div>
              ) : (
                <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800">
                  <thead className="bg-slate-950">
                    <tr className="text-left text-sm text-slate-400">
                      <th className="px-4 py-3 font-medium">Order No</th>
                      <th className="px-4 py-3 font-medium">Created by</th>
                      <th className="px-4 py-3 font-medium">Last action by</th>
                      <th className="px-4 py-3 font-medium">Shop</th>
                      <th className="px-4 py-3 font-medium">Shop city / town</th>
                      <th className="px-4 py-3 font-medium">Agent</th>
                      <th className="px-4 py-3 font-medium">Driver</th>
                      <th className="px-4 py-3 font-medium">Products & stock</th>
                      <th className="px-4 py-3 font-medium">Ordered qty</th>
                      <th className="px-4 py-3 font-medium">Retail price</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Payment</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-slate-800 bg-slate-900 text-sm"
                      >
                        <td className="px-4 py-3 text-slate-200">
                          {order.orderNo}
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          {order.placedByUser?.fullName ?? 'Client portal'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {order.lastActionByUser?.fullName ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {order.shop.shopName}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {order.shop.city.name} / {order.shop.town?.name ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {order.agent?.user.fullName ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {order.driver?.user.fullName ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {order.items.map((item) => {
                            const batch = item.stockBatch;
                            const stockId =
                              batch?.stockNumber != null
                                ? String(batch.stockNumber).padStart(3, '0')
                                : '—';
                            const newStock =
                              batch?.quantity !== undefined
                                ? batch.quantity
                                : null;
                            const sold = batch?.soldQty ?? null;
                            const remaining = batch?.remainingQty ?? null;

                            return (
                              <div
                                key={item.id}
                                className="mb-1 rounded-xl bg-slate-900/60 px-3 py-2 last:mb-0"
                              >
                                <div className="font-medium text-slate-100">
                                  {item.product.name}
                                </div>
                                <div className="mt-0.5 text-[11px] text-slate-400">
                                  <div>Stock ID: {stockId}</div>
                                  <div>
                                    New stock:{' '}
                                    <span className="text-emerald-300">
                                      {newStock ?? '—'}
                                    </span>{' '}
                                    • Sold:{' '}
                                    <span className="text-amber-300">
                                      {sold ?? 0}
                                    </span>{' '}
                                    • Remaining:{' '}
                                    <span className="text-emerald-300">
                                      {remaining ?? 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          {order.items.reduce(
                            (sum, item) => sum + (item.qty ?? 0),
                            0,
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          {(() => {
                            const prices = order.items
                              .map((i) => i.stockBatch?.retailPrice)
                              .filter((p): p is string => !!p);
                            if (!prices.length) return '—';
                            if (prices.length === 1)
                              return `LKR ${Number(prices[0]).toFixed(2)}`;
                            return 'Multiple';
                          })()}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-xs">
                            {order.orderStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {order.paymentType}
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          {(() => {
                            const total = order.items.reduce((sum, item) => {
                              const retail = item.stockBatch?.retailPrice
                                ? Number(item.stockBatch.retailPrice)
                                : 0;
                              return sum + retail * (item.qty ?? 0);
                            }, 0);
                            return `LKR ${total.toFixed(2)}`;
                          })()}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(order.orderedAt).toISOString().slice(0, 10)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({ type: 'edit', order })
                              }
                              className="rounded-xl border border-slate-600 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({ type: 'approve', order })
                              }
                              className="rounded-xl border border-emerald-600/70 px-2.5 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/10"
                            >
                              Approved
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({ type: 'hold', order })
                              }
                              className="rounded-xl border border-amber-600/70 px-2.5 py-1.5 text-xs text-amber-300 hover:bg-amber-500/10"
                            >
                              Hold
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({ type: 'cancel', order })
                              }
                              className="rounded-xl border border-slate-600/70 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({ type: 'reject', order })
                              }
                              className="rounded-xl border border-red-600/70 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({ type: 'delete', order })
                              }
                              className="rounded-xl border border-red-500/70 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                            >
                              Delete
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

      {showCreateModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-6"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving)
              setShowCreateModal(false);
          }}
        >
          <div className="w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-100">
                Create Client Order
              </h3>
              <button
                type="button"
                onClick={() => !saving && setShowCreateModal(false)}
                className="rounded-2xl border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
              >
                Close
              </button>
            </div>
            <form
              onSubmit={handleCreateOrder}
              className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Select shop (search by name / phone / NIC)
                  </label>
                  <input
                    type="text"
                    value={shopSearch}
                    onChange={(e) => setShopSearch(e.target.value)}
                    placeholder="Type shop name, phone, or owner NIC..."
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                  {filteredShops.length === 0 ? (
                    <div className="mt-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs text-slate-400">
                      No shops match this search. Try a different shop name,
                      phone number, or owner NIC.
                    </div>
                  ) : (
                    <select
                      value={shopId}
                      onChange={(e) => handleShopChange(e.target.value)}
                      required
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="">Select Shop</option>
                      {filteredShops.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.shopName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {shopId && (
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-300">
                    {(() => {
                      const s = shops.find((sh) => sh.id === shopId);
                      if (!s) return '—';
                      const cityName = (s as any)?.city?.name ?? '';
                      const townName = (s as any)?.town?.name ?? '';
                      return `Shop city: ${cityName || '—'} • Town: ${
                        townName || '—'
                      }`;
                    })()}
                  </div>
                )}

                <select
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="">Assign Agent (optional)</option>
                  {agentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {agentId && shopId && (
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-300">
                    {(() => {
                      const s = shops.find((sh) => sh.id === shopId);
                      const cityName = (s as any)?.city?.name ?? '';
                      const townName = (s as any)?.town?.name ?? '';
                      return `Agent city: ${cityName || '—'} • Town: ${
                        townName || '—'
                      }`;
                    })()}
                  </div>
                )}

                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="">Assign Driver (optional)</option>
                  {driverOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {driverId && shopId && (
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-300">
                    {(() => {
                      const s = shops.find((sh) => sh.id === shopId);
                      const cityName = (s as any)?.city?.name ?? '';
                      const townName = (s as any)?.town?.name ?? '';
                      return `Driver city: ${cityName || '—'} • Town: ${
                        townName || '—'
                      }`;
                    })()}
                  </div>
                )}

                <select
                  value={paymentType}
                  onChange={(e) =>
                    setPaymentType(
                      e.target.value as CreateOrderPayload['paymentType'],
                    )
                  }
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                >
                  {paymentTypes.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Order notes (optional)"
                  className="h-24 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Products
                  </h3>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    + Add Item
                  </button>
                </div>

                {items.map((item, index) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const productBatches = stockBatches.filter((b) => {
                    if (b.productId !== item.productId) return false;
                    if ((b.remainingQty ?? 0) <= 0) return false;
                    if (!b.expiryDate) return true;
                    const exp = new Date(b.expiryDate);
                    return exp >= today;
                  });
                  const selectedBatch = productBatches.find(
                    (b) => b.id === item.stockBatchId,
                  );
                  const remaining = selectedBatch?.remainingQty ?? 0;
                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-3"
                    >
                      <div className="grid gap-2 md:grid-cols-2">
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

                        <select
                          value={item.stockBatchId}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              'stockBatchId',
                              e.target.value,
                            )
                          }
                          disabled={!item.productId}
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:opacity-50"
                        >
                          <option value="">
                            {item.productId
                              ? 'Select stock batch'
                              : 'Select product first'}
                          </option>
                          {productBatches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {`Stock ${b.stockNumber
                                ?.toString()
                                .padStart(3, '0') ?? ''} - Qty ${
                                b.quantity
                              } • Sold ${b.soldQty ?? 0} • Rem ${
                                b.remainingQty ?? 0
                              } • ${new Date(
                                b.stockCreateDate ?? b.createdAt,
                              )
                                .toISOString()
                                .slice(0, 10)}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedBatch && (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300">
                          <div className="flex flex-wrap gap-4">
                            <span>
                              New stock:{' '}
                              <span className="text-emerald-300">
                                {selectedBatch.quantity}
                              </span>
                            </span>
                            <span>
                              Sold:{' '}
                              <span className="text-amber-300">
                                {selectedBatch.soldQty ?? 0}
                              </span>
                            </span>
                            <span>
                              Remaining:{' '}
                              <span className="text-emerald-300">
                                {selectedBatch.remainingQty ?? 0}
                              </span>
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="mb-1 text-xs font-medium text-slate-400">
                            Assign qty
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={remaining || undefined}
                            value={item.qty}
                            onChange={(e) =>
                              handleItemChange(index, 'qty', e.target.value)
                            }
                            className="w-24 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                          />
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="mt-5 rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {saving ? 'Creating...' : 'Create Client Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editOrderId && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-6"
          onClick={(e) => {
            if (e.target === e.currentTarget && !editSaving) closeEdit();
          }}
        >
          <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-100">
              Edit Client Order
            </h3>
            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Agent (optional)
                  </label>
                  <select
                    value={editAgentId}
                    onChange={(e) => setEditAgentId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                  >
                    <option value="">Assign Agent</option>
                    {agentOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Driver (optional)
                  </label>
                  <select
                    value={editDriverId}
                    onChange={(e) => setEditDriverId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                  >
                    <option value="">Assign Driver</option>
                    {driverOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Payment type
                </label>
                <select
                  value={editPaymentType}
                  onChange={(e) =>
                    setEditPaymentType(
                      e.target.value as CreateOrderPayload['paymentType'],
                    )
                  }
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                >
                  {paymentTypes.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as Order['orderStatus'])
                  }
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                >
                  {orderStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Notes (optional)
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={editSaving}
                  className="rounded-2xl border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {editSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
              {editingOrder && (
                <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-xs text-slate-300">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Products & stock used
                  </p>
                  <div className="space-y-1">
                    {editingOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-1 first:border-t-0 first:pt-0"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-slate-100">
                            {item.product.name}
                          </span>
                          <span className="ml-1 text-slate-400">
                            ({item.product.sku})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[11px]">
                          <span>
                            Stock ID:{' '}
                            <span className="font-mono">
                              {item.stockBatch?.stockNumber != null
                                ? String(
                                    item.stockBatch.stockNumber,
                                  ).padStart(3, '0')
                                : '—'}
                            </span>
                          </span>
                          <span>
                            Qty:{' '}
                            <span className="text-emerald-300">
                              {item.qty}
                            </span>
                          </span>
                          {(() => {
                            const retail =
                              item.stockBatch?.retailPrice != null
                                ? Number(item.stockBatch.retailPrice)
                                : Number(item.unitPrice);
                            const line = retail * item.qty;
                            return (
                              <>
                                <span>
                                  Unit (retail):{' '}
                                  <span>LKR {retail.toFixed(2)}</span>
                                </span>
                                <span>
                                  Line total:{' '}
                                  <span>LKR {line.toFixed(2)}</span>
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white">
              {confirmAction.type === 'edit' && 'Edit order?'}
              {confirmAction.type === 'approve' && 'Approve order?'}
              {confirmAction.type === 'hold' && 'Hold order?'}
              {confirmAction.type === 'cancel' && 'Cancel order?'}
              {confirmAction.type === 'reject' && 'Reject order?'}
              {confirmAction.type === 'delete' && 'Delete order?'}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Order {confirmAction.order.orderNo} — Total LKR{' '}
              {Number(confirmAction.order.grandTotal).toFixed(2)}
            </p>
            {confirmAction.type === 'delete' && (
              <p className="mt-1 text-xs text-red-300">
                This will delete the order and update related stock quantities.
              </p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  confirmAction.type === 'delete' ||
                  confirmAction.type === 'cancel' ||
                  confirmAction.type === 'reject'
                    ? 'bg-red-500 hover:bg-red-400'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {confirmAction.type === 'edit'
                  ? 'Edit'
                  : confirmAction.type === 'approve'
                    ? 'Approve'
                    : confirmAction.type === 'hold'
                      ? 'Hold'
                      : confirmAction.type === 'cancel'
                        ? 'Cancel'
                        : confirmAction.type === 'reject'
                          ? 'Reject'
                          : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

