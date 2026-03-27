'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { getShops } from '@/lib/shops-api';
import { getInvoices } from '@/lib/invoices-api';
import { createPayment } from '@/lib/payments-api';
import type {
  CreatePaymentPayload,
  Invoice,
  Payment,
  Shop,
} from '@/lib/types';

const paymentMethods = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ONLINE', label: 'Online' },
] as const;

export default function PaymentsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments] = useState<Payment[]>([]); // reserved for future use

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [filterShopId, setFilterShopId] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'PENDING' | 'PARTIAL' | 'PAID' | 'FAILED' | ''
  >('');

  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [paymentMethod, setPaymentMethod] =
    useState<CreatePaymentPayload['paymentMethod']>('CASH');
  const [amount, setAmount] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');

  const shopOptions = useMemo(
    () =>
      shops.map((s) => ({
        value: s.id,
        label: `${s.code} - ${s.shopName}`,
      })),
    [shops],
  );

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((inv) => {
        if (filterShopId && inv.shopId !== filterShopId) return false;
        if (filterStatus && inv.paymentStatus !== filterStatus) return false;
        return true;
      }),
    [invoices, filterShopId, filterStatus],
  );

  const invoiceOptions = useMemo(
    () =>
      filteredInvoices.map((inv) => ({
        value: inv.id,
        label: `${inv.invoiceNo} (${inv.shop.shopName}) - LKR ${Number(
          inv.total,
        ).toFixed(2)} | Outstanding: LKR ${inv.outstanding.toFixed(2)}`,
      })),
    [filteredInvoices],
  );

  const selectedInvoice = useMemo(
    () => invoices.find((inv) => inv.id === selectedInvoiceId),
    [invoices, selectedInvoiceId],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [shopsData, invoicesData] = await Promise.all([
        getShops(),
        getInvoices(),
      ]);

      setShops(shopsData);
      setInvoices(invoicesData);
    } catch {
      setError('Failed to load invoices and payments data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInvoice) {
      setError('Select an invoice.');
      return;
    }

    const amountNumber = Number(amount);
    if (!amountNumber || amountNumber <= 0) {
      setError('Enter a valid amount.');
      return;
    }

    if (amountNumber > selectedInvoice.outstanding) {
      setError('Amount exceeds outstanding.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload: CreatePaymentPayload = {
        invoiceId: selectedInvoice.id,
        shopId: selectedInvoice.shopId,
        paymentMethod,
        amount: amountNumber,
        referenceNo: referenceNo.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      await createPayment(payload);

      setSuccess('Payment recorded successfully.');
      setAmount('');
      setReferenceNo('');
      setNotes('');

      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to record payment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="mt-1 text-2xl font-bold">Invoices & Payments</h1>
          <p className="mt-1 text-sm text-slate-400">
            Track invoices, record payments, and monitor outstanding balances.
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
            <h2 className="text-lg font-semibold">Record Payment</h2>

            <form onSubmit={handleCreatePayment} className="mt-6 space-y-4">
              <select
                value={selectedInvoiceId}
                onChange={(e) => setSelectedInvoiceId(e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Select Invoice</option>
                {invoiceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as CreatePaymentPayload['paymentMethod'],
                  )
                }
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              >
                {paymentMethods.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={
                  selectedInvoice
                    ? `Outstanding: LKR ${selectedInvoice.outstanding.toFixed(
                        2,
                      )}`
                    : 'Amount'
                }
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />

              <input
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="Reference No (optional)"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="h-20 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? 'Recording...' : 'Record Payment'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Invoice List</h2>
                <p className="mt-1 text-sm text-slate-400">
                  All invoices with paid and outstanding amounts.
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
                    setFilterStatus(
                      e.target.value as
                        | 'PENDING'
                        | 'PARTIAL'
                        | 'PAID'
                        | 'FAILED'
                        | '',
                    )
                  }
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                >
                  <option value="">All statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="PAID">PAID</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  Loading invoices...
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  No invoices found.
                </div>
              ) : (
                <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800">
                  <thead className="bg-slate-950">
                    <tr className="text-left text-sm text-slate-400">
                      <th className="px-4 py-3 font-medium">Invoice</th>
                      <th className="px-4 py-3 font-medium">Shop</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Paid</th>
                      <th className="px-4 py-3 font-medium">Outstanding</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Issued</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-t border-slate-800 bg-slate-900 text-sm"
                      >
                        <td className="px-4 py-3 text-slate-200">
                          {inv.invoiceNo}
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          {inv.shop.shopName}
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          LKR {Number(inv.total).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          LKR {inv.paidAmount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          LKR {inv.outstanding.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              inv.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : inv.paymentStatus === 'PARTIAL'
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-blue-500/15 text-blue-400'
                            }`}
                          >
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(inv.issuedAt)
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

