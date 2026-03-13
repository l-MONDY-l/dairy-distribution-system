import { api } from '@/lib/api';
import type { City, Region } from '@/lib/types';

// Regions (used as districts in UI)

export async function getRegions(): Promise<Region[]> {
  const response = await api.get<Region[]>('/regions');
  return response.data;
}

export async function createRegion(name: string): Promise<Region> {
  const response = await api.post<Region>('/regions', { name });
  return response.data;
}

export async function updateRegion(
  id: string,
  payload: { name?: string; status?: boolean },
): Promise<Region> {
  const response = await api.patch<Region>(`/regions/${id}`, payload);
  return response.data;
}

export async function deleteRegion(id: string): Promise<void> {
  await api.delete(`/regions/${id}`);
}

// Cities

export async function getCities(): Promise<City[]> {
  const response = await api.get<City[]>('/regions/cities');
  return response.data;
}

export async function createCity(input: {
  name: string;
  regionId: string;
}): Promise<City> {
  const response = await api.post<City>('/regions/cities', input);
  return response.data;
}

export async function updateCity(
  id: string,
  payload: { name?: string; status?: boolean; regionId?: string },
): Promise<City> {
  const response = await api.patch<City>(`/regions/cities/${id}`, payload);
  return response.data;
}

export async function deleteCity(id: string): Promise<void> {
  await api.delete(`/regions/cities/${id}`);
}