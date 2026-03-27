import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DispatchStatus,
  DeliveryStatus,
  OrderStatus,
  PaymentType,
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

    return this.prisma.$transaction(async (tx) => {
      const shop = await tx.shop.findUnique({
        where: { id: dto.shopId },
        include: { region: true, city: true },
      });
      if (!shop) throw new NotFoundException('Shop not found');

      const user = await tx.user.findUnique({
        where: { id: dto.placedByUserId },
      });
      if (!user) throw new NotFoundException('User not found');

      let agentId: string | undefined = dto.agentId;
      if (!agentId && shop.assignedAgentId) {
        agentId = shop.assignedAgentId;
      }

      let driverId: string | undefined = dto.driverId;
      if (driverId) {
        const driver = await tx.driverProfile.findUnique({
          where: { id: driverId },
        });
        if (!driver) throw new NotFoundException('Driver not found');
      }

      const batches = await tx.stockBatch.findMany({
        where: { id: { in: dto.items.map((i) => i.stockBatchId) } },
        include: { product: true },
      });
      if (batches.length !== dto.items.length) {
        throw new BadRequestException('One or more stock batches not found');
      }

      // Validate stock on selected batch only
      for (const item of dto.items) {
        const batch = batches.find((b) => b.id === item.stockBatchId);
        if (!batch) {
          throw new BadRequestException('Stock batch not found for item');
        }
        if (item.productId !== batch.productId) {
          throw new BadRequestException(
            'Product does not match selected stock batch',
          );
        }
        const available = batch.remainingQty ?? 0;
        if (item.qty > available) {
          throw new BadRequestException(
            `Not enough stock for ${batch.product.name}. Requested ${item.qty}, available ${available}.`,
          );
        }
      }

      let subtotal = new Prisma.Decimal(0);
      const itemsData = dto.items.map((item) => {
        const batch = batches.find((b) => b.id === item.stockBatchId)!;
        // Use agent price for accounting when available, otherwise fall back to manufacture cost
        const unitPrice = batch.agentPrice ?? batch.price;
        const lineTotal = unitPrice.mul(item.qty);
        subtotal = subtotal.add(lineTotal);
        return {
          productId: batch.productId,
          stockBatchId: batch.id,
          qty: item.qty,
          unitPrice,
          lineTotal,
        };
      });

      const discountTotal = new Prisma.Decimal(0);
      const taxTotal = new Prisma.Decimal(0);
      const grandTotal = subtotal.sub(discountTotal).add(taxTotal);

      const orderNo = await this.generateOrderNo();

      const order = await tx.order.create({
        data: {
          orderNo,
          shopId: shop.id,
          placedByUserId: user.id,
          lastActionByUserId: user.id,
          agentId,
          driverId,
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
          agent: { include: { user: true } },
          driver: { include: { user: true } },
          items: { include: { product: true, stockBatch: true } },
        },
      });

      // After order is created, deduct from each selected stock batch:
      // decrease remainingQty, increase soldQty.
      for (const item of dto.items) {
        const batch = batches.find((b) => b.id === item.stockBatchId)!;
        await tx.stockBatch.update({
          where: { id: batch.id },
          data: {
            remainingQty: {
              decrement: item.qty,
            },
            soldQty: {
              increment: item.qty,
            },
          },
        });
      }

      const invoiceCount = await tx.invoice.count();
      const nextInvoice = invoiceCount + 1;
      const invoiceNo = `INV-${nextInvoice.toString().padStart(6, '0')}`;

      await tx.invoice.create({
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
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        shop: { include: { city: true, town: true } },
        region: true,
        city: true,
        placedByUser: true,
        lastActionByUser: true,
        agent: { include: { user: true, region: true } },
        driver: { include: { user: true, region: true } },
        items: { include: { product: true, stockBatch: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Client orders: same physical table, but logically separated by a notes tag.
  // Any order created via /client-orders will have notes starting with "[CLIENT]".
  // This method only returns those, and strips the tag before returning to callers.
  async findAllClient() {
    const orders = await this.prisma.order.findMany({
      where: {
        notes: {
          startsWith: '[CLIENT]',
        },
      },
      include: {
        shop: { include: { city: true, town: true } },
        region: true,
        city: true,
        placedByUser: true,
        lastActionByUser: true,
        agent: { include: { user: true, region: true } },
        driver: { include: { user: true, region: true } },
        items: { include: { product: true, stockBatch: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => ({
      ...o,
      notes: o.notes?.replace(/^\[CLIENT]\s*/, '') ?? null,
    }));
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        shop: { include: { city: true, town: true } },
        region: true,
        city: true,
        placedByUser: true,
        lastActionByUser: true,
        agent: { include: { user: true, region: true } },
        driver: { include: { user: true, region: true } },
        items: { include: { product: true, stockBatch: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(
    id: string,
    data: {
      orderStatus?: OrderStatus;
      notes?: string;
      agentId?: string | null;
      driverId?: string | null;
      paymentType?: PaymentType;
      actionUserId?: string | null;
    },
  ) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id },
      data: {
        ...(data.orderStatus != null && { orderStatus: data.orderStatus }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.agentId !== undefined && { agentId: data.agentId }),
        ...(data.driverId !== undefined && { driverId: data.driverId }),
        ...(data.paymentType !== undefined && {
          paymentType: data.paymentType,
        }),
        ...(data.actionUserId && { lastActionByUserId: data.actionUserId }),
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
  }

  async remove(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    // Reverse stock impact: add back qty to each batch used
    await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (!item.stockBatchId) continue;
        await tx.stockBatch.update({
          where: { id: item.stockBatchId },
          data: {
            remainingQty: { increment: item.qty },
            soldQty: { decrement: item.qty },
          },
        });
      }

      await tx.invoice.deleteMany({ where: { orderId: id } });
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });

    return { deleted: true };
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

