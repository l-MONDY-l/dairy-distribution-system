import { Injectable } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceFiltersDto } from './dto/invoice-filters.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: InvoiceFiltersDto) {
    const where: Prisma.InvoiceWhereInput = {};

    if (filters.shopId) where.shopId = filters.shopId;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: {
        shop: true,
        order: true,
        payments: true,
      },
      orderBy: { issuedAt: 'desc' },
    });

    return invoices.map((inv) => {
      const paid = inv.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );
      const outstanding = Number(inv.total) - paid;

      return {
        ...inv,
        paidAmount: paid,
        outstanding,
      };
    });
  }

  async getOutstandingByShop(shopId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { shopId },
      include: { payments: true },
    });

    let total = 0;
    let paid = 0;

    invoices.forEach((inv) => {
      total += Number(inv.total);
      inv.payments.forEach((p) => {
        paid += Number(p.amount);
      });
    });

    return {
      shopId,
      total,
      paid,
      outstanding: total - paid,
    };
  }
}

