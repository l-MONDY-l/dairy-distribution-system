'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import {
  createUser,
  getRoles,
  getUsers,
  updateUser,
  updateUserStatus,
} from '@/lib/users-api';
import type {
  CreateUserPayload,
  Role,
  UpdateUserPayload,
  User,
  UserStatus,
} from '@/lib/types';

const initialCreateForm: CreateUserPayload = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  roleCode: '',
};

const initialEditForm: UpdateUserPayload = {
  fullName: '',
  email: '',
  phone: '',
  roleCode: '',
  status: 'ACTIVE',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSave, setEditingSave] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createForm, setCreateForm] =
    useState<CreateUserPayload>(initialCreateForm);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserPayload>(initialEditForm);

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => a.name.localeCompare(b.name)),
    [roles],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);

      setUsers(usersData);
      setRoles(rolesData);

      setCreateForm((prev) => ({
        ...prev,
        roleCode: prev.roleCode || rolesData[0]?.code || '',
      }));
    } catch {
      setError('Failed to load users data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await createUser({
        ...createForm,
        phone: createForm.phone?.trim() ? createForm.phone : undefined,
      });

      setSuccess('User created successfully.');
      setCreateForm({
        ...initialCreateForm,
        roleCode: roles[0]?.code || '',
      });

      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      roleCode: user.role?.code || '',
      status: user.status,
    });
    setError('');
    setSuccess('');
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm(initialEditForm);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) return;

    try {
      setEditingSave(true);
      setError('');
      setSuccess('');

      await updateUser(editingUser.id, {
        ...editForm,
        phone: editForm.phone?.trim() ? editForm.phone : undefined,
      });

      setSuccess('User updated successfully.');
      closeEditModal();
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update user.');
    } finally {
      setEditingSave(false);
    }
  };

  const handleStatusToggle = async (user: User) => {
    try {
      setError('');
      setSuccess('');

      const nextStatus: UserStatus =
        user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

      await updateUserStatus(user.id, nextStatus);
      setSuccess(`User status changed to ${nextStatus}.`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Admin Module
          </p>
          <h1 className="mt-1 text-2xl font-bold">Users Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Create, edit, and control access for platform users.
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

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-1">
            <h2 className="text-lg font-semibold">Create New User</h2>
            <p className="mt-1 text-sm text-slate-400">
              Add admin, agent, driver, or shop portal user.
            </p>

            <form onSubmit={handleCreateUser} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Full Name</label>
                <input
                  name="fullName"
                  value={createForm.fullName}
                  onChange={handleCreateChange}
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input
                  name="email"
                  type="email"
                  value={createForm.email}
                  onChange={handleCreateChange}
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Phone</label>
                <input
                  name="phone"
                  value={createForm.phone}
                  onChange={handleCreateChange}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="Optional phone number"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Password</label>
                <input
                  name="password"
                  type="password"
                  value={createForm.password}
                  onChange={handleCreateChange}
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Role</label>
                <select
                  name="roleCode"
                  value={createForm.roleCode}
                  onChange={handleCreateChange}
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="">Select role</option>
                  {sortedRoles.map((role) => (
                    <option key={role.id} value={role.code}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">User Directory</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Current users and assigned access levels.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">
                Total: {users.length}
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  Loading users...
                </div>
              ) : users.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  No users found.
                </div>
              ) : (
                <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800">
                  <thead className="bg-slate-950">
                    <tr className="text-left text-sm text-slate-400">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-slate-800 bg-slate-900 text-sm"
                      >
                        <td className="px-4 py-3 font-medium text-white">
                          {user.fullName}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{user.email}</td>
                        <td className="px-4 py-3 text-slate-300">
                          {user.role?.name || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              user.status === 'ACTIVE'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(user.createdAt).toISOString().slice(0, 10)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleStatusToggle(user)}
                              className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              {user.status === 'ACTIVE' ? 'Disable' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Edit User</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Update user details and access level.
                  </p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleEditUser} className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Full Name</label>
                  <input
                    name="fullName"
                    value={editForm.fullName || ''}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={editForm.email || ''}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Phone</label>
                  <input
                    name="phone"
                    value={editForm.phone || ''}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Role</label>
                  <select
                    name="roleCode"
                    value={editForm.roleCode || ''}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  >
                    <option value="">Select role</option>
                    {sortedRoles.map((role) => (
                      <option key={role.id} value={role.code}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Status</label>
                  <select
                    name="status"
                    value={editForm.status || 'ACTIVE'}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editingSave}
                    className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {editingSave ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}