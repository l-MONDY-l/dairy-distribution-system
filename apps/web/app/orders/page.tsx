'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { getShops } from '@/lib/shops-api';
import { getAgents } from '@/lib/agents-api';
import { getProducts } from '@/lib/products-api';
import { getOrders, createOrder } from '@/lib/orders-api';
import type {
  AgentProfile,
  CreateOrderPayload,
  Order,
  OrderItemInput,
  Product,
  Shop,
} from '@/lib/types';
import { getUser } from '@/lib/auth';

const paymentTypes = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ONLINE', label: 'Online' },
] as const;

const emptyItem: OrderItemInput = {
  productId: '',
  qty: 1,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [shopId, setShopId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [paymentType, setPaymentType] =
    useState<CreateOrderPayload['paymentType']>('CASH');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItemInput[]>([emptyItem]);

  const currentUser = getUser();

  const shopOptions = useMemo(
    () =>
      shops.map((s) => ({
        value: s.id,
        label: `${s.code} - ${s.shopName}`,
      })),
    [shops],
  );

  const agentOptions = useMemo(
    () =>
      agents.map((a) => ({
        value: a.id,
        label: a.user.fullName,
      })),
    [agents],
  );

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.sku})`,
      })),
    [products],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [ordersData, shopsData, agentsData, productsData] =
        await Promise.all([
          getOrders(),
          getShops(),
          getAgents(),
          getProducts(),
        ]);

      setOrders(ordersData);
      setShops(shopsData);
      setAgents(agentsData);
      setProducts(productsData);
    } catch {
      setError('Failed to load orders data.');
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
        (i) => i.productId && i.qty && i.qty > 0,
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
        paymentType,
        notes: notes.trim() || undefined,
        items: cleanedItems,
      };

      await createOrder(payload);
      setSuccess('Order created successfully.');

      setShopId('');
      setAgentId('');
      setPaymentType('CASH');
      setNotes('');
      setItems([emptyItem]);

      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create order.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Admin Module
          </p>
          <h1 className="mt-1 text-2xl font-bold">Order Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Create and review orders by shop, agent, and region.
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
            <h2 className="text-lg font-semibold">Create Order</h2>

            <form onSubmit={handleCreateOrder} className="mt-6 space-y-4">
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
                <option value="">Assign Agent (optional)</option>
                {agentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={paymentType}
                onChange={(e) =>
                  setPaymentType(e.target.value as CreateOrderPayload['paymentType'])
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
                className="h-20 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />

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

                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-3"
                  >
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        handleItemChange(index, 'productId', e.target.value)
                      }
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="">Select product</option>
                      {productOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(index, 'qty', e.target.value)
                      }
                      className="w-20 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    />

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
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
                {saving ? 'Creating...' : 'Create Order'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Orders</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Recent orders with shop, region, and totals.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">
                Total: {orders.length}
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  No orders found.
                </div>
              ) : (
                <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800">
                  <thead className="bg-slate-950">
                    <tr className="text-left text-sm text-slate-400">
                      <th className="px-4 py-3 font-medium">Order No</th>
                      <th className="px-4 py-3 font-medium">Shop</th>
                      <th className="px-4 py-3 font-medium">Region</th>
                      <th className="px-4 py-3 font-medium">Payment</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-slate-800 bg-slate-900 text-sm"
                      >
                        <td className="px-4 py-3 text-slate-200">
                          {order.orderNo}
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          {order.shop.shopName}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {order.region.name} / {order.city.name}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {order.paymentType}
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          LKR {Number(order.grandTotal).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(order.orderedAt)
                            .toISOString()
                            .slice(0, 10)}
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

