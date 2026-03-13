import { api } from '@/lib/api';
import type { CreatePaymentPayload, Payment } from '@/lib/types';

export async function getPayments(params?: {
  shopId?: string;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'ONLINE';
}): Promise<Payment[]> {
  const response = await api.get('/payments', { params });
  return response.data;
}

export async function createPayment(
  payload: CreatePaymentPayload,
): Promise<Payment> {
  const response = await api.post('/payments', payload);
  return response.data;
}

