'use client';

import { useEffect, useState } from 'react';
import type { CompanyProfile } from '@/lib/types/company-profile';
import { createCompanyProfile, updateCompanyProfile } from '@/lib/company-profile-api';
import {
  companyProfileBaseSchema,
  businessTypeOptions,
  industryTypeOptions,
  workingDaysOptions,
} from '@/lib/validations/company-profile';
import { z } from 'zod';

type Props = {
  initialProfile: CompanyProfile | null;
};

type FormState = z.infer<typeof companyProfileBaseSchema>;

type SectionKey =
  | 'identity'
  | 'contacts'
  | 'factory'
  | 'management'
  | 'operations'
  | 'address'
  | 'distribution'
  | 'compliance'
  | 'finance'
  | 'system'
  | 'media';

const sectionFieldGroups: Record<SectionKey, (keyof FormState)[]> = {
  identity: [
    'companyCode',
    'legalName',
    'brandName',
    'registrationNumber',
    'taxId',
    'vatNumber',
    'businessType',
    'industryType',
    'establishedDate',
    'description',
  ],
  contacts: ['companyEmail', 'companyPhone', 'companyMobile', 'whatsappNumber', 'website'],
  factory: [
    'factoryName',
    'factoryLicenseNumber',
    'foodSafetyLicenseNumber',
    'dairyBoardRegistrationNumber',
    'processingCapacityLitersPerDay',
    'coldStorageCapacityLiters',
    'factoryPhone',
    'factoryEmail',
  ],
  management: [
    'ownerName',
    'managingDirectorName',
    'operationsManagerName',
    'financeManagerName',
    'factoryManagerName',
    'primaryContactPerson',
    'primaryContactEmail',
    'primaryContactPhone',
    'emergencyContactName',
    'emergencyContactPhone',
  ],
  operations: [
    'businessOpenTime',
    'businessCloseTime',
    'factoryOpenTime',
    'factoryCloseTime',
    'deliveryStartTime',
    'deliveryEndTime',
    'workingDays',
  ],
  address: [
    'addressLine1',
    'addressLine2',
    'street',
    'city',
    'district',
    'province',
    'postalCode',
    'country',
    'latitude',
    'longitude',
  ],
  distribution: [
    'distributionRegions',
    'fleetSize',
    'numberOfDrivers',
    'numberOfAgents',
    'dailyDeliveryCapacity',
    'supportsIslandwideDelivery',
  ],
  compliance: ['hasSLS', 'hasISO22000', 'hasHACCP', 'hasISO9001', 'certificationNotes'],
  finance: [
    'bankName',
    'bankBranch',
    'accountName',
    'accountNumber',
    'swiftCode',
    'paymentSupportEmail',
    'billingEmail',
  ],
  system: [
    'defaultCurrency',
    'timezone',
    'language',
    'invoicePrefix',
    'orderPrefix',
    'clientPrefix',
    'agentPrefix',
    'driverPrefix',
    'stockPrefix',
  ],
  media: ['logoUrl', 'profileImageUrl'],
};

