'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAuth, getUser, type LoggedUser } from '@/lib/auth';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
      <div>
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <p className="text-sm text-slate-400">
          Logged in as {mounted ? user?.fullName || 'User' : 'User'}
        </p>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
      >
        <LogOut size={16} />
        Logout
      </button>
    </header>
  );
}