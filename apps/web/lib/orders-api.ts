import { api } from '@/lib/api';
import type { CreateOrderPayload, Order } from '@/lib/types';

export async function getOrders(): Promise<Order[]> {
  const response = await api.get('/orders');
  return response.data;
}

export async function getOrder(id: string): Promise<Order> {
  const response = await api.get(`/orders/${id}`);
  return response.data;
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<Order> {
  const response = await api.post('/orders', payload);
  return response.data;
}

export type UpdateOrderPayload = {
  orderStatus?: Order['orderStatus'];
  notes?: string;
  agentId?: string | null;
  driverId?: string | null;
  paymentType?: 'CASH' | 'BANK_TRANSFER' | 'ONLINE';
  performedByUserId?: string;
};

export async function updateOrder(
  id: string,
  payload: UpdateOrderPayload,
): Promise<Order> {
  const response = await api.patch(`/orders/${id}`, payload);
  return response.data;
}

export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`/orders/${id}`);
}

