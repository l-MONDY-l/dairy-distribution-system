'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { getUser, type LoggedUser } from '@/lib/auth';
import { updateUser } from '@/lib/users-api';
import type { CreateUserPayload } from '@/lib/types';

export default function ProfilePage() {
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(null);
  const [avatarInitial, setAvatarInitial] = useState('S');
  const [form, setForm] = useState<Pick<CreateUserPayload, 'fullName' | 'email'>>({
    fullName: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getUser();
    setLoggedUser(user);
    if (user?.fullName) {
      setAvatarInitial(user.fullName.charAt(0).toUpperCase());
      setForm({
        fullName: user.fullName,
        email: user.email,
      });
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev: Pick<CreateUserPayload, 'fullName' | 'email'>) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedUser) return;

    try {
      setSaving(true);
      setSuccess('');
      setError('');
      await updateUser(loggedUser.id, {
        fullName: form.fullName,
        email: form.email,
      });
      setSuccess('Profile updated successfully.');
    } catch (err: unknown) {
      let message = 'Failed to update profile.';
      if (err instanceof Error && err.message) {
        message = err.message;
      } else if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        message =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
          message;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="mt-1 text-2xl font-bold">Profile</h1>
          <p className="mt-1 text-sm text-slate-400">
            View and edit your own account details.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
          {/* Left: user summary card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-2xl font-semibold text-slate-950 flex items-center justify-center">
                {avatarInitial}
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-semibold text-slate-100">
                  {loggedUser?.fullName ?? 'System Admin'}
                </div>
                <div className="text-slate-400 text-xs break-all">
                  {loggedUser?.email}
                </div>
                <div className="mt-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-left text-xs text-slate-300 space-y-1 w-full">
                  <div className="flex justify-between">
                    <span className="text-slate-500">User ID</span>
                    <span>{loggedUser?.id ?? '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Role</span>
                    <span className="font-medium">{loggedUser?.role ?? 'SYSTEM_ADMIN'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: editable sections */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">User Information</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-1">
                    <label className="mb-2 block text-sm font-medium">Display Name</label>
                    <input
                      name="fullName"
                      value={form.fullName || ''}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="mb-2 block text-sm font-medium">Phone Number</label>
                    <input
                      name="phoneDummy"
                      value=""
                      readOnly
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold">Company Information</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Company Name</label>
                    <input
                      name="companyNameDummy"
                      value=""
                      readOnly
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Company Email</label>
                    <input
                      name="companyEmailDummy"
                      value=""
                      readOnly
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Location</label>
                    <input
                      name="locationDummy"
                      value=""
                      readOnly
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving || !loggedUser}
                  className="min-w-[140px] rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

