import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DispatchStatus,
  DeliveryStatus,
  OrderStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateOrderNo() {
    const count = await this.prisma.order.count();
    const next = count + 1;
    return `ORD-${next.toString().padStart(6, '0')}`;
  }

  async create(dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must have at least one item');
    }

    const shop = await this.prisma.shop.findUnique({
      where: { id: dto.shopId },
      include: { region: true, city: true },
    });

    if (!shop) throw new NotFoundException('Shop not found');

    const user = await this.prisma.user.findUnique({
      where: { id: dto.placedByUserId },
    });
    if (!user) throw new NotFoundException('User not found');

    let agentId: string | undefined = dto.agentId;
    if (!agentId && shop.assignedAgentId) {
      agentId = shop.assignedAgentId;
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map((i) => i.productId) } },
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException('One or more products not found');
    }

    let subtotal = new Prisma.Decimal(0);

    const itemsData = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitPrice = product.price;
      const lineTotal = unitPrice.mul(item.qty);
      subtotal = subtotal.add(lineTotal);
      return {
        productId: product.id,
        qty: item.qty,
        unitPrice,
        lineTotal,
      };
    });

    const discountTotal = new Prisma.Decimal(0);
    const taxTotal = new Prisma.Decimal(0);
    const grandTotal = subtotal.sub(discountTotal).add(taxTotal);

    const orderNo = await this.generateOrderNo();

    const order = await this.prisma.order.create({
      data: {
        orderNo,
        shopId: shop.id,
        placedByUserId: user.id,
        agentId,
        regionId: shop.regionId,
        cityId: shop.cityId,
        paymentType: dto.paymentType,
        subtotal,
        discountTotal,
        taxTotal,
        grandTotal,
        notes: dto.notes,
        items: {
          create: itemsData,
        },
      },
      include: {
        shop: true,
        region: true,
        city: true,
        agent: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const invoiceCount = await this.prisma.invoice.count();
    const nextInvoice = invoiceCount + 1;
    const invoiceNo = `INV-${nextInvoice.toString().padStart(6, '0')}`;

    await this.prisma.invoice.create({
      data: {
        invoiceNo,
        orderId: order.id,
        shopId: order.shopId,
        subtotal: order.subtotal,
        discountTotal: order.discountTotal,
        taxTotal: order.taxTotal,
        total: order.grandTotal,
      },
    });

    return order;
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        shop: true,
        region: true,
        city: true,
        agent: { include: { user: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignDriver(orderId: string, driverId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const driver = await this.prisma.driverProfile.findUnique({
      where: { id: driverId },
    });
    if (!driver) throw new NotFoundException('Driver not found');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        driverId,
        dispatchStatus: DispatchStatus.ASSIGNED,
        orderStatus: OrderStatus.ASSIGNED,
      },
      include: {
        shop: true,
        region: true,
        city: true,
        agent: { include: { user: true } },
        driver: { include: { user: true } },
        items: { include: { product: true } },
      },
    });

    const existingDispatch = await this.prisma.dispatch.findFirst({
      where: { orderId },
    });

    if (existingDispatch) {
      await this.prisma.dispatch.update({
        where: { id: existingDispatch.id },
        data: {
          driverId,
          deliveryStatus: DeliveryStatus.PENDING,
        },
      });
    } else {
      await this.prisma.dispatch.create({
        data: {
          orderId,
          driverId,
          deliveryStatus: DeliveryStatus.PENDING,
        },
      });
    }

    return updated;
  }

  async updateDeliveryStatus(
    orderId: string,
    dispatchStatus: DispatchStatus,
    deliveryStatus: DeliveryStatus,
    orderStatus: OrderStatus,
    remarks?: string,
  ) {
    const existing = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!existing) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        dispatchStatus,
        orderStatus,
      },
      include: {
        shop: true,
        region: true,
        city: true,
        agent: { include: { user: true } },
        driver: { include: { user: true } },
        items: { include: { product: true } },
      },
    });

    const existingDispatch = await this.prisma.dispatch.findFirst({
      where: { orderId },
    });

    if (existingDispatch) {
      await this.prisma.dispatch.update({
        where: { id: existingDispatch.id },
        data: {
          deliveryStatus,
          dispatchDate:
            dispatchStatus === DispatchStatus.DISPATCHED
              ? new Date()
              : existingDispatch.dispatchDate,
          deliveredDate:
            deliveryStatus === DeliveryStatus.DELIVERED
              ? new Date()
              : existingDispatch.deliveredDate,
          remarks,
        },
      });
    } else if (existing.driverId) {
      await this.prisma.dispatch.create({
        data: {
          orderId,
          driverId: existing.driverId,
          deliveryStatus,
          dispatchDate:
            dispatchStatus === DispatchStatus.DISPATCHED
              ? new Date()
              : undefined,
          deliveredDate:
            deliveryStatus === DeliveryStatus.DELIVERED
              ? new Date()
              : undefined,
          remarks,
        },
      });
    }

    return updated;
  }

  async getDriverTodayOrders(driverProfileId: string, date = new Date()) {
    const start = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
    );
    const end = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
    );

    return this.prisma.order.findMany({
      where: {
        driverId: driverProfileId,
        orderedAt: {
          gte: start,
          lte: end,
        },
        orderStatus: {
          in: [OrderStatus.ASSIGNED, OrderStatus.DISPATCHED],
        },
      },
      include: {
        shop: true,
        region: true,
        city: true,
        items: { include: { product: true } },
      },
      orderBy: { orderedAt: 'asc' },
    });
  }

  async getReport(params: {
    shopId?: string;
    agentId?: string;
    driverId?: string;
    status?: OrderStatus;
    from?: string;
    to?: string;
  }) {
    const where: Prisma.OrderWhereInput = {};

    if (params.shopId) where.shopId = params.shopId;
    if (params.agentId) where.agentId = params.agentId;
    if (params.driverId) where.driverId = params.driverId;
    if (params.status) where.orderStatus = params.status;

    if (params.from || params.to) {
      where.orderedAt = {};
      if (params.from) (where.orderedAt as Prisma.DateTimeFilter).gte = new Date(params.from);
      if (params.to) (where.orderedAt as Prisma.DateTimeFilter).lte = new Date(params.to);
    }

    return this.prisma.order.findMany({
      where,
      include: {
        shop: true,
        region: true,
        city: true,
        agent: { include: { user: true } },
        driver: { include: { user: true } },
      },
      orderBy: { orderedAt: 'desc' },
    });
  }
}

