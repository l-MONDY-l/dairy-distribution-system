'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { getRegions } from '@/lib/regions-api';
import {
  createDriver,
  deleteDriver,
  getAvailableDriverUsers,
  getDrivers,
  updateDriver,
  updateDriverStatus,
} from '@/lib/drivers-api';
import type {
  CreateDriverPayload,
  DriverProfile,
  Region,
  UpdateDriverPayload,
  User,
} from '@/lib/types';

const initialCreateForm: CreateDriverPayload = {
  userId: '',
  regionId: '',
  vehicleNumber: '',
  licenseNumber: '',
  fuelQuotaDaily: '',
  notificationSms: true,
  notificationEmail: true,
  status: true,
};

const initialEditForm: UpdateDriverPayload = {
  regionId: '',
  vehicleNumber: '',
  licenseNumber: '',
  fuelQuotaDaily: '',
  notificationSms: true,
  notificationEmail: true,
  status: true,
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSave, setEditingSave] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createForm, setCreateForm] =
    useState<CreateDriverPayload>(initialCreateForm);

  const [editingDriver, setEditingDriver] =
    useState<DriverProfile | null>(null);
  const [editForm, setEditForm] =
    useState<UpdateDriverPayload>(initialEditForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [driversData, regionsData, usersData] = await Promise.all([
        getDrivers(),
        getRegions(),
        getAvailableDriverUsers(),
      ]);

      setDrivers(driversData);
      setRegions(regionsData);
      setAvailableUsers(usersData);
    } catch {
      setError('Failed to load drivers data.');
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
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setCreateForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await createDriver(createForm);

      setSuccess('Driver profile created successfully.');
      setCreateForm(initialCreateForm);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create driver profile.');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (driver: DriverProfile) => {
    setEditingDriver(driver);
    setEditForm({
      regionId: driver.region.id,
      vehicleNumber: driver.vehicleNumber || '',
      licenseNumber: driver.licenseNumber || '',
      fuelQuotaDaily: driver.fuelQuotaDaily || '0',
      notificationSms: driver.notificationSms,
      notificationEmail: driver.notificationEmail,
      status: driver.status,
    });
    setError('');
    setSuccess('');
  };

  const closeEditModal = () => {
    setEditingDriver(null);
    setEditForm(initialEditForm);
  };

  const handleEditDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    try {
      setEditingSave(true);
      setError('');
      setSuccess('');

      await updateDriver(editingDriver.id, editForm);

      setSuccess('Driver updated successfully.');
      closeEditModal();
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update driver.');
    } finally {
      setEditingSave(false);
    }
  };

  const handleStatusToggle = async (driver: DriverProfile) => {
    try {
      setError('');
      setSuccess('');

      await updateDriverStatus(driver.id, !driver.status);

      setSuccess(
        `Driver ${!driver.status ? 'activated' : 'disabled'} successfully.`,
      );
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDeleteDriver = async (driver: DriverProfile) => {
    if (
      !window.confirm(
        `Do you want to delete this driver? (${driver.user?.fullName ?? driver.id})\n\nThis will remove their profile and unassign them from towns, orders, and related records.`,
      )
    ) {
      return;
    }
    try {
      setDeletingId(driver.id);
      setError('');
      setSuccess('');

      await deleteDriver(driver.id);

      setSuccess('Driver deleted successfully.');
      setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
      if (editingDriver?.id === driver.id) closeEditModal();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete driver.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Admin Module
          </p>
          <h1 className="mt-1 text-2xl font-bold">Drivers Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage drivers, regions, and fuel quotas.
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
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Create Driver Profile</h2>

            <form onSubmit={handleCreateDriver} className="mt-6 space-y-4">
              <select
                name="userId"
                value={createForm.userId}
                onChange={handleCreateChange}
                required
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="">Select Driver User</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} - {user.email}
                  </option>
                ))}
              </select>

              <select
                name="regionId"
                value={createForm.regionId}
                onChange={handleCreateChange}
                required
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="">Select Region</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>

              <input
                name="vehicleNumber"
                value={createForm.vehicleNumber || ''}
                onChange={handleCreateChange}
                placeholder="Vehicle Number"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <input
                name="licenseNumber"
                value={createForm.licenseNumber || ''}
                onChange={handleCreateChange}
                placeholder="License Number"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <input
                name="fuelQuotaDaily"
                type="number"
                min="0"
                step="0.01"
                value={createForm.fuelQuotaDaily || ''}
                onChange={handleCreateChange}
                placeholder="Daily Fuel Quota (L)"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="notificationSms"
                    checked={!!createForm.notificationSms}
                    onChange={handleCreateChange}
                  />
                  SMS Alerts
                </label>

                <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="notificationEmail"
                    checked={!!createForm.notificationEmail}
                    onChange={handleCreateChange}
                  />
                  Email Alerts
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? 'Creating...' : 'Create Driver'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Driver Directory</h2>
              <div className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">
                Total: {drivers.length}
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  Loading drivers...
                </div>
              ) : (
                <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800">
                  <thead className="bg-slate-950">
                    <tr className="text-left text-sm text-slate-400">
                      <th className="px-4 py-3 font-medium">Driver</th>
                      <th className="px-4 py-3 font-medium">Vehicle</th>
                      <th className="px-4 py-3 font-medium">Region</th>
                      <th className="px-4 py-3 font-medium">Fuel / Day</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver) => (
                      <tr
                        key={driver.id}
                        className="border-t border-slate-800 bg-slate-900 text-sm"
                      >
                        <td className="px-4 py-3 font-medium text-white">
                          {driver.user.fullName}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {driver.vehicleNumber || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {driver.region.name}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {driver.fuelQuotaDaily}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              driver.status
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {driver.status ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openEditModal(driver)}
                              className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleStatusToggle(driver)}
                              className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                            >
                              {driver.status ? 'Disable' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteDriver(driver)}
                              disabled={deletingId === driver.id}
                              className="rounded-xl border border-red-500/70 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                            >
                              {deletingId === driver.id ? 'Deleting…' : 'Delete'}
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

        {editingDriver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Edit Driver</h2>
                <button
                  onClick={closeEditModal}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

              <form
                onSubmit={handleEditDriver}
                className="mt-6 grid gap-4 md:grid-cols-2"
              >
                <select
                  name="regionId"
                  value={editForm.regionId || ''}
                  onChange={handleEditChange}
                  required
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="">Select Region</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>

                <input
                  name="vehicleNumber"
                  value={editForm.vehicleNumber || ''}
                  onChange={handleEditChange}
                  placeholder="Vehicle Number"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="licenseNumber"
                  value={editForm.licenseNumber || ''}
                  onChange={handleEditChange}
                  placeholder="License Number"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="fuelQuotaDaily"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.fuelQuotaDaily || ''}
                  onChange={handleEditChange}
                  placeholder="Daily Fuel Quota (L)"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="notificationSms"
                    checked={!!editForm.notificationSms}
                    onChange={handleEditChange}
                  />
                  SMS Alerts
                </label>

                <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="notificationEmail"
                    checked={!!editForm.notificationEmail}
                    onChange={handleEditChange}
                  />
                  Email Alerts
                </label>

                <label className="md:col-span-2 flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="status"
                    checked={!!editForm.status}
                    onChange={handleEditChange}
                  />
                  Active
                </label>

                <div className="md:col-span-2 flex justify-end gap-3">
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

