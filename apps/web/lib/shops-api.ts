import { api } from '@/lib/api';
import type {
  CreateShopPayload,
  Shop,
  UpdateShopPayload,
} from '@/lib/types';

export async function getShops(): Promise<Shop[]> {
  const response = await api.get('/shops');
  return response.data;
}

export async function createShop(payload: CreateShopPayload): Promise<Shop> {
  const response = await api.post('/shops', payload);
  return response.data;
}

export async function updateShop(
  id: string,
  payload: UpdateShopPayload,
): Promise<Shop> {
  const response = await api.patch(`/shops/${id}`, payload);
  return response.data;
}