'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAuthenticated, clearAuth, getUser } from '@/lib/auth';
import { LogOut } from 'lucide-react';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/portal/login';

  useEffect(() => {
    if (!isLoginPage && !isAuthenticated()) {
      router.replace('/portal/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoginPage]);

  const handleLogout = () => {
    clearAuth();
    router.replace('/portal/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 px-4">
        <Link
          href="/portal"
          className="text-sm font-semibold text-slate-200 hover:text-white"
        >
          Agent portal
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {getUser()?.fullName ?? getUser()?.email ?? 'Agent'}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
