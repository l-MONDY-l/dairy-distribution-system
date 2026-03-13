import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Controller('agents')
export class AgentsStatsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id/sales-summary')
  async getAgentSalesSummary(
    @Param('id') agentProfileId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const dateFilter: any = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    const orders = await this.prisma.order.findMany({
      where: {
        agentId: agentProfileId,
        orderStatus: OrderStatus.DELIVERED,
        ...(from || to ? { orderedAt: dateFilter } : {}),
      },
      include: { discounts: true },
    });

    let grossSales = 0;
    let discountTotal = 0;

    orders.forEach((o) => {
      grossSales += Number(o.grandTotal);
      o.discounts.forEach((d) => {
        discountTotal += Number(d.discountValue);
      });
    });

    const netSales = grossSales - discountTotal;

    const agent = await this.prisma.agentProfile.findUnique({
      where: { id: agentProfileId },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthOrders = await this.prisma.order.findMany({
      where: {
        agentId: agentProfileId,
        orderStatus: OrderStatus.DELIVERED,
        orderedAt: { gte: startOfMonth },
      },
      include: { discounts: true },
    });

    let monthNet = 0;
    monthOrders.forEach((o) => {
      let gross = Number(o.grandTotal);
      let disc = 0;
      o.discounts.forEach((d) => (disc += Number(d.discountValue)));
      monthNet += gross - disc;
    });

    const target = agent ? Number(agent.monthlyTarget) : 0;
    const targetProgress = target > 0 ? monthNet / target : 0;

    return {
      grossSales,
      discountTotal,
      netSales,
      orderCount: orders.length,
      periodFrom: from || null,
      periodTo: to || null,
      monthlyTarget: target,
      monthNetSales: monthNet,
      targetProgress,
      achieved: target > 0 && monthNet >= target,
    };
  }

  @Get('admin/top')
  async getTopAgents(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit = '5',
  ) {
    const dateFilter: any = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    const orders = await this.prisma.order.findMany({
      where: {
        orderStatus: OrderStatus.DELIVERED,
        ...(from || to ? { orderedAt: dateFilter } : {}),
      },
      include: {
        discounts: true,
        agent: { include: { user: true, region: true } },
      },
    });

    const map = new Map<
      string,
      { agentId: string; name: string; region: string; netSales: number; orders: number }
    >();

    orders.forEach((o) => {
      if (!o.agent) return;
      const key = o.agent.id;
      const current = map.get(key) || {
        agentId: key,
        name: o.agent.user.fullName,
        region: o.agent.region.name,
        netSales: 0,
        orders: 0,
      };
      let disc = 0;
      o.discounts.forEach((d) => (disc += Number(d.discountValue)));
      const net = Number(o.grandTotal) - disc;
      current.netSales += net;
      current.orders += 1;
      map.set(key, current);
    });

    const arr = Array.from(map.values()).sort(
      (a, b) => b.netSales - a.netSales,
    );

    return arr.slice(0, Number(limit));
  }
}

