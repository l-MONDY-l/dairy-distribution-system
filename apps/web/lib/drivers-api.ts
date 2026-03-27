import { api } from '@/lib/api';
import type {
  CreateDriverPayload,
  DriverProfile,
  UpdateDriverPayload,
  User,
} from '@/lib/types';

export async function getDrivers(): Promise<DriverProfile[]> {
  const response = await api.get('/drivers');
  return response.data;
}

export async function getDriver(id: string): Promise<DriverProfile> {
  const response = await api.get(`/drivers/${id}`);
  return response.data;
}

export async function getAvailableDriverUsers(): Promise<User[]> {
  const response = await api.get('/drivers/available-users');
  return response.data;
}

export async function createDriver(
  payload: CreateDriverPayload,
): Promise<DriverProfile> {
  const response = await api.post('/drivers', payload);
  return response.data;
}

export async function updateDriver(
  id: string,
  payload: UpdateDriverPayload,
): Promise<DriverProfile> {
  const response = await api.patch(`/drivers/${id}`, payload);
  return response.data;
}

export async function updateDriverStatus(
  id: string,
  status: boolean,
): Promise<DriverProfile> {
  const response = await api.patch(`/drivers/${id}/status`, { status });
  return response.data;
}

export async function deleteDriver(id: string): Promise<void> {
  await api.delete(`/drivers/${id}`);
}

