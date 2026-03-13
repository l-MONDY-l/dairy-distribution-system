import { api } from '@/lib/api';
import type { CreateOrderPayload, Order } from '@/lib/types';

export async function getOrders(): Promise<Order[]> {
  const response = await api.get('/orders');
  return response.data;
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<Order> {
  const response = await api.post('/orders', payload);
  return response.data;
}

