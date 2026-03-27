'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/reports/agents');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

