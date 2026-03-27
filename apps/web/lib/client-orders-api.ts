import { api } from '@/lib/api';
import type { CreateOrderPayload, Order } from '@/lib/types';

export async function getClientOrders(): Promise<Order[]> {
  const response = await api.get('/client-orders');
  return response.data;
}

export async function getClientOrder(id: string): Promise<Order> {
  const response = await api.get(`/client-orders/${id}`);
  return response.data;
}

export async function createClientOrder(
  payload: CreateOrderPayload,
): Promise<Order> {
  const response = await api.post('/client-orders', payload);
  return response.data;
}

export type UpdateClientOrderPayload = {
  orderStatus?: Order['orderStatus'];
  notes?: string;
  paymentType?: 'CASH' | 'BANK_TRANSFER' | 'ONLINE';
  performedByUserId?: string;
  agentId?: string | null;
  driverId?: string | null;
};

export async function updateClientOrder(
  id: string,
  payload: UpdateClientOrderPayload,
): Promise<Order> {
  const response = await api.patch(`/client-orders/${id}`, payload);
  return response.data;
}

export async function deleteClientOrder(id: string): Promise<void> {
  await api.delete(`/client-orders/${id}`);
}

