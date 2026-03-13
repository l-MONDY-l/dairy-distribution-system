import { api } from '@/lib/api';
import type { Invoice } from '@/lib/types';

export async function getInvoices(params?: {
  shopId?: string;
  paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID' | 'FAILED';
}): Promise<Invoice[]> {
  const response = await api.get('/invoices', { params });
  return response.data;
}

