import { api } from '@/lib/api';
import type { Permission } from '@/lib/types';

export async function getPermissions(): Promise<Permission[]> {
  const res = await api.get('/permissions');
  return res.data;
}

export async function getRolePermissionIds(roleId: string): Promise<string[]> {
  const res = await api.get(`/roles/${roleId}/permissions`);
  return res.data;
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  await api.patch(`/roles/${roleId}/permissions`, { permissionIds });
}

