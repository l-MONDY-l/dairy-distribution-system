'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { setAuth, isAuthenticated } from '@/lib/auth';
import { api } from '@/lib/api';
import { loginSchema, type LoginFormData } from '@/lib/validators';

function requestLocationAccess() {
  if (typeof window === 'undefined' || !navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    () => {},
    () => {},
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
}

export default function PortalLoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/portal');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    requestLocationAccess();
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setServerError('');

      const response = await api.post('/auth/login', data);

      setAuth(response.data.access_token, response.data.user);
      router.push('/portal');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setServerError(
            'Cannot reach server. When using ngrok or a tablet, ensure the backend is running and you tunnel the app (not the API). Check your connection and try again.',
          );
        } else {
          setServerError(
            error.response?.data?.message || 'Login failed. Please try again.',
          );
        }
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-10">
        <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Field portal
            </p>
            <h1 className="mt-2 text-2xl font-bold">Agent and Driver Login</h1>
            <p className="mt-2 text-xs text-slate-400">
              For agents and drivers. Use your credentials to sign in. Works on
              browser, Android, and Apple devices.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium">
                Email or Username
              </label>
              <input
                type="text"
                autoComplete="username"
                {...register('identifier')}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-emerald-500"
              />
              {errors.identifier && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none focus:border-emerald-500"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
