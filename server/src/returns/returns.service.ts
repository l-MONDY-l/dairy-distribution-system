import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReturnStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateReturnNo() {
    const count = await this.prisma.return.count();
    const next = count + 1;
    return `RET-${next.toString().padStart(6, '0')}`;
  }

  async create(dto: CreateReturnDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Return must have at least one item');
    }

    const shop = await this.prisma.shop.findUnique({
      where: { id: dto.shopId },
    });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    if (!dto.agentId && !dto.driverId) {
      throw new BadRequestException('Agent or driver is required');
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map((i) => i.productId) } },
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException('One or more products not found');
    }

    const itemsData = dto.items.map((item) => {
      const total =
        item.goodQty + item.brokenQty + item.missingQty;
      if (total <= 0) {
        throw new BadRequestException(
          'Each item must have at least one quantity',
        );
      }
      return {
        productId: item.productId,
        goodQty: item.goodQty,
        brokenQty: item.brokenQty,
        missingQty: item.missingQty,
      };
    });

    const returnNo = await this.generateReturnNo();

    return this.prisma.return.create({
      data: {
        returnNo,
        shopId: shop.id,
        agentId: dto.agentId,
        driverId: dto.driverId,
        notes: dto.notes,
        status: ReturnStatus.PENDING,
        items: {
          create: itemsData,
        },
      },
      include: {
        shop: true,
        agent: { include: { user: true } },
        driver: { include: { user: true } },
        items: { include: { product: true } },
      },
    });
  }

  async findAll(params: {
    shopId?: string;
    agentId?: string;
    driverId?: string;
    status?: ReturnStatus;
    from?: string;
    to?: string;
  }) {
    const where: Prisma.ReturnWhereInput = {};

    if (params.shopId) where.shopId = params.shopId;
    if (params.agentId) where.agentId = params.agentId;
    if (params.driverId) where.driverId = params.driverId;
    if (params.status) where.status = params.status;

    if (params.from || params.to) {
      where.requestedAt = {};
      if (params.from) {
        (where.requestedAt as Prisma.DateTimeFilter).gte = new Date(
          params.from,
        );
      }
      if (params.to) {
        (where.requestedAt as Prisma.DateTimeFilter).lte = new Date(
          params.to,
        );
      }
    }

    return this.prisma.return.findMany({
      where,
      include: {
        shop: true,
        agent: { include: { user: true } },
        driver: { include: { user: true } },
        items: { include: { product: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateReturnStatusDto) {
    const existing = await this.prisma.return.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Return not found');
    }

    if (existing.status !== ReturnStatus.PENDING) {
      throw new BadRequestException(
        'Only pending returns can be updated',
      );
    }

    return this.prisma.return.update({
      where: { id },
      data: {
        status: dto.status,
        approvedAt:
          dto.status === ReturnStatus.APPROVED ? new Date() : null,
        notes: dto.notes ?? existing.notes,
      },
      include: {
        shop: true,
        agent: { include: { user: true } },
        driver: { include: { user: true } },
        items: { include: { product: true } },
      },
    });
  }
}

