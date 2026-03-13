import { api } from '@/lib/api';
import type { AgentProfile, Shop } from '@/lib/types';

export type DiscountRecord = {
  id: string;
  orderId: string;
  shopId: string;
  agentId: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  shop: Shop;
  agent: AgentProfile;
};

export async function getDiscounts(params?: {
  shopId?: string;
  agentId?: string;
  regionId?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  from?: string;
  to?: string;
}): Promise<DiscountRecord[]> {
  const res = await api.get('/discounts', { params });
  return res.data;
}

export async function approveDiscount(id: string, approvedById: string) {
  const res = await api.patch(`/discounts/${id}/approve`, {
    approvedById,
  });
  return res.data;
}

export async function rejectDiscount(id: string, approvedById: string) {
  const res = await api.patch(`/discounts/${id}/reject`, {
    approvedById,
  });
  return res.data;
}

