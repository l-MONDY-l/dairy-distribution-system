import { api } from '@/lib/api';

export type Company = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  contactPersonName?: string | null;
  contactEmail?: string | null;
  country?: string | null;
  street?: string | null;
  addressNo?: string | null;
  postalCode?: string | null;
  website?: string | null;
  taxId?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
};

export type UpdateCompanyPayload = Partial<Omit<Company, 'id'>>;

export async function getCompany(): Promise<Company> {
  const response = await api.get('/company');
  return response.data;
}

export async function updateCompany(
  id: string,
  payload: UpdateCompanyPayload,
): Promise<Company> {
  const response = await api.patch(`/company/${id}`, payload);
  return response.data;
}