export function CompanyProfileForm({ initialProfile }: Props) {
  const [form, setForm] = useState<FormState>(() => {
    if (!initialProfile) {
      return {
        companyCode: '',
        legalName: '',
        brandName: '',
        registrationNumber: '',
        taxId: null,
        vatNumber: null,
        businessType: 'PRIVATE_LIMITED',
        industryType: 'DAIRY_MANUFACTURING_DISTRIBUTION',
        companyEmail: '',
        companyPhone: '',
        companyMobile: null,
        whatsappNumber: null,
        website: null,
        logoUrl: null,
        profileImageUrl: null,
        description: null,
        establishedDate: null,
        isActive: true,
        factoryName: null,
        factoryLicenseNumber: null,
        foodSafetyLicenseNumber: null,
        dairyBoardRegistrationNumber: null,
        processingCapacityLitersPerDay: 0,
        coldStorageCapacityLiters: 0,
        factoryPhone: null,
        factoryEmail: null,
        addressLine1: '',
        addressLine2: null,
        street: null,
        city: '',
        district: '',
        province: '',
        postalCode: '',
        country: '',
        latitude: null,
        longitude: null,
        ownerName: null,
        managingDirectorName: null,
        operationsManagerName: null,
        financeManagerName: null,
        factoryManagerName: null,
        primaryContactPerson: '',
        primaryContactEmail: null,
        primaryContactPhone: '',
        emergencyContactName: null,
        emergencyContactPhone: null,
        businessOpenTime: null,
        businessCloseTime: null,
        factoryOpenTime: null,
        factoryCloseTime: null,
        deliveryStartTime: null,
        deliveryEndTime: null,
        workingDays: [],
        distributionRegions: [],
        fleetSize: 0,
        numberOfDrivers: 0,
        numberOfAgents: 0,
        dailyDeliveryCapacity: 0,
        supportsIslandwideDelivery: false,
        hasSLS: false,
        hasISO22000: false,
        hasHACCP: false,
        hasISO9001: false,
        certificationNotes: null,
        bankName: null,
        bankBranch: null,
        accountName: null,
        accountNumber: null,
        swiftCode: null,
        paymentSupportEmail: null,
        billingEmail: null,
        defaultCurrency: 'LKR',
        timezone: 'Asia/Colombo',
        language: 'en',
        invoicePrefix: 'INV-',
        orderPrefix: 'ORD-',
        clientPrefix: 'CLT-',
        agentPrefix: 'AGT-',
        driverPrefix: 'DRV-',
        stockPrefix: 'STK-',
      };
    }
    const { establishedDate, ...rest } = initialProfile;
    return {
      ...(rest as any),
      establishedDate: establishedDate ? establishedDate.split('T')[0] : null,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingSection, setSavingSection] = useState<SectionKey | null>(null);
  const [sectionSuccess, setSectionSuccess] = useState<Partial<Record<SectionKey, string>>>({});
  const [uploading, setUploading] = useState<'logo' | 'profile' | null>(null);

  useEffect(() => {
    if (initialProfile) {
      const { establishedDate, ...rest } = initialProfile;
      setForm({
        ...(rest as any),
        establishedDate: establishedDate ? establishedDate.split('T')[0] : null,
      });
    }
  }, [initialProfile]);

  const updateField = (name: keyof FormState, value: unknown) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const key = name as keyof FormState;

    if (type === 'checkbox') {
      updateField(key, checked);
    } else if (
      key === 'processingCapacityLitersPerDay' ||
      key === 'coldStorageCapacityLiters' ||
      key === 'fleetSize' ||
      key === 'numberOfDrivers' ||
      key === 'numberOfAgents' ||
      key === 'dailyDeliveryCapacity'
    ) {
      const num = value === '' ? 0 : Number(value);
      updateField(key, Number.isNaN(num) ? 0 : num);
    } else if (key === 'latitude' || key === 'longitude') {
      const num = value === '' ? null : Number(value);
      updateField(key, Number.isNaN(num as number) ? null : num);
    } else {
      updateField(key, value === '' ? null : value);
    }
  };

  const toggleWorkingDay = (day: (typeof workingDaysOptions)[number]) => {
    setForm((prev) => {
      const exists = prev.workingDays.includes(day);
      return {
        ...prev,
        workingDays: exists
          ? prev.workingDays.filter((d) => d !== day)
          : [...prev.workingDays, day],
      };
    });
  };

  const handleDistributionRegionsChange = (value: string) => {
    const parts = value
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    updateField('distributionRegions', parts);
  };

  const handleMediaUpload = async (field: 'logoUrl' | 'profileImageUrl', file: File) => {
    setUploading(field === 'logoUrl' ? 'logo' : 'profile');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (field === 'logoUrl') {
        formData.append('kind', 'company-logo');
      }

      const res = await fetch('/api/upload/profile-media', {
        method: 'POST',
        body: formData,
      });

      let body: any = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }

      if (!res.ok) {
        throw new Error(
          body?.error ||
            body?.message ||
            `Upload failed with status ${res.status}`,
        );
      }

      if (!body?.url || typeof body.url !== 'string') {
        throw new Error('Upload succeeded but no URL was returned.');
      }

      setForm((prev) => ({ ...prev, [field]: body.url as string }));
      setSectionSuccess((prev) => ({
        ...prev,
        media: 'File uploaded successfully.',
      }));
    } catch (err: unknown) {
      let message = 'Failed to upload file.';
      if (err instanceof Error && err.message) {
        message = err.message;
      }
      setErrors((prev) => ({ ...prev, _root: message }));
    } finally {
      setUploading(null);
    }
  };

  const handleSectionSave = async (section: SectionKey) => {
    setSavingSection(section);
    setErrors((prev) => {
      const next = { ...prev };
      sectionFieldGroups[section].forEach((field) => {
        delete next[field as string];
      });
      delete next._root;
      return next;
    });
    setSectionSuccess((prev) => ({ ...prev, [section]: '' }));

    const fields = sectionFieldGroups[section];
    const shape: Record<string, true> = {};
    fields.forEach((f) => {
      shape[f as string] = true;
    });

    const sectionSchema = companyProfileBaseSchema.pick(shape as any);
    const partialData: Partial<FormState> = {};
    fields.forEach((f) => {
      (partialData as any)[f] = (form as any)[f];
    });

    const parsed = sectionSchema.safeParse(partialData);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      const flatted = parsed.error.flatten();
      Object.entries(flatted.fieldErrors).forEach(([key, val]) => {
        if (val && val.length > 0) fieldErrors[key] = val[0] ?? '';
      });
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      setSavingSection(null);
      return;
    }

    try {
      if (initialProfile) {
        await updateCompanyProfile(parsed.data as any);
      } else {
        await createCompanyProfile(parsed.data as any);
      }
      setSectionSuccess((prev) => ({
        ...prev,
        [section]: 'Section saved successfully.',
      }));
    } catch (err: unknown) {
      let message = 'Failed to save section.';
      if (err instanceof Error && err.message) {
        message = err.message;
      }
      setErrors((prev) => ({ ...prev, _root: message }));
    } finally {
      setSavingSection(null);
    }
  };

  const textInput = (name: keyof FormState, label: string, required?: boolean) => (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        name={name as string}
        value={(form as any)[name] ?? ''}
        onChange={handleInputChange}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
      />
      {errors[name as string] && (
        <p className="mt-1 text-xs text-red-400">{errors[name as string]}</p>
      )}
    </div>
  );

  const emailInput = (name: keyof FormState, label: string, required?: boolean) => (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        name={name as string}
        value={(form as any)[name] ?? ''}
        onChange={handleInputChange}
        type="email"
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
      />
      {errors[name as string] && (
        <p className="mt-1 text-xs text-red-400">{errors[name as string]}</p>
      )}
    </div>
  );

  const urlInput = (name: keyof FormState, label: string, required?: boolean) => (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        name={name as string}
        value={(form as any)[name] ?? ''}
        onChange={handleInputChange}
        type="url"
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
      />
      {errors[name as string] && (
        <p className="mt-1 text-xs text-red-400">{errors[name as string]}</p>
      )}
    </div>
  );

  const numberInput = (
    name: keyof FormState,
    label: string,
    min = 0,
    step: number | 'any' = 1,
    required?: boolean,
  ) => (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        name={name as string}
        value={(form as any)[name] ?? ''}
        onChange={handleInputChange}
        type="number"
        min={min}
        step={step}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
      />
      {errors[name as string] && (
        <p className="mt-1 text-xs text-red-400">{errors[name as string]}</p>
      )}
    </div>
  );

  const timeInput = (name: keyof FormState, label: string, required?: boolean) => (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        name={name as string}
        value={(form as any)[name] ?? ''}
        onChange={handleInputChange}
        type="time"
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
      />
      {errors[name as string] && (
        <p className="mt-1 text-xs text-red-400">{errors[name as string]}</p>
      )}
    </div>
  );

  const dateInput = (name: keyof FormState, label: string, required?: boolean) => (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        name={name as string}
        value={(form as any)[name] ?? ''}
        onChange={handleInputChange}
        type="date"
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
      />
      {errors[name as string] && (
        <p className="mt-1 text-xs text-red-400">{errors[name as string]}</p>
      )}
    </div>
  );

  const checkboxInput = (name: keyof FormState, label: string) => (
    <label className="flex items-center gap-2 text-sm text-slate-200">
      <input
        type="checkbox"
        name={name as string}
        checked={Boolean((form as any)[name])}
        onChange={handleInputChange}
        className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
      />
      {label}
    </label>
  );

  return (
    <form className="space-y-8">
      {errors._root && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errors._root}
        </div>
      )}

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Company Identity</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {textInput('companyCode', 'Company Code', true)}
          {textInput('legalName', 'Legal Name', true)}
          {textInput('brandName', 'Brand Name', true)}
          {textInput('registrationNumber', 'Registration Number', true)}
          {textInput('taxId', 'Tax ID')}
          {textInput('vatNumber', 'VAT Number')}
          <div>
            <label className="mb-2 block text-sm font-medium">Business Type</label>
            <select
              name="businessType"
              value={form.businessType}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              {businessTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Industry Type</label>
            <select
              name="industryType"
              value={form.industryType}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              {industryTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          {dateInput('establishedDate', 'Established Date')}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={(form as any).description ?? ''}
            onChange={handleInputChange}
            rows={3}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSectionSave('identity')}
            disabled={savingSection === 'identity'}
            className="min-w-[140px] rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {savingSection === 'identity' ? 'Saving...' : 'Save section'}
          </button>
        </div>
        {sectionSuccess.identity && (
          <p className="pt-1 text-right text-[11px] text-emerald-300">
            {sectionSuccess.identity}
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Company Contact Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {emailInput('companyEmail', 'Company Email', true)}
          {textInput('companyPhone', 'Office Phone', true)}
          {textInput('companyMobile', 'Mobile')}
          {textInput('whatsappNumber', 'WhatsApp Number')}
          <div className="md:col-span-2">{urlInput('website', 'Website')}</div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSectionSave('contacts')}
            disabled={savingSection === 'contacts'}
            className="min-w-[140px] rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {savingSection === 'contacts' ? 'Saving...' : 'Save section'}
          </button>
        </div>
        {sectionSuccess.contacts && (
          <p className="pt-1 text-right text-[11px] text-emerald-300">
            {sectionSuccess.contacts}
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Factory Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {textInput('factoryName', 'Factory Name')}
          {textInput('factoryLicenseNumber', 'Factory License Number')}
          {textInput('foodSafetyLicenseNumber', 'Food Safety License Number')}
          {textInput('dairyBoardRegistrationNumber', 'Dairy Board Registration Number')}
          {numberInput('processingCapacityLitersPerDay', 'Processing Capacity (L / day)')}
          {numberInput('coldStorageCapacityLiters', 'Cold Storage Capacity (L)')}
          {textInput('factoryPhone', 'Factory Phone')}
          {emailInput('factoryEmail', 'Factory Email')}
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSectionSave('factory')}
            disabled={savingSection === 'factory'}
            className="min-w-[140px] rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {savingSection === 'factory' ? 'Saving...' : 'Save section'}
          </button>
        </div>
        {sectionSuccess.factory && (
          <p className="pt-1 text-right text-[11px] text-emerald-300">
            {sectionSuccess.factory}
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Contact Person / Management</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {textInput('ownerName', 'Owner Name')}
          {textInput('managingDirectorName', 'Managing Director Name')}
          {textInput('operationsManagerName', 'Operations Manager Name')}
          {textInput('financeManagerName', 'Finance Manager Name')}
          {textInput('factoryManagerName', 'Factory Manager Name')}
          {textInput('primaryContactPerson', 'Primary Contact Person', true)}
          {emailInput('primaryContactEmail', 'Primary Contact Email')}
          {textInput('primaryContactPhone', 'Primary Contact Phone', true)}
          {textInput('emergencyContactName', 'Emergency Contact Name')}
          {textInput('emergencyContactPhone', 'Emergency Contact Phone')}
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSectionSave('management')}
            disabled={savingSection === 'management'}
            className="min-w-[140px] rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {savingSection === 'management' ? 'Saving...' : 'Save section'}
          </button>
        </div>
        {sectionSuccess.management && (
          <p className="pt-1 text-right text-[11px] text-emerald-300">
            {sectionSuccess.management}
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Business Operations</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {timeInput('businessOpenTime', 'Business Open Time')}
          {timeInput('businessCloseTime', 'Business Close Time')}
          {timeInput('factoryOpenTime', 'Factory Open Time')}
          {timeInput('factoryCloseTime', 'Factory Close Time')}
          {timeInput('deliveryStartTime', 'Delivery Start Time')}
          {timeInput('deliveryEndTime', 'Delivery End Time')}
        </div>
        <div className="pt-4">
          <label className="mb-2 block text-sm font-medium">Working Days</label>
          <div className="flex flex-wrap gap-2">
            {workingDaysOptions.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWorkingDay(day)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  form.workingDays.includes(day)
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                    : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSectionSave('operations')}
            disabled={savingSection === 'operations'}
            className="min-w-[140px] rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {savingSection === 'operations' ? 'Saving...' : 'Save section'}
          </button>
        </div>
        {sectionSuccess.operations && (
          <p className="pt-1 text-right text-[11px] text-emerald-300">
            {sectionSuccess.operations}
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Address</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">{textInput('addressLine1', 'Address Line 1', true)}</div>
          <div className="md:col-span-2">{textInput('addressLine2', 'Address Line 2')}</div>
          {textInput('street', 'Street')}
          {textInput('city', 'City', true)}
          {textInput('district', 'District', true)}
          {textInput('province', 'Province', true)}
          {textInput('postalCode', 'Postal Code', true)}
          {textInput('country', 'Country', true)}
          {numberInput('latitude', 'Latitude', -90, 'any')}
          {numberInput('longitude', 'Longitude', -180, 'any')}
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSectionSave('address')}
            disabled={savingSection === 'address'}
            className="min-w-[140px] rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {savingSection === 'address' ? 'Saving...' : 'Save section'}
          </button>
        </div>
        {sectionSuccess.address && (
          <p className="pt-1 text-right text-[11px] text-emerald-300">
            {sectionSuccess.address}
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Distribution Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Distribution Regions (comma separated)
            </label>
            <input
              name="distributionRegions"
              value={form.distributionRegions.join(', ')}
              onChange={(e) => handleDistributionRegionsChange(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          {numberInput('fleetSize', 'Fleet Size')}
          {numberInput('numberOfDrivers', 'Number of Drivers')}
          {numberInput('numberOfAgents', 'Number of Agents')}
          {numberInput('dailyDeliveryCapacity', 'Daily Delivery Capacity')}
          <div className="md:col-span-2">
            {checkboxInput('supportsIslandwideDelivery', 'Supports islandwide delivery')}
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSectionSave('distribution')}
            disabled={savingSection === 'distribution'}
            className="min-w-[140px] rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {savingSection === 'distribution' ? 'Saving...' : 'Save section'}
          </button>
        </div>
        {sectionSuccess.distribution && (
          <p className="pt-1 text-right text-[11px] text-emerald-300">
            {sectionSuccess.distribution}
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Compliance &amp; Certifications</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {checkboxInput('hasSLS', 'SLS')}
          {checkboxInput('hasISO22000', 'ISO 22000')}
          {checkboxInput('hasHACCP', 'HACCP')}
          {checkboxInput('hasISO9001', 'ISO 9001')}
        </div>
        <div className="pt-4">
          <label className="mb-2 block text-sm font-medium">Certification Notes</label>
          <textarea
            name="certificationNotes"
            value={(form as any).certificationNotes ?? ''}
            onChange={handleInputChange}
            rows={3}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSectionSave('compliance')}
            disabled={savingSection === 'compliance'}
            className="min-w-[140px] rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {savingSection === 'compliance' ? 'Saving...' : 'Save section'}
          </button>
        </div>
        {sectionSuccess.compliance && (
          <p className="pt-1 text-right text-[11px] text-emerald-300">
            {sectionSuccess.compliance}
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Financial Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {textInput('bankName', 'Bank Name')}
          {textInput('bankBranch', 'Branch')}
          {textInput('accountName', 'Account Name')}
          {textInput('accountNumber', 'Account Number')}
          {textInput('swiftCode', 'SWIFT Code')}
          {emailInput('paymentSupportEmail', 'Payment Support Email')}
          <div className="md:col-span-2">{emailInput('billingEmail', 'Billing Email')}</div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSectionSave('finance')}
            disabled={savingSection === 'finance'}
            className="min-w-[140px] rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {savingSection === 'finance' ? 'Saving...' : 'Save section'}
          </button>
        </div>
        {sectionSuccess.finance && (
          <p className="pt-1 text-right text-[11px] text-emerald-300">
            {sectionSuccess.finance}
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">System Configuration</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {textInput('defaultCurrency', 'Default Currency', true)}
          {textInput('timezone', 'Timezone', true)}
          {textInput('language', 'Language')}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {textInput('invoicePrefix', 'Invoice Prefix', true)}
          {textInput('orderPrefix', 'Order Prefix', true)}
          {textInput('clientPrefix', 'Client Prefix')}
          {textInput('agentPrefix', 'Agent Prefix')}
          {textInput('driverPrefix', 'Driver Prefix')}
          {textInput('stockPrefix', 'Stock Prefix')}
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSectionSave('system')}
            disabled={savingSection === 'system'}
            className="min-w-[140px] rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {savingSection === 'system' ? 'Saving...' : 'Save section'}
          </button>
        </div>
        {sectionSuccess.system && (
          <p className="pt-1 text-right text-[11px] text-emerald-300">
            {sectionSuccess.system}
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Profile Media</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Company Logo (JPEG, PNG, WEBP, max 2MB)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleMediaUpload('logoUrl', file);
                }
              }}
              className="block w-full text-xs text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-950 hover:file:bg-emerald-400"
            />
            {form.logoUrl && (
              <div className="mt-2 flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
                  <img
                    src={form.logoUrl}
                    alt="Company logo preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="truncate text-[11px] text-slate-400">{form.logoUrl}</p>
              </div>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Profile Image (JPEG, PNG, WEBP, max 2MB)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleMediaUpload('profileImageUrl', file);
                }
              }}
              className="block w-full text-xs text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-950 hover:file:bg-emerald-400"
            />
            {form.profileImageUrl && (
              <div className="mt-2 flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
                  <img
                    src={form.profileImageUrl}
                    alt="Profile image preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="truncate text-[11px] text-slate-400">
                  {form.profileImageUrl}
                </p>
              </div>
            )}
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Files are stored as static assets under `/uploads/company` and linked to this profile.
        </p>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSectionSave('media')}
            disabled={savingSection === 'media' || uploading !== null}
            className="min-w-[140px] rounded-2xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {savingSection === 'media' || uploading !== null
              ? 'Saving...'
              : 'Save section'}
          </button>
        </div>
        {sectionSuccess.media && (
          <p className="pt-1 text-right text-[11px] text-emerald-300">
            {sectionSuccess.media}
          </p>
        )}
      </section>
    </form>
  );
}

