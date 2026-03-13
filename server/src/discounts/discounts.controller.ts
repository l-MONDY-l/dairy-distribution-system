import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus } from '@prisma/client';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('shopId') shopId?: string,
    @Query('agentId') agentId?: string,
    @Query('regionId') regionId?: string,
    @Query('status') status?: ApprovalStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const where: any = {};
    if (shopId) where.shopId = shopId;
    if (agentId) where.agentId = agentId;
    if (status) where.approvalStatus = status;

    if (regionId) {
      where.order = { regionId };
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    return this.prisma.discount.findMany({
      where,
      include: {
        shop: true,
        agent: { include: { user: true, region: true } },
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body('approvedById') approvedById: string,
  ) {
    return this.prisma.discount.update({
      where: { id },
      data: {
        approvalStatus: ApprovalStatus.APPROVED,
        approvedById,
        approvedAt: new Date(),
      },
    });
  }

  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body('approvedById') approvedById: string,
  ) {
    return this.prisma.discount.update({
      where: { id },
      data: {
        approvalStatus: ApprovalStatus.REJECTED,
        approvedById,
        approvedAt: new Date(),
      },
    });
  }
}

