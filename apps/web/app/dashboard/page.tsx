'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { api } from '@/lib/api';
import {
  BarChart3,
  Boxes,
  CreditCard,
  ShoppingCart,
  Users,
} from 'lucide-react';

type DashboardKpis = {
  totalOrdersToday: number;
  totalOrdersThisWeek: number;
  totalOrdersThisMonth: number;
  pendingOrders: number;
  paymentsCollected: number;
  outstanding: number;
  activeUsers: number;
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setKpis(res.data);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const cards =
    kpis === null
      ? []
      : [
          {
            title: 'Total Orders Today',
            value: String(kpis.totalOrdersToday),
            icon: ShoppingCart,
          },
          {
            title: 'Pending Orders',
            value: String(kpis.pendingOrders),
            icon: Boxes,
          },
          {
            title: 'Payments Collected (All Time)',
            value: `LKR ${kpis.paymentsCollected.toLocaleString('en-LK', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            icon: CreditCard,
          },
          {
            title: 'Outstanding (All Shops)',
            value: `LKR ${kpis.outstanding.toLocaleString('en-LK', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            icon: CreditCard,
          },
          {
            title: 'Active Users',
            value: String(kpis.activeUsers),
            icon: Users,
          },
          {
            title: 'Orders This Month',
            value: String(kpis.totalOrdersThisMonth),
            icon: BarChart3,
          },
        ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Admin Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold">Operations Overview</h1>
          <p className="mt-1 text-sm text-slate-400">
            Summary of orders and collections.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300">
            Loading dashboard metrics...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{card.title}</p>
                      <h3 className="mt-3 text-3xl font-bold">
                        {card.value}
                      </h3>
                    </div>
                    <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-400">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}