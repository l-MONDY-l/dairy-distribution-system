import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const agents = await this.prisma.agentProfile.findMany({
      include: {
        user: { include: { role: true } },
        region: true,
        cityAssignments: {
          include: { city: true },
        },
        townAssignments: {
          include: {
            town: {
              include: { city: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!agents.length) {
      return agents;
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const statsOrders = await this.prisma.order.findMany({
      where: {
        agentId: { in: agents.map((a) => a.id) },
        NOT: {
          notes: {
            startsWith: '[CLIENT]',
          },
        },
        orderedAt: {
          gte: monthStart,
        },
      },
      select: {
        agentId: true,
        grandTotal: true,
        items: {
          select: {
            qty: true,
          },
        },
      },
    });

    const statsMap = new Map<
      string,
      { count: number; total: number; qty: number }
    >();
    for (const order of statsOrders) {
      if (!order.agentId) continue;
      const existing =
        statsMap.get(order.agentId) ?? { count: 0, total: 0, qty: 0 };
      const orderTotal = Number(order.grandTotal ?? 0);
      const orderQty = order.items.reduce((sum, item) => sum + item.qty, 0);
      statsMap.set(order.agentId, {
        count: existing.count + 1,
        total: existing.total + orderTotal,
        qty: existing.qty + orderQty,
      });
    }

    const shopCounts = await this.prisma.shop.groupBy({
      by: ['assignedAgentId'],
      where: { assignedAgentId: { in: agents.map((a) => a.id) } },
      _count: { id: true },
    });
    const shopCountMap = new Map<string, number>();
    for (const row of shopCounts) {
      if (row.assignedAgentId) shopCountMap.set(row.assignedAgentId, row._count.id);
    }

    return agents.map((agent) => ({
      ...agent,
      ordersAssigned: statsMap.get(agent.id)?.count ?? 0,
      currentSales: statsMap.get(agent.id)
        ? statsMap.get(agent.id)!.total.toString()
        : '0',
      currentSalesQty: statsMap.get(agent.id)?.qty ?? 0,
      registeredClientsCount: shopCountMap.get(agent.id) ?? 0,
    }));
  }

  async getAvailableUsers() {
    return this.prisma.user.findMany({
      where: {
        role: { code: 'AGENT' },
        agentProfile: null,
      },
      include: { role: true },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string) {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { id },
      include: {
        user: { include: { role: true } },
        region: true,
        cityAssignments: {
          include: { city: true },
        },
        townAssignments: {
          include: {
            town: {
              include: { city: true },
            },
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent profile not found');
    }

    return agent;
  }

  async create(createAgentDto: CreateAgentDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: createAgentDto.userId },
      include: { role: true, agentProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role.code !== 'AGENT') {
      throw new BadRequestException('Selected user is not an agent role');
    }

    if (user.agentProfile) {
      throw new BadRequestException('Agent profile already exists for this user');
    }

    const region = await this.prisma.region.findUnique({
      where: { id: createAgentDto.regionId },
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    return this.prisma.agentProfile.create({
      data: {
        userId: createAgentDto.userId,
        regionId: createAgentDto.regionId,
        monthlyTarget: new Prisma.Decimal(createAgentDto.monthlyTarget ?? '0'),
        notificationSms: createAgentDto.notificationSms ?? true,
        notificationEmail: createAgentDto.notificationEmail ?? true,
        status: createAgentDto.status ?? true,
      },
      include: {
        user: { include: { role: true } },
        region: true,
        cityAssignments: {
          include: { city: true },
        },
        townAssignments: {
          include: {
            town: {
              include: { city: true },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateAgentDto: UpdateAgentDto) {
    const existing = await this.prisma.agentProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Agent profile not found');
    }

    if (updateAgentDto.regionId) {
      const region = await this.prisma.region.findUnique({
        where: { id: updateAgentDto.regionId },
      });

      if (!region) {
        throw new NotFoundException('Region not found');
      }
    }

    return this.prisma.agentProfile.update({
      where: { id },
      data: {
        regionId: updateAgentDto.regionId,
        monthlyTarget: updateAgentDto.monthlyTarget
          ? new Prisma.Decimal(updateAgentDto.monthlyTarget)
          : undefined,
        notificationSms: updateAgentDto.notificationSms,
        notificationEmail: updateAgentDto.notificationEmail,
        status: updateAgentDto.status,
      },
      include: {
        user: { include: { role: true } },
        region: true,
        cityAssignments: {
          include: { city: true },
        },
        townAssignments: {
          include: {
            town: {
              include: { city: true },
            },
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: boolean) {
    const existing = await this.prisma.agentProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Agent profile not found');
    }

    return this.prisma.agentProfile.update({
      where: { id },
      data: { status },
      include: {
        user: { include: { role: true } },
        region: true,
        cityAssignments: {
          include: { city: true },
        },
        townAssignments: {
          include: {
            town: {
              include: { city: true },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.agentProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Agent profile not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.cityAssignment.deleteMany({ where: { agentId: id } });
      await tx.townAssignment.deleteMany({ where: { agentId: id } });
      await tx.stockAllocation.deleteMany({ where: { agentId: id } });
      await tx.discount.deleteMany({ where: { agentId: id } });
      await tx.order.updateMany({
        where: { agentId: id },
        data: { agentId: null },
      });
      await tx.return.updateMany({
        where: { agentId: id },
        data: { agentId: null },
      });
      await tx.shop.updateMany({
        where: { assignedAgentId: id },
        data: { assignedAgentId: null },
      });
      await tx.agentProfile.delete({ where: { id } });
    });

    return { deleted: true };
  }
}

