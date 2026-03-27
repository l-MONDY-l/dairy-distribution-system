'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAuth, getUser, type LoggedUser } from '@/lib/auth';
import type { CompanyProfile } from '@/lib/types/company-profile';
import { fetchCompanyProfile } from '@/lib/company-profile-api';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUser(getUser());

    let isMounted = true;
    void (async () => {
      try {
        const profile = await fetchCompanyProfile();
        if (isMounted) {
          setCompany(profile);
        }
      } catch (error) {
        console.error('Failed to load company profile for header:', error);
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

  const logout = () => {
    clearAuth();
    router.replace('/login');
  };

  const displayName = user?.fullName ?? 'System Admin';
  const initial = displayName.trim()[0]?.toUpperCase() ?? 'S';

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
      <div>
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <p className="text-sm text-slate-400">Logged in as {displayName}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-[2px]">
            <div className="h-full w-full overflow-hidden rounded-full bg-slate-900 text-xs font-semibold text-slate-100">
              {loaded && company?.profileImageUrl ? (
                <img
                  src={company.profileImageUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  {loaded ? initial : null}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            {loaded ? (
              <>
                <span className="text-xs font-semibold text-slate-100">
                  {displayName}
                </span>
                <span className="text-[11px] text-slate-400">
                  {user?.role ?? 'SYSTEM_ADMIN'}
                </span>
              </>
            ) : (
              <>
                <span className="h-3 w-20 rounded bg-slate-700" />
                <span className="mt-1 h-2 w-16 rounded bg-slate-800" />
              </>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}