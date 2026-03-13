import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, PaymentType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
      include: { payments: true },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.shopId !== dto.shopId) {
      throw new BadRequestException('Shop does not match invoice');
    }

    const currentPaid = invoice.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const outstanding = Number(invoice.total) - currentPaid;

    if (dto.amount > outstanding) {
      throw new BadRequestException('Payment exceeds outstanding amount');
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        shopId: dto.shopId,
        paymentMethod: dto.paymentMethod as PaymentType,
        amount: new Prisma.Decimal(dto.amount),
        referenceNo: dto.referenceNo,
        notes: dto.notes,
      },
    });

    const newPaid = currentPaid + dto.amount;
    let paymentStatus: PaymentStatus = PaymentStatus.PARTIAL;
    if (newPaid === 0) paymentStatus = PaymentStatus.PENDING;
    else if (newPaid >= Number(invoice.total)) paymentStatus = PaymentStatus.PAID;

    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: { paymentStatus },
    });

    return payment;
  }

  async findAll(params: {
    shopId?: string;
    paymentMethod?: PaymentType;
  }) {
    return this.prisma.payment.findMany({
      where: {
        shopId: params.shopId,
        paymentMethod: params.paymentMethod,
      },
      include: {
        shop: true,
        invoice: true,
      },
      orderBy: { paidAt: 'desc' },
    });
  }
}

