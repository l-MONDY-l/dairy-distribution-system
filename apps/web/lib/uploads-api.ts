import { api } from '@/lib/api';

const MAX_KYC_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,application/pdf';

export function getUploadPreviewUrl(url: string | null | undefined): string {
  if (!url?.trim()) return '';
  if (url.startsWith('http')) return url;
  const base = api.defaults.baseURL || '';
  return base.replace(/\/$/, '') + (url.startsWith('/') ? url : '/' + url);
}

export async function uploadKycDocument(
  file: File,
): Promise<{ url: string }> {
  if (file.size > MAX_KYC_SIZE) {
    throw new Error('File must be 5MB or smaller');
  }
  const form = new FormData();
  form.append('file', file);
  const response = await api.post<{ url: string }>('/uploads/kyc', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

const PRODUCT_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';

export async function uploadProductImage(
  file: File,
): Promise<{ url: string }> {
  if (file.size > MAX_KYC_SIZE) {
    throw new Error('File must be 5MB or smaller');
  }
  const form = new FormData();
  form.append('file', file);
  const response = await api.post<{ url: string }>('/uploads/product', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export { MAX_KYC_SIZE, ACCEPT, PRODUCT_ACCEPT };
