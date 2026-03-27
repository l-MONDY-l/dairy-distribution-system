'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Milk, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { setAuth, isAuthenticated } from '@/lib/auth';
import { api } from '@/lib/api';
import { loginSchema, type LoginFormData } from '@/lib/validators';

export default function LoginPage() {
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
      router.replace('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setServerError('');

      const response = await api.post('/auth/login', data);

      setAuth(response.data.access_token, response.data.user);
      router.push('/dashboard');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setServerError(
          error.response?.data?.message || 'Login failed. Please try again.',
        );
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl md:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-emerald-600 to-cyan-700 p-10 md:flex md:flex-col md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3">
                <Milk className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dairy Distribution</h1>
                <p className="text-sm text-white/80">
                  Smart operations for milk delivery teams
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-semibold leading-tight">
                Run orders, drivers, agents, returns, and payments from one
                control tower.
              </h2>
              <p className="max-w-md text-sm text-white/85">
                Admins manage the operation. Agents push sales. Drivers execute
                delivery. Shops place and track orders.
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
                  Admin Access
                </p>
                <h2 className="mt-2 text-3xl font-bold">Sign in</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Use the seeded admin account to access the dashboard.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    placeholder="admin@dairy.local or admin"
                    {...register('identifier')}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                  />
                  {errors.identifier && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.identifier.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    {...register('password')}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-emerald-500"
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {serverError && (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {serverError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogIn className="h-4 w-4" />
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-400">
                <p>
                  <span className="font-semibold text-slate-200">Seed login:</span>{' '}
                  admin@dairy.local <span className="text-slate-500">(or username: admin)</span> / Admin@123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}