import { api } from '@/lib/api';
import type {
  CreateStockBatchPayload,
  StockBatch,
  UpdateStockBatchPayload,
} from '@/lib/types';

export async function getStockBatches(): Promise<StockBatch[]> {
  const response = await api.get('/stock-batches');
  return response.data;
}

export async function getStockBatchesCount(): Promise<number> {
  const response = await api.get<number>('/stock-batches/count');
  return response.data;
}

export async function getStockBatchesCountByProduct(
  productId: string,
): Promise<number> {
  const response = await api.get<number>(
    `/stock-batches/count-by-product/${productId}`,
  );
  return response.data;
}

export async function createStockBatch(
  payload: CreateStockBatchPayload,
): Promise<StockBatch> {
  const response = await api.post('/stock-batches', payload);
  return response.data;
}

export async function updateStockBatch(
  id: string,
  payload: UpdateStockBatchPayload,
): Promise<StockBatch> {
  const response = await api.patch(`/stock-batches/${id}`, payload);
  return response.data;
}

export async function deleteStockBatch(id: string): Promise<void> {
  await api.delete(`/stock-batches/${id}`);
}

/** One-time backfill: create stock batch rows from existing product stock data so previous stock shows again. */
export async function backfillStockFromProducts(): Promise<{
  created: number;
  total: number;
}> {
  const response = await api.post<{ created: number; total: number }>(
    '/stock-batches/backfill-from-products',
  );
  return response.data;
}
