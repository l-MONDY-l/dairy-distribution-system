'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  Boxes,
  ChevronDown,
  CreditCard,
  FileText,
  Home,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react';
import type { CompanyProfile } from '@/lib/types/company-profile';
import { fetchCompanyProfile } from '@/lib/company-profile-api';

const menu = [
  { name: 'Dashboard', icon: Home, path: '/dashboard' },
  { name: 'Company Profile', icon: Users, path: '/company-profile' },
  { name: 'User & Role Management', icon: Users, path: '/users' },
  {
    name: 'Territory & Region Management',
    icon: Truck,
    path: '/regions',
  },
  { name: 'Client', icon: ShoppingCart, path: '/shops' },
  { name: 'Manufacture', icon: Package, path: '/manifacture' },
  { name: 'Stock', icon: Package, path: '/stock' },
  {
    name: 'Orders',
    icon: Boxes,
    key: 'orders',
    children: [
      { name: 'Agent orders', path: '/orders' },
      { name: 'Client orders', path: '/client-orders' },
    ],
  },
  { name: 'Agent Control', icon: Users, path: '/agents' },
  {
    name: 'Driver Control',
    icon: Truck,
    key: 'driver-management',
    children: [
      { name: 'Driver accounts & routes', path: '/drivers' },
      { name: 'Fuel quota & trips', path: '/drivers' },
      { name: 'Dispatch & pickups', path: '/drivers/dispatch-pickups' },
    ],
  },
  { name: 'Credits', icon: CreditCard, path: '/credits' },
  { name: 'Accounts', icon: CreditCard, path: '/accounts' },
  {
    name: 'Return Stock Management',
    icon: Boxes,
    key: 'return-management',
    children: [
      { name: 'View & approve returns', path: '/returns' },
      { name: 'History by shop / agent', path: '/returns' },
    ],
  },
  {
    name: 'Sales & Target Monitoring',
    icon: BarChart3,
    key: 'sales-target',
    children: [
      { name: 'Targets vs actuals', path: '/reports/agents' },
      { name: 'Top-performing agents', path: '/reports/agents' },
      { name: 'Discount-adjusted reports', path: '/discounts' },
    ],
  },
  {
    name: 'Fuel Allocation & Trip Logs',
    icon: Truck,
    key: 'fuel-trip',
    children: [
      { name: 'Fuel allocation', path: '/drivers' },
      { name: 'Trip logs & mileage', path: '/drivers' },
    ],
  },
  {
    name: 'Payment & Invoice Management',
    icon: CreditCard,
    key: 'payment-invoice',
    children: [
      { name: 'Payments & methods', path: '/payments' },
      { name: 'Invoices & outstanding', path: '/payments' },
    ],
  },
  {
    name: 'Reporting & Export',
    icon: FileText,
    key: 'reporting-export',
    children: [
      { name: 'Order report', path: '/reports/orders' },
      // other reports will be wired as we build them
    ],
  },
  {
    name: 'System Settings',
    icon: Settings,
    key: 'system-settings',
    children: [
      { name: 'Products & pricing', path: '/products' },
      { name: 'Tax & payment modes', path: '/settings' },
      { name: 'Branding & notifications', path: '/settings' },
    ],
  },
  {
    name: 'Activity Logs & Audit',
    icon: FileText,
    key: 'activity-logs',
    children: [
      { name: 'Activity & approvals log', path: '/activity-logs' },
    ],
  },
  {
    name: 'Discount & Special Pricing',
    icon: Percent,
    key: 'discounts',
    children: [
      { name: 'View & approve discounts', path: '/discounts' },
      { name: 'Discount history & alerts', path: '/discounts' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'agent-management': false,
    'driver-management': false,
    'return-management': false,
    'sales-target': false,
    'fuel-trip': false,
    'payment-invoice': false,
    'reporting-export': false,
    'system-settings': false,
    'activity-logs': false,
    discounts: false,
    orders: false,
  });

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const data = await fetchCompanyProfile();
        if (isMounted) {
          setCompany(data);
        }
      } catch (error) {
        // Sidebar should never crash if company profile fails to load
        console.error('Failed to load company profile for sidebar:', error);
      } finally {
        if (isMounted) {
          setLoaded(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const isActivePath = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  // Ensure the group stays open when one of its children is the active route
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };

      for (const item of menu) {
        if ('key' in item && item.key && 'children' in item && item.children) {
          const anyChildActive = item.children.some((child) =>
            child.path ? isActivePath(child.path) : false,
          );

          if (anyChildActive) {
            next[item.key] = true;
          }
        }
      }

      return next;
    });
  }, [pathname]);

  return (
    <aside className="hidden w-72 border-r border-slate-800 bg-slate-900 p-6 lg:block">
      <div className="mb-8 flex items-center gap-3">
        {company?.logoUrl ? (
          <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-600 bg-slate-900">
            <img
              src={company.logoUrl}
              alt={company.brandName ?? 'Company logo'}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-9 w-9 rounded-full bg-slate-800" />
        )}
        <div className="flex flex-col">
          {loaded && company ? (
            <>
              <span className="text-lg font-bold text-emerald-400">
                {company.brandName}
              </span>
              <span className="text-[11px] text-slate-400">
                {company.legalName}
              </span>
            </>
          ) : (
            <>
              <span className="h-4 w-24 rounded bg-slate-800" />
              <span className="mt-1 h-3 w-32 rounded bg-slate-900" />
            </>
          )}
        </div>
      </div>

      <nav className="space-y-2 text-sm">
        {menu.map((item) => {
          const hasChildren = 'children' in item && item.children?.length;

          if (hasChildren && 'key' in item && item.key) {
            const Icon = item.icon;
            const anyChildActive = item.children?.some((child) =>
              child.path ? isActivePath(child.path) : false,
            );
            const isOpen = openGroups[item.key] ?? false;

            return (
              <div key={item.key} className="space-y-1">
                <div
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left ${
                    anyChildActive || isOpen
                      ? 'bg-emerald-500 text-black'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} />
                    {item.name}
                  </span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenGroups((prev) => ({
                        ...prev,
                        [item.key]: !isOpen,
                      }));
                    }}
                    className="rounded p-1 hover:bg-emerald-600/20"
                    aria-label={
                      isOpen ? `Collapse ${item.name}` : `Expand ${item.name}`
                    }
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {isOpen && (
                  <div className="ml-8 space-y-1">
                    {item.children?.map((child) => {
                      if (!child.path) return null;
                      const active = isActivePath(child.path);
                      return (
                        <Link
                          key={child.name}
                          href={child.path}
                          className={`block rounded-lg px-3 py-2 text-xs ${
                            active
                              ? 'bg-emerald-600 text-black'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if ('path' in item && item.path) {
            const Icon = item.icon;
            const active = isActivePath(item.path);

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  active
                    ? 'bg-emerald-500 text-black'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          }

          return null;
        })}
      </nav>
    </aside>
  );
}