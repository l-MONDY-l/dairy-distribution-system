'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PortalTargetsRewardsPage() {
  return (
    <div className="p-4 md:p-6">
      <Link
        href="/portal"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <h1 className="text-xl font-bold text-white">My Targets & Rewards</h1>
      <p className="mt-2 text-sm text-slate-400">
        View your sales targets and reward progress. This feature can be wired
        to your targets and rewards data later.
      </p>
    </div>
  );
}
