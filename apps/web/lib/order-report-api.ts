import { api } from '@/lib/api';
import type { Order } from '@/lib/types';

export async function getOrderReport(params?: {
  shopId?: string;
  agentId?: string;
  driverId?: string;
  status?:
    | 'DRAFT'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'ASSIGNED'
    | 'DISPATCHED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REJECTED';
  from?: string;
  to?: string;
}): Promise<Order[]> {
  const res = await api.get('/orders/report', { params });
  return res.data;
}

export function exportOrderReport(params?: {
  shopId?: string;
  agentId?: string;
  driverId?: string;
  status?: string;
  from?: string;
  to?: string;
}) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = new URL('/orders/report/export', base);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  window.open(url.toString(), '_blank');
}

