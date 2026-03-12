import { api } from '@/lib/api';
import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '@/lib/types';

export async function getProducts(): Promise<Product[]> {
  const response = await api.get('/products');
  return response.data;
}

export async function createProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  const response = await api.post('/products', payload);
  return response.data;
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<Product> {
  const response = await api.patch(`/products/${id}`, payload);
  return response.data;
}

export async function updateProductStatus(
  id: string,
  status: boolean,
): Promise<Product> {
  const response = await api.patch(`/products/${id}/status`, { status });
  return response.data;
}