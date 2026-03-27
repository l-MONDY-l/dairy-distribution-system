import AppLayout from '@/components/layout/app-layout';
import { fetchCompanyProfile, fetchCompanyProfileCompletion } from '@/lib/company-profile-api';
import { CompanySummaryCard } from '@/components/profile/company-summary-card';
import { CompanyProfileProgress } from '@/components/profile/company-profile-progress';
import { CompanyProfileForm } from '@/components/profile/company-profile-form';

export default async function CompanyProfilePage() {
  const [profile, completion] = await Promise.all([
    fetchCompanyProfile().catch((e) => {
      console.error('Failed to fetch company profile:', e);
      return null;
    }),
    fetchCompanyProfileCompletion().catch((e) => {
      console.error('Failed to fetch company profile completion:', e);
      return null;
    }),
  ]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Company Profile</h1>
          <p className="mt-1 text-sm text-slate-400">
            Master configuration for dairy manufacturing and distribution company details.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <div className="space-y-4">
            <CompanySummaryCard company={profile} />
            <CompanyProfileProgress completion={completion} />
          </div>
          <div className="space-y-4">
            <CompanyProfileForm initialProfile={profile} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

