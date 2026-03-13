'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import SearchableSelect from '@/components/ui/searchable-select';
import { getCities, getRegions } from '@/lib/regions-api';
import { createShop, getShops, updateShop } from '@/lib/shops-api';
import type {
  City,
  CreateShopPayload,
  Region,
  Shop,
  ShopStatus,
  UpdateShopPayload,
} from '@/lib/types';

const initialCreateForm: CreateShopPayload = {
  code: '',
  shopName: '',
  ownerName: '',
  phone: '',
  email: '',
  address: '',
  website: '',
  regionId: '',
  cityId: '',
  notifySms: true,
  notifyEmail: true,
};

const initialEditForm: UpdateShopPayload = {
  code: '',
  shopName: '',
  ownerName: '',
  phone: '',
  email: '',
  address: '',
  website: '',
  regionId: '',
  cityId: '',
  notifySms: true,
  notifyEmail: true,
  status: 'PENDING',
};

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSave, setEditingSave] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createForm, setCreateForm] =
    useState<CreateShopPayload>(initialCreateForm);

  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [editForm, setEditForm] = useState<UpdateShopPayload>(initialEditForm);

  const filteredCreateCities = useMemo(
    () => cities.filter((city) => city.regionId === createForm.regionId),
    [cities, createForm.regionId],
  );

  const filteredEditCities = useMemo(
    () => cities.filter((city) => city.regionId === editForm.regionId),
    [cities, editForm.regionId],
  );

  const createCityOptions = useMemo(
    () =>
      filteredCreateCities.map((city) => ({
        label: city.name,
        value: city.id,
      })),
    [filteredCreateCities],
  );

  const editCityOptions = useMemo(
    () =>
      filteredEditCities.map((city) => ({
        label: city.name,
        value: city.id,
      })),
    [filteredEditCities],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [shopsData, regionsData, citiesData] = await Promise.all([
        getShops(),
        getRegions(),
        getCities(),
      ]);

      setShops(shopsData);
      setRegions(regionsData);
      setCities(citiesData);
    } catch {
      setError('Failed to load shop data.');
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

    setCreateForm((prev) => {
      if (name === 'regionId') {
        return {
          ...prev,
          regionId: value,
          cityId: '',
        };
      }

      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setEditForm((prev) => {
      if (name === 'regionId') {
        return {
          ...prev,
          regionId: value,
          cityId: '',
        };
      }

      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await createShop({
        ...createForm,
        ownerName: createForm.ownerName?.trim()
          ? createForm.ownerName
          : undefined,
        phone: createForm.phone?.trim() ? createForm.phone : undefined,
        email: createForm.email?.trim() ? createForm.email : undefined,
        address: createForm.address?.trim() ? createForm.address : undefined,
        website: createForm.website?.trim() ? createForm.website : undefined,
      });

      setSuccess('Shop created successfully.');
      setCreateForm(initialCreateForm);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create shop.');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (shop: Shop) => {
    setEditingShop(shop);
    setEditForm({
      code: shop.code,
      shopName: shop.shopName,
      ownerName: shop.ownerName || '',
      phone: shop.phone || '',
      email: shop.email || '',
      address: shop.address || '',
      website: shop.website || '',
      regionId: shop.region.id,
      cityId: shop.city.id,
      notifySms: shop.notifySms,
      notifyEmail: shop.notifyEmail,
      status: shop.status,
    });
    setError('');
    setSuccess('');
  };

  const closeEditModal = () => {
    setEditingShop(null);
    setEditForm(initialEditForm);
  };

  const handleEditShop = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingShop) return;

    try {
      setEditingSave(true);
      setError('');
      setSuccess('');

      await updateShop(editingShop.id, {
        ...editForm,
        ownerName: editForm.ownerName?.trim() ? editForm.ownerName : undefined,
        phone: editForm.phone?.trim() ? editForm.phone : undefined,
        email: editForm.email?.trim() ? editForm.email : undefined,
        address: editForm.address?.trim() ? editForm.address : undefined,
        website: editForm.website?.trim() ? editForm.website : undefined,
      });

      setSuccess('Shop updated successfully.');
      closeEditModal();
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update shop.');
    } finally {
      setEditingSave(false);
    }
  };

  const getStatusBadge = (status: ShopStatus) => {
    if (status === 'APPROVED') {
      return 'bg-emerald-500/15 text-emerald-400';
    }

    if (status === 'REJECTED') {
      return 'bg-red-500/15 text-red-400';
    }

    if (status === 'DISABLED') {
      return 'bg-amber-500/15 text-amber-400';
    }

    return 'bg-blue-500/15 text-blue-400';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Admin Module
          </p>
          <h1 className="mt-1 text-2xl font-bold">Shops Management</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage client shops, territory assignments, and approval status.
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
            <h2 className="text-lg font-semibold">Create Shop</h2>
            <p className="mt-1 text-sm text-slate-400">
              Add new client shops into the dairy network.
            </p>

            <form onSubmit={handleCreateShop} className="mt-6 space-y-4">
              <input
                name="code"
                value={createForm.code}
                onChange={handleCreateChange}
                required
                placeholder="Shop Code"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <input
                name="shopName"
                value={createForm.shopName}
                onChange={handleCreateChange}
                required
                placeholder="Shop Name"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <input
                name="ownerName"
                value={createForm.ownerName}
                onChange={handleCreateChange}
                placeholder="Owner Name"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <input
                name="phone"
                value={createForm.phone}
                onChange={handleCreateChange}
                placeholder="Phone"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <input
                name="email"
                type="email"
                value={createForm.email}
                onChange={handleCreateChange}
                placeholder="Email"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <input
                name="address"
                value={createForm.address}
                onChange={handleCreateChange}
                placeholder="Address"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <input
                name="website"
                value={createForm.website}
                onChange={handleCreateChange}
                placeholder="Website"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              />

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

              <SearchableSelect
                value={createForm.cityId}
                onChange={(value) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    cityId: value,
                  }))
                }
                options={createCityOptions}
                placeholder={
                  createForm.regionId
                    ? 'Type city name...'
                    : 'Select region first...'
                }
                disabled={!createForm.regionId}
              />

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="notifySms"
                    checked={!!createForm.notifySms}
                    onChange={handleCreateChange}
                    className="h-4 w-4"
                  />
                  SMS Alerts
                </label>

                <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="notifyEmail"
                    checked={!!createForm.notifyEmail}
                    onChange={handleCreateChange}
                    className="h-4 w-4"
                  />
                  Email Alerts
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? 'Creating...' : 'Create Shop'}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Shop Directory</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Current client shops across all regions.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">
                Total: {shops.length}
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  Loading shops...
                </div>
              ) : shops.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  No shops found.
                </div>
              ) : (
                <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800">
                  <thead className="bg-slate-950">
                    <tr className="text-left text-sm text-slate-400">
                      <th className="px-4 py-3 font-medium">Code</th>
                      <th className="px-4 py-3 font-medium">Shop</th>
                      <th className="px-4 py-3 font-medium">Region</th>
                      <th className="px-4 py-3 font-medium">City</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shops.map((shop) => (
                      <tr
                        key={shop.id}
                        className="border-t border-slate-800 bg-slate-900 text-sm"
                      >
                        <td className="px-4 py-3 text-slate-300">{shop.code}</td>
                        <td className="px-4 py-3 font-medium text-white">
                          {shop.shopName}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {shop.region.name}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {shop.city.name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(shop.status)}`}
                          >
                            {shop.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openEditModal(shop)}
                            className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {editingShop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Edit Shop</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Update shop profile and approval status.
                  </p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

              <form
                onSubmit={handleEditShop}
                className="mt-6 grid gap-4 md:grid-cols-2"
              >
                <input
                  name="code"
                  value={editForm.code || ''}
                  onChange={handleEditChange}
                  required
                  placeholder="Shop Code"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="shopName"
                  value={editForm.shopName || ''}
                  onChange={handleEditChange}
                  required
                  placeholder="Shop Name"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="ownerName"
                  value={editForm.ownerName || ''}
                  onChange={handleEditChange}
                  placeholder="Owner Name"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="phone"
                  value={editForm.phone || ''}
                  onChange={handleEditChange}
                  placeholder="Phone"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={handleEditChange}
                  placeholder="Email"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="website"
                  value={editForm.website || ''}
                  onChange={handleEditChange}
                  placeholder="Website"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />

                <input
                  name="address"
                  value={editForm.address || ''}
                  onChange={handleEditChange}
                  placeholder="Address"
                  className="md:col-span-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                />

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

                <SearchableSelect
                  value={editForm.cityId || ''}
                  onChange={(value) =>
                    setEditForm((prev) => ({
                      ...prev,
                      cityId: value,
                    }))
                  }
                  options={editCityOptions}
                  placeholder={
                    editForm.regionId
                      ? 'Type city name...'
                      : 'Select region first...'
                  }
                  disabled={!editForm.regionId}
                />

                <select
                  name="status"
                  value={editForm.status || 'PENDING'}
                  onChange={handleEditChange}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="DISABLED">DISABLED</option>
                </select>

                <div className="md:col-span-2 grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      name="notifySms"
                      checked={!!editForm.notifySms}
                      onChange={handleEditChange}
                      className="h-4 w-4"
                    />
                    SMS Alerts
                  </label>

                  <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      name="notifyEmail"
                      checked={!!editForm.notifyEmail}
                      onChange={handleEditChange}
                      className="h-4 w-4"
                    />
                    Email Alerts
                  </label>
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