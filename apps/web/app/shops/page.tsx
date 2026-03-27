'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import SearchableSelect from '@/components/ui/searchable-select';
import { getAgent } from '@/lib/agents-api';
import { getDriver } from '@/lib/drivers-api';
import { getCities, getRegions, getTowns } from '@/lib/regions-api';
import { createShop, deleteShop, getShops, updateShop } from '@/lib/shops-api';
import {
  ACCEPT,
  getUploadPreviewUrl,
  MAX_KYC_SIZE,
  uploadKycDocument,
} from '@/lib/uploads-api';
import type {
  AgentProfile,
  City,
  CreateShopPayload,
  DriverProfile,
  Region,
  Shop,
  ShopStatus,
  Town,
  UpdateShopPayload,
} from '@/lib/types';

const BUSINESS_TYPES = ['Retail', 'Wholesale', 'Distributor', 'Other'];

const generateShopCodeFromName = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const words = trimmed.split(/\s+/);
  const initials = words.map((w) => w[0]?.toUpperCase() ?? '').join('');
  return initials || trimmed.slice(0, 3).toUpperCase();
};

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
  townId: '',
  notifySms: true,
  notifyEmail: true,
  legalBusinessName: '',
  businessType: '',
  registrationNo: '',
  taxId: '',
  certificateOfRegistrationUrl: '',
  ownerIdFrontUrl: '',
  ownerIdBackUrl: '',
  shopFrontPhotoUrl: '',
  addressLine1: '',
  addressLine2: '',
  whatsappNumber: '',
  nationalId: '',
  ownerPhone: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankName: '',
  branch: '',
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
  townId: '',
  notifySms: true,
  notifyEmail: true,
  status: 'PENDING',
  legalBusinessName: '',
  businessType: '',
  registrationNo: '',
  taxId: '',
  certificateOfRegistrationUrl: '',
  ownerIdFrontUrl: '',
  ownerIdBackUrl: '',
  shopFrontPhotoUrl: '',
  addressLine1: '',
  addressLine2: '',
  whatsappNumber: '',
  nationalId: '',
  ownerPhone: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankName: '',
  branch: '',
};

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [towns, setTowns] = useState<Town[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSave, setEditingSave] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createForm, setCreateForm] =
    useState<CreateShopPayload>(initialCreateForm);

  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [editForm, setEditForm] = useState<UpdateShopPayload>(initialEditForm);

  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'approve' | 'reject' | 'hold';
    shop: Shop;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED'
  >('ALL');

  const [searchShopName, setSearchShopName] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [searchOwnerId, setSearchOwnerId] = useState('');
  const [searchAgent, setSearchAgent] = useState('');
  const [searchDriver, setSearchDriver] = useState('');
  const [searchTown, setSearchTown] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchBrNumber, setSearchBrNumber] = useState('');

  const [uploadingKyc, setUploadingKyc] = useState<string | null>(null);
  const [editingUploadingKyc, setEditingUploadingKyc] = useState<string | null>(
    null,
  );

  const [agentDriverDetail, setAgentDriverDetail] = useState<{
    type: 'agent' | 'driver';
    id: string;
  } | null>(null);
  const [agentDriverDetailData, setAgentDriverDetailData] = useState<
    AgentProfile | DriverProfile | null
  >(null);
  const [agentDriverDetailLoading, setAgentDriverDetailLoading] =
    useState(false);
  const [agentDriverDetailError, setAgentDriverDetailError] = useState('');

  const statusCounts = useMemo(() => {
    const pending = shops.filter((s) => s.status === 'PENDING').length;
    const approved = shops.filter((s) => s.status === 'APPROVED').length;
    const rejected = shops.filter((s) => s.status === 'REJECTED').length;
    const hold = shops.filter((s) => s.status === 'DISABLED').length;
    return { pending, approved, rejected, hold, total: shops.length };
  }, [shops]);

  const filteredShops = useMemo(() => {
    const byStatus =
      statusFilter === 'ALL'
        ? shops.filter((s) => s.status === 'PENDING')
        : shops.filter((s) => s.status === statusFilter);
    const match = (value: string | null | undefined, q: string) =>
      !q.trim() ||
      (value ?? '').toLowerCase().includes(q.trim().toLowerCase());
    return byStatus.filter((s) => {
      if (!match(s.shopName, searchShopName)) return false;
      if (!match(s.phone, searchContact) && !match(s.ownerPhone, searchContact))
        return false;
      if (!match(s.nationalId, searchOwnerId)) return false;
      if (
        !match(s.assignedAgent?.user?.fullName, searchAgent) &&
        searchAgent.trim()
      )
        return false;
      if (
        !match(s.assignedDriver?.user?.fullName, searchDriver) &&
        searchDriver.trim()
      )
        return false;
      if (!match(s.town?.name, searchTown)) return false;
      if (!match(s.city?.name, searchCity)) return false;
      if (!match(s.registrationNo, searchBrNumber)) return false;
      return true;
    });
  }, [
    shops,
    statusFilter,
    searchShopName,
    searchContact,
    searchOwnerId,
    searchAgent,
    searchDriver,
    searchTown,
    searchCity,
    searchBrNumber,
  ]);

  const hasSearchActive =
    [
      searchShopName,
      searchContact,
      searchOwnerId,
      searchAgent,
      searchDriver,
      searchTown,
      searchCity,
      searchBrNumber,
    ].some((q) => (q ?? '').trim() !== '');

  const filteredCreateCities = useMemo(
    () => cities.filter((city) => city.regionId === createForm.regionId),
    [cities, createForm.regionId],
  );

  const filteredEditCities = useMemo(
    () => cities.filter((city) => city.regionId === editForm.regionId),
    [cities, editForm.regionId],
  );

  const filteredCreateTowns = useMemo(
    () => towns.filter((t) => t.cityId === createForm.cityId),
    [towns, createForm.cityId],
  );

  const filteredEditTowns = useMemo(
    () => towns.filter((t) => t.cityId === editForm.cityId),
    [towns, editForm.cityId],
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

  /** All cities from DB — for create/edit when only City & Town are shown (no province) */
  const allCityOptions = useMemo(
    () =>
      cities.map((city) => ({
        label: city.name,
        value: city.id,
      })),
    [cities],
  );

  const createTownOptions = useMemo(
    () =>
      filteredCreateTowns.map((town) => ({
        label: town.name,
        value: town.id,
      })),
    [filteredCreateTowns],
  );

  const editTownOptions = useMemo(
    () =>
      filteredEditTowns.map((town) => ({
        label: town.name,
        value: town.id,
      })),
    [filteredEditTowns],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [shopsData, regionsData, citiesData, townsData] = await Promise.all([
        getShops(),
        getRegions(),
        getCities(),
        getTowns(),
      ]);

      setShops(shopsData);
      setRegions(regionsData);
      setCities(citiesData);
      setTowns(townsData);
    } catch {
      setError('Failed to load shop data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!agentDriverDetail) {
      setAgentDriverDetailData(null);
      setAgentDriverDetailError('');
      return;
    }
    let cancelled = false;
    setAgentDriverDetailLoading(true);
    setAgentDriverDetailError('');
    const fetchDetail = async () => {
      try {
        const data =
          agentDriverDetail.type === 'agent'
            ? await getAgent(agentDriverDetail.id)
            : await getDriver(agentDriverDetail.id);
        if (!cancelled) {
          setAgentDriverDetailData(data);
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to load details.';
        if (!cancelled) setAgentDriverDetailError(msg);
      } finally {
        if (!cancelled) setAgentDriverDetailLoading(false);
      }
    };
    void fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [agentDriverDetail]);

  const handleCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setCreateForm((prev) => {
      if (name === 'shopName') {
        const nextShopName = value;
        const currentAutoFromName = generateShopCodeFromName(prev.shopName || '');
        const isCodeEmptyOrAuto =
          !prev.code || prev.code.toUpperCase() === currentAutoFromName;
        return {
          ...prev,
          shopName: nextShopName,
          code: isCodeEmptyOrAuto
            ? generateShopCodeFromName(nextShopName)
            : prev.code,
        };
      }
      if (name === 'regionId') {
        return { ...prev, regionId: value, cityId: '', townId: '' };
      }
      if (name === 'cityId') {
        return { ...prev, cityId: value, townId: '' };
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
      if (name === 'shopName') {
        const nextShopName = value;
        return {
          ...prev,
          shopName: nextShopName,
          code: generateShopCodeFromName(nextShopName),
        };
      }
      if (name === 'regionId') {
        return { ...prev, regionId: value, cityId: '', townId: '' };
      }
      if (name === 'cityId') {
        return { ...prev, cityId: value, townId: '' };
      }
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  type KycField =
    | 'certificateOfRegistrationUrl'
    | 'ownerIdFrontUrl'
    | 'ownerIdBackUrl'
    | 'shopFrontPhotoUrl';

  const handleKycUpload = async (
    form: 'create' | 'edit',
    field: KycField,
    file: File,
  ) => {
    if (file.size > MAX_KYC_SIZE) {
      setError('File must be 5MB or smaller.');
      return;
    }
    const setUploading =
      form === 'create' ? setUploadingKyc : setEditingUploadingKyc;
    try {
      setUploading(field);
      setError('');
      const { url } = await uploadKycDocument(file);
      if (form === 'create') {
        setCreateForm((prev) => ({ ...prev, [field]: url }));
      } else {
        setEditForm((prev) => ({ ...prev, [field]: url }));
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Upload failed.';
      setError(msg);
    } finally {
      setUploading(null);
    }
  };

  const trimOptional = (s: string | undefined) =>
    (typeof s === 'string' && s.trim()) ? s.trim() : undefined;

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.cityId) {
      setError('Please select City from Territory & Region Management.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const numericParts = shops
        .map((s) => s.code)
        .filter((code) => /^SC-\d{4}$/.test(code))
        .map((code) => Number(code.slice(3)) || 0);
      const maxExisting = numericParts.length ? Math.max(...numericParts) : 0;
      const nextNumber = maxExisting + 1;
      const nextCode = `SC-${String(nextNumber).padStart(4, '0')}`;

      await createShop({
        code:
          generateShopCodeFromName(createForm.shopName) ||
          `SC-${String(nextNumber).padStart(4, '0')}`,
        shopName: createForm.shopName.trim(),
        regionId: createForm.regionId,
        cityId: createForm.cityId,
        townId: trimOptional(createForm.townId),
        notifySms: !!createForm.notifySms,
        notifyEmail: !!createForm.notifyEmail,
        ownerName: trimOptional(createForm.ownerName),
        phone: trimOptional(createForm.phone),
        email: trimOptional(createForm.email),
        address: trimOptional(createForm.address),
        website: trimOptional(createForm.website),
        legalBusinessName: trimOptional(createForm.legalBusinessName),
        businessType: trimOptional(createForm.businessType),
        registrationNo: trimOptional(createForm.registrationNo),
        taxId: trimOptional(createForm.taxId),
        certificateOfRegistrationUrl: trimOptional(createForm.certificateOfRegistrationUrl),
        ownerIdFrontUrl: trimOptional(createForm.ownerIdFrontUrl),
        ownerIdBackUrl: trimOptional(createForm.ownerIdBackUrl),
        shopFrontPhotoUrl: trimOptional(createForm.shopFrontPhotoUrl),
        addressLine1: trimOptional(createForm.addressLine1),
        addressLine2: trimOptional(createForm.addressLine2),
        whatsappNumber: trimOptional(createForm.whatsappNumber),
        nationalId: trimOptional(createForm.nationalId),
        ownerPhone: trimOptional(createForm.ownerPhone),
        bankAccountName: trimOptional(createForm.bankAccountName),
        bankAccountNumber: trimOptional(createForm.bankAccountNumber),
        bankName: trimOptional(createForm.bankName),
        branch: trimOptional(createForm.branch),
      });

      setSuccess('Shop created successfully.');
      setCreateForm(initialCreateForm);
      setCreateModalOpen(false);
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
      ownerName: shop.ownerName ?? '',
      phone: shop.phone ?? '',
      email: shop.email ?? '',
      address: shop.address ?? '',
      website: shop.website ?? '',
      regionId: shop.region.id,
      cityId: shop.city.id,
      townId: shop.townId ?? shop.town?.id ?? '',
      notifySms: shop.notifySms,
      notifyEmail: shop.notifyEmail,
      status: shop.status,
      legalBusinessName: shop.legalBusinessName ?? '',
      businessType: shop.businessType ?? '',
      registrationNo: shop.registrationNo ?? '',
      taxId: shop.taxId ?? '',
      certificateOfRegistrationUrl: shop.certificateOfRegistrationUrl ?? '',
      ownerIdFrontUrl: shop.ownerIdFrontUrl ?? '',
      ownerIdBackUrl: shop.ownerIdBackUrl ?? '',
      shopFrontPhotoUrl: shop.shopFrontPhotoUrl ?? '',
      addressLine1: shop.addressLine1 ?? '',
      addressLine2: shop.addressLine2 ?? '',
      whatsappNumber: shop.whatsappNumber ?? '',
      nationalId: shop.nationalId ?? '',
      ownerPhone: shop.ownerPhone ?? '',
      bankAccountName: shop.bankAccountName ?? '',
      bankAccountNumber: shop.bankAccountNumber ?? '',
      bankName: shop.bankName ?? '',
      branch: shop.branch ?? '',
    });
    setError('');
    setSuccess('');
  };

  const closeEditModal = () => {
    setEditingShop(null);
    setEditForm(initialEditForm);
  };

  const openConfirm = (
    type: 'delete' | 'approve' | 'reject' | 'hold',
    shop: Shop,
  ) => {
    setConfirmAction({ type, shop });
    setError('');
  };

  const closeConfirm = () => {
    setConfirmAction(null);
    setActionLoading(false);
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, shop } = confirmAction;
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      if (type === 'delete') {
        await deleteShop(shop.id);
        setSuccess(`Client "${shop.shopName}" deleted.`);
      } else {
        const status =
          type === 'approve'
            ? 'APPROVED'
            : type === 'reject'
              ? 'REJECTED'
              : 'DISABLED';
        await updateShop(shop.id, { status });
        setSuccess(`Client status set to ${status}.`);
        setStatusFilter(status);
      }
      closeConfirm();
      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          (type === 'delete' ? 'Failed to delete client.' : 'Failed to update status.'),
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditShop = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingShop) return;

    try {
      setEditingSave(true);
      setError('');
      setSuccess('');

      await updateShop(editingShop.id, {
        code: editForm.code?.trim(),
        shopName: editForm.shopName?.trim(),
        regionId: editForm.regionId,
        cityId: editForm.cityId,
        townId: trimOptional(editForm.townId),
        status: editForm.status,
        notifySms: !!editForm.notifySms,
        notifyEmail: !!editForm.notifyEmail,
        ownerName: trimOptional(editForm.ownerName),
        phone: trimOptional(editForm.phone),
        email: trimOptional(editForm.email),
        address: trimOptional(editForm.address),
        website: trimOptional(editForm.website),
        legalBusinessName: trimOptional(editForm.legalBusinessName),
        businessType: trimOptional(editForm.businessType),
        registrationNo: trimOptional(editForm.registrationNo),
        taxId: trimOptional(editForm.taxId),
        certificateOfRegistrationUrl: trimOptional(editForm.certificateOfRegistrationUrl),
        ownerIdFrontUrl: trimOptional(editForm.ownerIdFrontUrl),
        ownerIdBackUrl: trimOptional(editForm.ownerIdBackUrl),
        shopFrontPhotoUrl: trimOptional(editForm.shopFrontPhotoUrl),
        addressLine1: trimOptional(editForm.addressLine1),
        addressLine2: trimOptional(editForm.addressLine2),
        whatsappNumber: trimOptional(editForm.whatsappNumber),
        nationalId: trimOptional(editForm.nationalId),
        ownerPhone: trimOptional(editForm.ownerPhone),
        bankAccountName: trimOptional(editForm.bankAccountName),
        bankAccountNumber: trimOptional(editForm.bankAccountNumber),
        bankName: trimOptional(editForm.bankName),
        branch: trimOptional(editForm.branch),
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Client / Shop</h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage client shops, KYC, location, and approval status. Add new clients via the button.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            Add Client
          </button>
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

        <div className="flex flex-col gap-6">
          {/* Create Client modal */}
          {createModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              onClick={() => !saving && setCreateModalOpen(false)}
            >
              <div
                className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <h3 className="text-lg font-semibold">Add Client</h3>
                  <button
                    type="button"
                    onClick={() => !saving && setCreateModalOpen(false)}
                    className="rounded-xl border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                  >
                    Close
                  </button>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Add new client with KYC, location, and contact details. Sections are grouped by domain.
                </p>

            <form onSubmit={handleCreateShop} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Box 1: Identity */}
              <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm">
                <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Identity
                </h3>
                <div className="mt-4 space-y-3">
                  <input
                    value={createForm.shopName ? generateShopCodeFromName(createForm.shopName) : ''}
                    readOnly
                    placeholder="Shop Code (auto from name)"
                    className="w-full cursor-not-allowed rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-sm text-slate-300"
                  />
                  <input
                    name="shopName"
                    value={createForm.shopName}
                    onChange={handleCreateChange}
                    required
                    placeholder="Shop Name"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Box 2: Business Profile */}
              <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm">
                <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Business Profile
                </h3>
                <div className="mt-4 space-y-3">
                  <input
                    name="legalBusinessName"
                    value={createForm.legalBusinessName ?? ''}
                    onChange={handleCreateChange}
                    placeholder="Legal Business Name"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                  <select
                    name="businessType"
                    value={createForm.businessType ?? ''}
                    onChange={handleCreateChange}
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="">Select type</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    name="registrationNo"
                    value={createForm.registrationNo ?? ''}
                    onChange={handleCreateChange}
                    placeholder="Registration No"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                  <input
                    name="taxId"
                    value={createForm.taxId ?? ''}
                    onChange={handleCreateChange}
                    placeholder="Tax ID"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Box 3: KYC Documents — full width */}
              <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm lg:col-span-2">
                <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                  KYC Documents
                </h3>
                <p className="mt-1 pl-3 text-xs text-slate-500">
                  Images (JPEG, PNG, GIF, WebP) or PDF. Max 5MB per file.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {(
                    [
                      [
                        'certificateOfRegistrationUrl',
                        'Certificate of Registration',
                      ],
                      ['ownerIdFrontUrl', 'Owner ID (Front)'],
                      ['ownerIdBackUrl', 'Owner ID (Back)'],
                      ['shopFrontPhotoUrl', 'Shop Front Photo'],
                    ] as [KycField, string][]
                  ).map(([field, label]) => {
                    const url = createForm[field] ?? '';
                    const previewUrl = getUploadPreviewUrl(url || undefined);
                    const isPdf = /\.pdf$/i.test(url);
                    const loading = uploadingKyc === field;
                    return (
                      <div key={field} className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-slate-400">
                          {label}
                        </span>
                        <input
                          type="file"
                          accept={ACCEPT}
                          className="hidden"
                          id={`create-kyc-${field}`}
                          disabled={loading}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleKycUpload('create', field, f);
                            e.target.value = '';
                          }}
                        />
                        <label
                          htmlFor={loading ? undefined : `create-kyc-${field}`}
                          className={`flex cursor-pointer items-center justify-center rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-300 outline-none transition hover:border-emerald-500 hover:bg-slate-900 ${
                            loading ? 'cursor-wait opacity-70' : ''
                          }`}
                        >
                          {loading ? 'Uploading…' : 'Choose file'}
                        </label>
                        {previewUrl && (
                          <div className="min-h-[60px] rounded-lg border border-slate-600 bg-slate-900/50 p-2">
                            {isPdf ? (
                              <a
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-emerald-400 underline"
                              >
                                View document
                              </a>
                            ) : (
                              <img
                                src={previewUrl}
                                alt={label}
                                className="max-h-24 w-full rounded object-contain"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box 4: Location (City & Town from Territory & Region Management) & Contact */}
              <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm lg:col-span-2">
                <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Location & Contact
                </h3>
                <p className="mt-1 pl-3 text-xs text-slate-500">
                  City and Town are loaded from Territory & Region Management.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">
                      City
                    </label>
                    <SearchableSelect
                      value={createForm.cityId}
                      onChange={(value) => {
                        const city = cities.find((c) => c.id === value);
                        setCreateForm((prev) => ({
                          ...prev,
                          cityId: value,
                          regionId: city?.regionId ?? '',
                          townId: '',
                        }));
                      }}
                      options={allCityOptions}
                      placeholder="Select city..."
                      disabled={cities.length === 0}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">
                      Town
                    </label>
                    <SearchableSelect
                      value={createForm.townId || ''}
                      onChange={(value) =>
                        setCreateForm((prev) => ({ ...prev, townId: value }))
                      }
                      options={createTownOptions}
                      placeholder={
                        createForm.cityId
                          ? 'Select town...'
                          : 'Select city first...'
                      }
                      disabled={!createForm.cityId}
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1" />
                  <input
                    name="phone"
                    value={createForm.phone ?? ''}
                    onChange={handleCreateChange}
                    placeholder="Phone Number"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                  <input
                    name="email"
                    type="email"
                    value={createForm.email ?? ''}
                    onChange={handleCreateChange}
                    placeholder="Email"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                  <input
                    name="whatsappNumber"
                    value={createForm.whatsappNumber ?? ''}
                    onChange={handleCreateChange}
                    placeholder="Whatsapp Number"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Box 5: Owner Details */}
              <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm">
                <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Owner Details
                </h3>
                <div className="mt-4 space-y-3">
                  <input
                    name="ownerName"
                    value={createForm.ownerName ?? ''}
                    onChange={handleCreateChange}
                    placeholder="Owner Name"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                  <input
                    name="nationalId"
                    value={createForm.nationalId ?? ''}
                    onChange={handleCreateChange}
                    placeholder="National ID"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                  <input
                    name="ownerPhone"
                    value={createForm.ownerPhone ?? ''}
                    onChange={handleCreateChange}
                    placeholder="Owner Phone"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Box 6: Banking */}
              <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 shadow-sm">
                <h3 className="border-l-4 border-emerald-500/70 pl-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Banking Information
                </h3>
                <div className="mt-4 space-y-3">
                  <input
                    name="bankAccountName"
                    value={createForm.bankAccountName ?? ''}
                    onChange={handleCreateChange}
                    placeholder="Bank Account Name"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                  <input
                    name="bankAccountNumber"
                    value={createForm.bankAccountNumber ?? ''}
                    onChange={handleCreateChange}
                    placeholder="Bank Account Number"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                  <input
                    name="bankName"
                    value={createForm.bankName ?? ''}
                    onChange={handleCreateChange}
                    placeholder="Bank Name"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                  <input
                    name="branch"
                    value={createForm.branch ?? ''}
                    onChange={handleCreateChange}
                    placeholder="Branch"
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Actions — full width */}
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/80 bg-slate-800/50 p-5 lg:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      name="notifySms"
                      checked={!!createForm.notifySms}
                      onChange={handleCreateChange}
                      className="h-4 w-4 rounded border-slate-600"
                    />
                    SMS Alerts
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      name="notifyEmail"
                      checked={!!createForm.notifyEmail}
                      onChange={handleCreateChange}
                      className="h-4 w-4 rounded border-slate-600"
                    />
                    Email Alerts
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {saving ? 'Adding...' : 'Add Client'}
                </button>
              </div>
            </form>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 w-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Client Directory</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Current clients with region, city, and town.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">
                {hasSearchActive
                  ? `Showing ${filteredShops.length} of ${shops.length}`
                  : statusFilter === 'ALL'
                    ? `New clients: ${filteredShops.length}`
                    : `Showing ${filteredShops.length} of ${shops.length}`}
              </div>
            </div>

            {/* Status filter tabs: All, Approved, Rejected, Hold */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  statusFilter === 'ALL'
                    ? 'border-emerald-500/60 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <span className="block text-2xl font-bold text-white">
                  {statusCounts.pending}
                </span>
                <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  New clients
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('APPROVED')}
                className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  statusFilter === 'APPROVED'
                    ? 'border-emerald-500/60 bg-emerald-500/15 ring-2 ring-emerald-500/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <span className="block text-2xl font-bold text-white">
                  {statusCounts.approved}
                </span>
                <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Approved
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('REJECTED')}
                className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
                  statusFilter === 'REJECTED'
                    ? 'border-red-500/60 bg-red-500/15 ring-2 ring-red-500/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <span className="block text-2xl font-bold text-white">
                  {statusCounts.rejected}
                </span>
                <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Rejected
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('DISABLED')}
                className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                  statusFilter === 'DISABLED'
                    ? 'border-amber-500/60 bg-amber-500/15 ring-2 ring-amber-500/30'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <span className="block text-2xl font-bold text-white">
                  {statusCounts.hold}
                </span>
                <span className="mt-0.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Hold
                </span>
              </button>
            </div>

            {/* Smart search filters */}
            <div className="mt-6 rounded-2xl border border-slate-700/80 bg-slate-800/40 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                Search filters
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  type="text"
                  value={searchShopName}
                  onChange={(e) => setSearchShopName(e.target.value)}
                  placeholder="Shop name"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={searchContact}
                  onChange={(e) => setSearchContact(e.target.value)}
                  placeholder="Contact number"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={searchOwnerId}
                  onChange={(e) => setSearchOwnerId(e.target.value)}
                  placeholder="Owner ID (National ID)"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={searchBrNumber}
                  onChange={(e) => setSearchBrNumber(e.target.value)}
                  placeholder="BR number"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="City"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={searchTown}
                  onChange={(e) => setSearchTown(e.target.value)}
                  placeholder="Town"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={searchAgent}
                  onChange={(e) => setSearchAgent(e.target.value)}
                  placeholder="Agent"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={searchDriver}
                  onChange={(e) => setSearchDriver(e.target.value)}
                  placeholder="Driver"
                  className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>
              {hasSearchActive && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchShopName('');
                    setSearchContact('');
                    setSearchOwnerId('');
                    setSearchAgent('');
                    setSearchDriver('');
                    setSearchTown('');
                    setSearchCity('');
                    setSearchBrNumber('');
                  }}
                  className="mt-3 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="mt-6 overflow-x-auto">
              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  Loading clients...
                </div>
              ) : filteredShops.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-10 text-center text-slate-400">
                  {shops.length === 0
                    ? 'No clients found.'
                    : hasSearchActive
                      ? 'No clients match your filters. Try changing or clearing the search filters.'
                      : `No ${statusFilter === 'ALL' ? 'new' : statusFilter === 'DISABLED' ? 'hold' : statusFilter.toLowerCase()} clients.`}
                </div>
              ) : (
                <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800">
                  <thead className="bg-slate-950">
                    <tr className="text-left text-sm text-slate-400">
                      <th className="px-4 py-3 font-medium">Code</th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Contact Number</th>
                      <th className="px-4 py-3 font-medium">City</th>
                      <th className="px-4 py-3 font-medium">Town</th>
                      <th className="px-4 py-3 font-medium">BR number</th>
                      <th className="px-4 py-3 font-medium">Owner National ID</th>
                      <th className="px-4 py-3 font-medium">Agent</th>
                      <th className="px-4 py-3 font-medium">Driver</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Register Date</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShops.map((shop) => (
                      <tr
                        key={shop.id}
                        className="border-t border-slate-800 bg-slate-900 text-sm"
                      >
                        <td className="px-4 py-3 text-slate-300 font-mono">
                          {shop.code}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">
                          {shop.shopName}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {shop.phone ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {shop.city.name}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {shop.town?.name ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {shop.registrationNo ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {shop.nationalId ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {shop.assignedAgent ? (
                            <button
                              type="button"
                              onClick={() =>
                                setAgentDriverDetail({
                                  type: 'agent',
                                  id: shop.assignedAgent!.id,
                                })
                              }
                              className="text-emerald-400 underline decoration-emerald-500/50 underline-offset-2 hover:text-emerald-300"
                            >
                              {shop.assignedAgent.user?.fullName ?? '—'}
                            </button>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {shop.assignedDriver ? (
                            <button
                              type="button"
                              onClick={() =>
                                setAgentDriverDetail({
                                  type: 'driver',
                                  id: shop.assignedDriver!.id,
                                })
                              }
                              className="text-emerald-400 underline decoration-emerald-500/50 underline-offset-2 hover:text-emerald-300"
                            >
                              {shop.assignedDriver.user?.fullName ?? '—'}
                            </button>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(shop.status)}`}
                          >
                            {shop.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {shop.createdAt
                            ? new Date(shop.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                },
                              )
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(shop)}
                              className="rounded-lg border border-slate-600 bg-slate-700/50 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => openConfirm('delete', shop)}
                              className="rounded-lg border border-red-500/50 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => openConfirm('approve', shop)}
                              disabled={shop.status === 'APPROVED'}
                              className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => openConfirm('reject', shop)}
                              disabled={shop.status === 'REJECTED'}
                              className="rounded-lg border border-red-400/50 bg-red-400/10 px-2.5 py-1.5 text-xs font-medium text-red-300 hover:bg-red-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => openConfirm('hold', shop)}
                              disabled={shop.status === 'DISABLED'}
                              className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Hold
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

        {editingShop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Edit Client</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Update client profile, KYC, location, and approval status.
                  </p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleEditShop} className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3 border-l-4 border-emerald-500/50 pl-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                      Identity
                    </h3>
                    <input
                      name="code"
                      value={
                        editForm.code ||
                        (editForm.shopName
                          ? generateShopCodeFromName(editForm.shopName)
                          : '')
                      }
                      readOnly
                      placeholder="Shop Code (auto from name)"
                      className="w-full cursor-not-allowed rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-300"
                    />
                    <input
                      name="shopName"
                      value={editForm.shopName || ''}
                      onChange={handleEditChange}
                      required
                      placeholder="Shop Name"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-3 border-l-4 border-emerald-500/50 pl-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                      Status & Notifications
                    </h3>
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
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                        <input
                          type="checkbox"
                          name="notifySms"
                          checked={!!editForm.notifySms}
                          onChange={handleEditChange}
                          className="h-4 w-4"
                        />
                        SMS
                      </label>
                      <label className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                        <input
                          type="checkbox"
                          name="notifyEmail"
                          checked={!!editForm.notifyEmail}
                          onChange={handleEditChange}
                          className="h-4 w-4"
                        />
                        Email
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-l-4 border-emerald-500/70 pl-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Business Profile
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      name="legalBusinessName"
                      value={editForm.legalBusinessName ?? ''}
                      onChange={handleEditChange}
                      placeholder="Legal Business Name"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                    <select
                      name="businessType"
                      value={editForm.businessType ?? ''}
                      onChange={handleEditChange}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                    >
                      <option value="">Select type</option>
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <input
                      name="registrationNo"
                      value={editForm.registrationNo ?? ''}
                      onChange={handleEditChange}
                      placeholder="Registration No"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                    <input
                      name="taxId"
                      value={editForm.taxId ?? ''}
                      onChange={handleEditChange}
                      placeholder="Tax ID"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-3 border-l-4 border-emerald-500/70 pl-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    KYC Documents
                  </h3>
                  <p className="text-xs text-slate-500">
                    Images (JPEG, PNG, GIF, WebP) or PDF. Max 5MB per file.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {(
                      [
                        [
                          'certificateOfRegistrationUrl',
                          'Certificate of Registration',
                        ],
                        ['ownerIdFrontUrl', 'Owner ID (Front)'],
                        ['ownerIdBackUrl', 'Owner ID (Back)'],
                        ['shopFrontPhotoUrl', 'Shop Front Photo'],
                      ] as [KycField, string][]
                    ).map(([field, label]) => {
                      const url = editForm[field] ?? '';
                      const previewUrl = getUploadPreviewUrl(url || undefined);
                      const isPdf = /\.pdf$/i.test(url);
                      const loading = editingUploadingKyc === field;
                      return (
                        <div key={field} className="flex flex-col gap-2">
                          <span className="text-xs font-medium text-slate-400">
                            {label}
                          </span>
                          <input
                            type="file"
                            accept={ACCEPT}
                            className="hidden"
                            id={`edit-kyc-${field}`}
                            disabled={loading}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleKycUpload('edit', field, f);
                              e.target.value = '';
                            }}
                          />
                          <label
                            htmlFor={loading ? undefined : `edit-kyc-${field}`}
                            className={`flex cursor-pointer items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-300 outline-none transition hover:border-emerald-500 hover:bg-slate-900 ${
                              loading ? 'cursor-wait opacity-70' : ''
                            }`}
                          >
                            {loading ? 'Uploading…' : 'Choose file'}
                          </label>
                          {previewUrl && (
                            <div className="min-h-[60px] rounded-lg border border-slate-600 bg-slate-900/50 p-2">
                              {isPdf ? (
                                <a
                                  href={previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-emerald-400 underline"
                                >
                                  View document
                                </a>
                              ) : (
                                <img
                                  src={previewUrl}
                                  alt={label}
                                  className="max-h-24 w-full rounded object-contain"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 border-l-4 border-emerald-500/70 pl-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Location & Contact
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    City and Town from Territory & Region Management.
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">
                        City
                      </label>
                      <SearchableSelect
                        value={editForm.cityId || ''}
                        onChange={(value) => {
                          const city = cities.find((c) => c.id === value);
                          setEditForm((prev) => ({
                            ...prev,
                            cityId: value,
                            regionId: city?.regionId ?? '',
                            townId: '',
                          }));
                        }}
                        options={allCityOptions}
                        placeholder="Select city..."
                        disabled={cities.length === 0}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">
                        Town
                      </label>
                      <SearchableSelect
                        value={editForm.townId || ''}
                        onChange={(value) =>
                          setEditForm((prev) => ({ ...prev, townId: value }))
                        }
                        options={editTownOptions}
                        placeholder={
                          editForm.cityId
                            ? 'Select town...'
                            : 'Select city first...'
                        }
                        disabled={!editForm.cityId}
                      />
                    </div>
                    <input
                      name="phone"
                      value={editForm.phone ?? ''}
                      onChange={handleEditChange}
                      placeholder="Phone Number"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                    <input
                      name="email"
                      type="email"
                      value={editForm.email ?? ''}
                      onChange={handleEditChange}
                      placeholder="Email"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                    <input
                      name="whatsappNumber"
                      value={editForm.whatsappNumber ?? ''}
                      onChange={handleEditChange}
                      placeholder="Whatsapp Number"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500 md:col-span-2"
                    />
                  </div>
                </div>

                <div className="space-y-3 border-l-4 border-emerald-500/70 pl-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Owner Details
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      name="ownerName"
                      value={editForm.ownerName ?? ''}
                      onChange={handleEditChange}
                      placeholder="Owner Name"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                    <input
                      name="nationalId"
                      value={editForm.nationalId ?? ''}
                      onChange={handleEditChange}
                      placeholder="National ID"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                    <input
                      name="ownerPhone"
                      value={editForm.ownerPhone ?? ''}
                      onChange={handleEditChange}
                      placeholder="Owner Phone"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500 md:col-span-2"
                    />
                  </div>
                </div>

                <div className="space-y-3 border-l-4 border-emerald-500/70 pl-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                    Banking Information
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      name="bankAccountName"
                      value={editForm.bankAccountName ?? ''}
                      onChange={handleEditChange}
                      placeholder="Bank Account Name"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                    <input
                      name="bankAccountNumber"
                      value={editForm.bankAccountNumber ?? ''}
                      onChange={handleEditChange}
                      placeholder="Bank Account Number"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                    <input
                      name="bankName"
                      value={editForm.bankName ?? ''}
                      onChange={handleEditChange}
                      placeholder="Bank Name"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                    <input
                      name="branch"
                      value={editForm.branch ?? ''}
                      onChange={handleEditChange}
                      placeholder="Branch"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
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

        {agentDriverDetail && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setAgentDriverDetail(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {agentDriverDetail.type === 'agent'
                    ? 'Agent details'
                    : 'Driver details'}
                </h3>
                <button
                  type="button"
                  onClick={() => setAgentDriverDetail(null)}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
              {agentDriverDetailLoading && (
                <p className="mt-4 text-sm text-slate-400">Loading…</p>
              )}
              {agentDriverDetailError && (
                <p className="mt-4 text-sm text-red-400">
                  {agentDriverDetailError}
                </p>
              )}
              {!agentDriverDetailLoading &&
                !agentDriverDetailError &&
                agentDriverDetailData && (
                  <div className="mt-4 space-y-4">
                    {'monthlyTarget' in agentDriverDetailData ? (
                      <>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Name
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {agentDriverDetailData.user?.fullName ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Email
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {agentDriverDetailData.user?.email ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Phone
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {agentDriverDetailData.user?.phone ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Region
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {agentDriverDetailData.region?.name ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Role
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {agentDriverDetailData.user?.role?.name ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Monthly target
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {agentDriverDetailData.monthlyTarget ?? '—'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Name
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {agentDriverDetailData.user?.fullName ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Email
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {agentDriverDetailData.user?.email ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Phone
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {agentDriverDetailData.user?.phone ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Region
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {agentDriverDetailData.region?.name ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Role
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {agentDriverDetailData.user?.role?.name ?? '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Vehicle number
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {'vehicleNumber' in agentDriverDetailData
                              ? agentDriverDetailData.vehicleNumber ?? '—'
                              : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            License number
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {'licenseNumber' in agentDriverDetailData
                              ? agentDriverDetailData.licenseNumber ?? '—'
                              : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-slate-500">
                            Fuel quota (daily)
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {'fuelQuotaDaily' in agentDriverDetailData
                              ? agentDriverDetailData.fuelQuotaDaily ?? '—'
                              : '—'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
            </div>
          </div>
        )}

        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white">
                {confirmAction.type === 'delete'
                  ? 'Delete client?'
                  : confirmAction.type === 'approve'
                    ? 'Approve client?'
                    : confirmAction.type === 'reject'
                      ? 'Reject client?'
                      : 'Put client on hold?'}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {confirmAction.type === 'delete' ? (
                  <>
                    Are you sure you want to delete{' '}
                    <strong className="text-slate-200">
                      {confirmAction.shop.shopName}
                    </strong>
                    ? This cannot be undone.
                  </>
                ) : (
                  <>
                    Set status of{' '}
                    <strong className="text-slate-200">
                      {confirmAction.shop.shopName}
                    </strong>
                    {' '}
                    to{' '}
                    {confirmAction.type === 'approve'
                      ? 'Approved'
                      : confirmAction.type === 'reject'
                        ? 'Rejected'
                        : 'Hold (Disabled)'}
                    .
                  </>
                )}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeConfirm}
                  disabled={actionLoading}
                  className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeConfirmAction}
                  disabled={actionLoading}
                  className={
                    confirmAction.type === 'delete'
                      ? 'rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50'
                      : 'rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50'
                  }
                >
                  {actionLoading
                    ? 'Please wait...'
                    : confirmAction.type === 'delete'
                      ? 'Delete'
                      : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}