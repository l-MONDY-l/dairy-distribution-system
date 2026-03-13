import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getRolePermissions(roleId: string) {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      select: { permissionId: true },
    });

    return rolePermissions.map((rp) => rp.permissionId);
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId: { notIn: permissionIds },
        },
      });

      const existing = await tx.rolePermission.findMany({
        where: { roleId },
      });
      const existingIds = new Set(
        existing.map((rp) => `${rp.roleId}:${rp.permissionId}`),
      );

      const toCreate = permissionIds.filter(
        (pid) => !existingIds.has(`${roleId}:${pid}`),
      );

      if (toCreate.length) {
        await tx.rolePermission.createMany({
          data: toCreate.map((permissionId) => ({
            roleId,
            permissionId,
          })),
          skipDuplicates: true,
        });
      }

      return tx.rolePermission.findMany({
        where: { roleId },
      });
    });
  }
}