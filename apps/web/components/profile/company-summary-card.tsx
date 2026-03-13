'use client';

import type { CompanyProfile } from '@/lib/types/company-profile';

type Props = {
  company: CompanyProfile | null;
};

export function CompanySummaryCard({ company }: Props) {
  const isActive = company?.isActive ?? false;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
        <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex flex-col items-center md:flex-row md:items-center md:gap-4">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white p-1 text-3xl font-semibold text-slate-950 md:mb-0">
              {company?.logoUrl ? (
                <div className="h-full w-full overflow-hidden rounded-full bg-slate-900">
                  <img
                    src={company.logoUrl}
                    alt={company.brandName ?? 'Company logo'}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                (company?.brandName?.[0]?.toUpperCase() ?? 'V')
              )}
            </div>
            <div className="space-y-1 text-sm">
              <div className="font-semibold text-slate-100 text-lg md:text-xl">
                {company?.brandName ?? 'Brand name'}
              </div>
              <div className="text-xs text-slate-400 md:text-sm">
                {company?.legalName ?? 'Legal company name'}
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1 text-[11px] text-slate-200">
              <span
                className={`h-2 w-2 rounded-full ${
                  isActive ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span>{isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 text-xs text-slate-300 md:grid-cols-4">
          <div>
            <div className="text-slate-500">Company Code</div>
            <div className="font-semibold">{company?.companyCode ?? '-'}</div>
          </div>
          <div>
            <div className="text-slate-500">Registration No.</div>
            <div>{company?.registrationNumber ?? '-'}</div>
          </div>
          <div>
            <div className="text-slate-500">Business Type</div>
            <div>{company?.businessType?.replace(/_/g, ' ') ?? '-'}</div>
          </div>
          <div>
            <div className="text-slate-500">Industry</div>
            <div>{company?.industryType?.replace(/_/g, ' ') ?? '-'}</div>
          </div>
        </div>
      </div>
      <div className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-300 md:grid-cols-2">
        <div>
          <div className="text-slate-500">Processing Capacity</div>
          <div className="font-semibold">
            {company?.processingCapacityLitersPerDay ?? 0} L / day
          </div>
        </div>
        <div>
          <div className="text-slate-500">Cold Storage Capacity</div>
          <div className="font-semibold">
            {company?.coldStorageCapacityLiters ?? 0} L
          </div>
        </div>
        <div>
          <div className="text-slate-500">Fleet Size</div>
          <div className="font-semibold">{company?.fleetSize ?? 0} vehicles</div>
        </div>
        <div>
          <div className="text-slate-500">Drivers</div>
          <div>{company?.numberOfDrivers ?? 0}</div>
        </div>
        <div>
          <div className="text-slate-500">Agents</div>
          <div>{company?.numberOfAgents ?? 0}</div>
        </div>
        <div>
          <div className="text-slate-500">Daily Delivery Capacity</div>
          <div>{company?.dailyDeliveryCapacity ?? 0} orders</div>
        </div>
      </div>

      {company && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-300 space-y-2">
          <div className="flex flex-wrap gap-1">
            {company.hasSLS && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                SLS Certified
              </span>
            )}
            {company.hasISO22000 && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                ISO 22000
              </span>
            )}
            {company.hasHACCP && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                HACCP
              </span>
            )}
            {company.hasISO9001 && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                ISO 9001
              </span>
            )}
            {!company.hasSLS &&
              !company.hasISO22000 &&
              !company.hasHACCP &&
              !company.hasISO9001 && (
                <span className="text-slate-500">No certifications yet.</span>
              )}
          </div>
          {company.certificationNotes && (
            <p className="mt-1 text-[11px] text-slate-400">{company.certificationNotes}</p>
          )}
        </div>
      )}
    </div>
  );
}

