import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  OrderStatus,
  PaymentStatus,
  UserStatus,
} from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('dashboard')
  async getDashboardKpis() {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [ordersToday, ordersWeek, ordersMonth, pendingOrders] =
      await Promise.all([
        this.prisma.order.count({
          where: { orderedAt: { gte: startOfToday } },
        }),
        this.prisma.order.count({
          where: { orderedAt: { gte: startOfWeek } },
        }),
        this.prisma.order.count({
          where: { orderedAt: { gte: startOfMonth } },
        }),
        this.prisma.order.count({
          where: {
            orderStatus: {
              in: [
                OrderStatus.PENDING_APPROVAL,
                OrderStatus.ASSIGNED,
                OrderStatus.DISPATCHED,
              ],
            },
          },
        }),
      ]);

    const payments = await this.prisma.payment.findMany();
    const paymentsCollected = payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    const invoices = await this.prisma.invoice.findMany({
      include: { payments: true },
    });

    let totalInvoices = 0;
    let totalPaid = 0;
    invoices.forEach((inv) => {
      totalInvoices += Number(inv.total);
      inv.payments.forEach((p) => {
        totalPaid += Number(p.amount);
      });
    });
    const outstanding = totalInvoices - totalPaid;

    const activeUsers = await this.prisma.user.count({
      where: { status: UserStatus.ACTIVE },
    });

    return {
      totalOrdersToday: ordersToday,
      totalOrdersThisWeek: ordersWeek,
      totalOrdersThisMonth: ordersMonth,
      pendingOrders,
      paymentsCollected,
      outstanding,
      activeUsers,
    };
  }
}

