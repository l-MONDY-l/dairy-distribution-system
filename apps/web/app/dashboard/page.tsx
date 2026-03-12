import AppLayout from '@/components/layout/app-layout';
import {
  BarChart3,
  Boxes,
  CreditCard,
  Fuel,
  ShoppingCart,
  Users,
} from 'lucide-react';

const cards = [
  {
    title: 'Total Orders Today',
    value: '128',
    icon: ShoppingCart,
  },
  {
    title: 'Pending Orders',
    value: '17',
    icon: Boxes,
  },
  {
    title: 'Payments Collected',
    value: 'LKR 245,000',
    icon: CreditCard,
  },
  {
    title: 'Fuel Usage Today',
    value: '84 L',
    icon: Fuel,
  },
  {
    title: 'Active Users',
    value: '63',
    icon: Users,
  },
  {
    title: 'Sales vs Target',
    value: '82%',
    icon: BarChart3,
  },
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Admin Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold">Operations Overview</h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time dairy distribution summary
          </p>
        </div>

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
                    <h3 className="mt-3 text-3xl font-bold">{card.value}</h3>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
            <h3 className="text-lg font-semibold">Sales & Order Analytics</h3>
            <p className="mt-2 text-sm text-slate-400">
              Chart widgets will be connected to backend KPIs next.
            </p>

            <div className="mt-6 flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950 text-slate-500">
              Analytics chart area
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="mt-4 space-y-3">
              {[
                'Approve pending orders',
                'Approve shop registrations',
                'Review return requests',
                'Review discount requests',
              ].map((action) => (
                <button
                  key={action}
                  className="w-full rounded-2xl border border-slate-700 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-lg font-semibold">Live Alerts</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              'Delivery reminders due today',
              'Low stock quota alerts',
              'Payment due reminders',
              'Failed order dispatch alerts',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4 text-sm text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}