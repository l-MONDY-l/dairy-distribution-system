import { api } from '@/lib/api';
import type { City, District, Region, Town } from '@/lib/types';

// Regions (provinces)

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

// Districts

export async function getDistricts(): Promise<District[]> {
  const response = await api.get<District[]>('/regions/districts');
  return response.data;
}

export async function createDistrict(input: {
  name: string;
  regionId: string;
}): Promise<District> {
  const response = await api.post<District>('/regions/districts', input);
  return response.data;
}

export async function updateDistrict(
  id: string,
  payload: { name?: string; status?: boolean; regionId?: string },
): Promise<District> {
  const response = await api.patch<District>(`/regions/districts/${id}`, payload);
  return response.data;
}

export async function deleteDistrict(id: string): Promise<void> {
  await api.delete(`/regions/districts/${id}`);
}

// Cities

export async function getCities(): Promise<City[]> {
  const response = await api.get<City[]>('/regions/cities');
  return response.data;
}

export async function createCity(input: {
  name: string;
  districtId: string;
}): Promise<City> {
  const response = await api.post<City>('/regions/cities', input);
  return response.data;
}

export async function updateCity(
  id: string,
  payload: { name?: string; status?: boolean; districtId?: string },
): Promise<City> {
  const response = await api.patch<City>(`/regions/cities/${id}`, payload);
  return response.data;
}

export async function deleteCity(id: string): Promise<void> {
  await api.delete(`/regions/cities/${id}`);
}

// Towns

export async function getTowns(): Promise<Town[]> {
  const response = await api.get<Town[]>('/regions/towns');
  return response.data;
}

export async function createTown(input: { name: string; cityId: string }): Promise<Town> {
  const response = await api.post<Town>('/regions/towns', input);
  return response.data;
}

export async function updateTown(
  id: string,
  payload: { name?: string; status?: boolean },
): Promise<Town> {
  const response = await api.patch<Town>(`/regions/towns/${id}`, payload);
  return response.data;
}

export async function deleteTown(id: string): Promise<void> {
  await api.delete(`/regions/towns/${id}`);
}

// Assignment options: from User Management (Users with role AGENT/DRIVER). Single source: backend.

export type AssignmentOption = { id: string; displayName: string };

export async function getAssignmentOptions(): Promise<{
  agents: AssignmentOption[];
  drivers: AssignmentOption[];
}> {
  try {
    const res = await api.get<{
      agents?: { id?: string; _id?: string; displayName?: string }[];
      drivers?: { id?: string; _id?: string; displayName?: string }[];
    }>('/regions/assignment-options');
    const data = res.data ?? {};
    const agents = (Array.isArray(data.agents) ? data.agents : []).map((a) => ({
      id: String(a?.id ?? a?._id ?? ''),
      displayName: a?.displayName?.trim() || `Agent ${String(a?.id ?? a?._id ?? '').slice(0, 8)}`,
    })).filter((a) => a.id);
    const drivers = (Array.isArray(data.drivers) ? data.drivers : []).map((d) => ({
      id: String(d?.id ?? d?._id ?? ''),
      displayName: d?.displayName?.trim() || `Driver ${String(d?.id ?? d?._id ?? '').slice(0, 8)}`,
    })).filter((d) => d.id);
    return { agents, drivers };
  } catch {
    return { agents: [], drivers: [] };
  }
}

// City assignments (legacy; agent & driver per city)
export async function getAssignments(): Promise<
  { cityId: string; agentId: string; driverId: string }[]
> {
  const response = await api.get('/regions/assignments');
  return response.data;
}

export async function upsertAssignment(
  cityId: string,
  agentId: string,
  driverId: string,
): Promise<unknown> {
  const response = await api.put(`/regions/assignments/${cityId}`, {
    agentId,
    driverId,
  });
  return response.data;
}

export async function deleteAssignment(cityId: string): Promise<void> {
  await api.delete(`/regions/assignments/${cityId}`);
}

// Town assignments (one town = one agent + one driver; no duplicate towns)
export type TownAssignmentRow = {
  townId: string;
  townName: string;
  cityId: string;
  cityName: string;
  agentId: string;
  driverId: string;
};

export async function getTownAssignments(): Promise<TownAssignmentRow[]> {
  const response = await api.get<Array<{
    townId: string;
    agentId: string;
    driverId: string;
    town?: { id: string; name: string; city?: { id: string; name: string } };
  }>>('/regions/assignments/towns');
  const list = Array.isArray(response.data) ? response.data : [];
  return list.map((a) => ({
    townId: a.townId,
    townName: a.town?.name ?? a.townId,
    cityId: a.town?.city?.id ?? '',
    cityName: a.town?.city?.name ?? '',
    agentId: a.agentId,
    driverId: a.driverId,
  }));
}

export async function upsertTownAssignment(
  townId: string,
  agentId: string,
  driverId: string,
): Promise<unknown> {
  const response = await api.put(`/regions/assignments/towns/${townId}`, {
    agentId,
    driverId,
  });
  return response.data;
}

export async function deleteTownAssignment(townId: string): Promise<void> {
  await api.delete(`/regions/assignments/towns/${townId}`);
}