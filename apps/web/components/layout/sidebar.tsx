'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Boxes,
  CreditCard,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react';

const menu = [
  { name: 'Dashboard', icon: Home, path: '/dashboard' },
  { name: 'Users', icon: Users, path: '/users' },
  { name: 'Shops', icon: ShoppingCart, path: '/shops' },
  { name: 'Agents', icon: Users, path: '/agents' },
  { name: 'Drivers', icon: Truck, path: '/drivers' },
  { name: 'Products', icon: Package, path: '/products' },
  { name: 'Orders', icon: Boxes, path: '/orders' },
  { name: 'Returns', icon: Boxes, path: '/returns' },
  { name: 'Payments', icon: CreditCard, path: '/payments' },
  { name: 'Reports', icon: BarChart3, path: '/reports' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 border-r border-slate-800 bg-slate-900 p-6 lg:block">
      <h1 className="mb-8 text-2xl font-bold text-emerald-400">
        Dairy Admin
      </h1>

      <nav className="space-y-2 text-sm">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;

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
        })}
      </nav>
    </aside>
  );
}