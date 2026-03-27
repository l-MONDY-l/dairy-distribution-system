'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  UserPlus,
  ShoppingCart,
  Truck,
  Package,
  Trophy,
  Settings,
} from 'lucide-react';
import { getAgents } from '@/lib/agents-api';
import { getUser } from '@/lib/auth';
import type { AgentProfile } from '@/lib/types';

const actionButtons = [
  { href: '/portal/create-order', label: 'Create Order', icon: ShoppingCart },
  { href: '/portal/add-client', label: 'Add Client', icon: UserPlus },
  { href: '/portal/order-delivery', label: 'Order Delivery', icon: Truck },
  { href: '/portal/submit-returns', label: 'Submit Returns', icon: Package },
  {
    href: '/portal/targets-rewards',
    label: 'My Targets & Rewards',
    icon: Trophy,
  },
  { href: '/portal/settings', label: 'Settings', icon: Settings },
] as const;

export default function PortalPage() {
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        setError('');
        const currentUser = getUser();
        if (!currentUser?.id) {
          setAgent(null);
          return;
        }
        const list = await getAgents();
        const myAgent = list.find((a) => a.user?.id === currentUser.id);
        if (!cancelled) setAgent(myAgent ?? null);
      } catch {
        if (!cancelled) setError('Failed to load dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6">
        <p className="text-sm text-slate-400">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-8 py-10 text-center">
          <p className="text-sm text-slate-400">
            No agent profile found for your account. Contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  const regionName = agent.region?.name ?? '—';
  const cityNames = (() => {
    const direct = agent.cityAssignments?.map((a) => a.city.name) ?? [];
    const fromTowns =
      agent.townAssignments?.map((a) => a.town.city.name) ?? [];
    return Array.from(new Set([...direct, ...fromTowns])).filter(Boolean);
  })();
  const townNames =
    agent.townAssignments?.map((a) => a.town.name) ?? [];
  const totalSales = agent.currentSales
    ? Number(agent.currentSales).toLocaleString()
    : '0';
  const monthlyTarget = Number(agent.monthlyTarget ?? 0);
  const targetAchieved = agent.currentSalesQty ?? 0;
  const targetPct =
    monthlyTarget > 0
      ? Math.round((targetAchieved / monthlyTarget) * 100)
      : 0;
  const ordersThisMonth = agent.ordersAssigned ?? 0;
  const registeredClients = agent.registeredClientsCount ?? 0;

  const cards = [
    {
      label: 'Total sales (LKR)',
      value: totalSales,
      sub: 'Current month',
    },
    {
      label: 'Registered clients',
      value: registeredClients,
      sub: 'Shops assigned to you',
    },
    {
      label: 'Allocated region',
      value: regionName,
      sub: 'Primary region',
    },
    {
      label: 'Allocated city',
      value: cityNames.length ? cityNames.join(', ') : '—',
      sub: cityNames.length ? `${cityNames.length} city/cities` : 'None',
    },
    {
      label: 'Allocated town',
      value: townNames.length ? townNames.join(', ') : '—',
      sub: townNames.length ? `${townNames.length} town(s)` : 'None',
    },
    {
      label: 'Monthly target (qty)',
      value: monthlyTarget.toLocaleString(),
      sub: 'Target quantity',
    },
    {
      label: 'Target achieved (qty)',
      value: targetAchieved.toLocaleString(),
      sub: `${targetPct}% of target`,
    },
    {
      label: 'Orders this month',
      value: ordersThisMonth,
      sub: 'Agent orders (excl. client)',
    },
  ];

  return (
    <div className="flex min-h-full flex-col p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your agent overview and performance at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {card.label}
            </p>
            <p className="mt-1 break-words text-lg font-semibold text-white">
              {card.value}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex-1 min-h-[14rem]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actionButtons.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-[5.5rem] items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900/90 px-5 py-4 text-left transition hover:border-emerald-500/50 hover:bg-slate-800"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                  <Icon className="h-6 w-6 text-emerald-400" />
                </div>
                <span className="text-base font-semibold text-white">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
