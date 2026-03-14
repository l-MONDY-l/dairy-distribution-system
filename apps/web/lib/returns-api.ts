import { api } from '@/lib/api';
import type {
  CreateReturnPayload,
  ReturnRecord,
  ReturnStatusType,
} from '@/lib/types';

export async function getReturns(params: {
  shopId?: string;
  status?: ReturnStatusType;
  from?: string;
  to?: string;
} = {}): Promise<ReturnRecord[]> {
  const response = await api.get('/returns', { params });
  return response.data;
}

export async function createReturn(
  payload: CreateReturnPayload,
): Promise<ReturnRecord> {
  const response = await api.post('/returns', payload);
  return response.data;
}

export async function updateReturnStatus(
  id: string,
  status: ReturnStatusType,
  notes?: string,
): Promise<ReturnRecord> {
  const response = await api.patch(`/returns/${id}/status`, {
    status,
    notes,
  });
  return response.data;
}

export async function updateReturn(
  id: string,
  payload: { notes?: string },
): Promise<ReturnRecord> {
  const response = await api.patch(`/returns/${id}`, payload);
  return response.data;
}

export async function deleteReturn(id: string): Promise<void> {
  await api.delete(`/returns/${id}`);
}

