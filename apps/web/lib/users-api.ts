import { api } from '@/lib/api';
import type {
  CreateUserPayload,
  Role,
  UpdateUserPayload,
  User,
  UserStatus,
} from '@/lib/types';

export async function getUsers(): Promise<User[]> {
  const response = await api.get('/users');
  return response.data;
}

export async function getRoles(): Promise<Role[]> {
  const response = await api.get('/roles');
  return response.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await api.post('/users', payload);
  return response.data;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<User> {
  const response = await api.patch(`/users/${id}`, payload);
  return response.data;
}

export async function updateUserStatus(
  id: string,
  status: UserStatus,
): Promise<User> {
  const response = await api.patch(`/users/${id}/status`, { status });
  return response.data;
}