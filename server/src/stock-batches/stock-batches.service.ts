import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockBatchDto } from './dto/create-stock-batch.dto';
import { UpdateStockBatchDto } from './dto/update-stock-batch.dto';

@Injectable()
export class StockBatchesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.assignStockNumbersToLegacyBatches();
  }

  /** Assign sequential stockNumber (001, 002, ...) to batches that still have null. */
  private async assignStockNumbersToLegacyBatches(): Promise<void> {
    const legacy = await this.prisma.stockBatch.findMany({
      where: { stockNumber: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (legacy.length === 0) return;
    const next = await this.getNextStockNumber();
    for (let i = 0; i < legacy.length; i++) {
      await this.prisma.stockBatch.update({
        where: { id: legacy[i].id },
        data: { stockNumber: next + i },
      });
    }
  }

  private async getNextStockNumber(): Promise<number> {
    const agg = await this.prisma.stockBatch.aggregate({
      _max: { stockNumber: true },
    });
    const max = agg._max?.stockNumber ?? 0;
    return max + 1;
  }

  async create(dto: CreateStockBatchDto) {
    const quantity = dto.quantity ?? 0;
    const soldQty = dto.soldQty ?? 0;
    const remainingQty = dto.remainingQty ?? Math.max(0, quantity - soldQty);
    const stockNumber = await this.getNextStockNumber();
    const data: Prisma.StockBatchUncheckedCreateInput = {
      stockNumber,
      productId: dto.productId,
      unitType: dto.unitType ?? 'Unit',
      price: new Prisma.Decimal(dto.price ?? '0'),
      agentPrice: dto.agentPrice
        ? new Prisma.Decimal(dto.agentPrice)
        : null,
      retailPrice: dto.retailPrice
        ? new Prisma.Decimal(dto.retailPrice)
        : null,
      specialDiscount: dto.specialDiscount ?? false,
      quantity,
      soldQty,
      remainingQty,
      stockCreateDate: dto.stockCreateDate
        ? new Date(dto.stockCreateDate)
        : new Date(),
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
    };
    return this.prisma.stockBatch.create({
      data,
      include: { product: true },
    });
  }

  async findAll() {
    return this.prisma.stockBatch.findMany({
      orderBy: { createdAt: 'desc' },
      include: { product: true },
    });
  }

  async count() {
    return this.prisma.stockBatch.count();
  }

  async countByProduct(productId: string) {
    return this.prisma.stockBatch.count({
      where: { productId },
    });
  }

  async findOne(id: string) {
    const batch = await this.prisma.stockBatch.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!batch) throw new NotFoundException('Stock batch not found');
    return batch;
  }

  async update(id: string, dto: UpdateStockBatchDto) {
    await this.findOne(id);
    const updateData: Prisma.StockBatchUncheckedUpdateInput = {};
    if (dto.unitType !== undefined) updateData.unitType = dto.unitType;
    if (dto.price !== undefined)
      updateData.price = new Prisma.Decimal(dto.price);
    if (dto.agentPrice !== undefined)
      updateData.agentPrice = new Prisma.Decimal(dto.agentPrice);
    if (dto.retailPrice !== undefined)
      updateData.retailPrice = new Prisma.Decimal(dto.retailPrice);
    if (dto.specialDiscount !== undefined)
      updateData.specialDiscount = dto.specialDiscount;
    if (dto.stockCreateDate !== undefined)
      updateData.stockCreateDate = new Date(dto.stockCreateDate);
    if (dto.expiryDate !== undefined)
      updateData.expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
    if (dto.soldQty !== undefined) updateData.soldQty = dto.soldQty;
    if (dto.remainingQty !== undefined)
      updateData.remainingQty = dto.remainingQty;
    else if (
      dto.quantity !== undefined &&
      dto.soldQty !== undefined
    ) {
      updateData.remainingQty = Math.max(0, dto.quantity - dto.soldQty);
    }
    return this.prisma.stockBatch.update({
      where: { id },
      data: updateData,
      include: { product: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.stockBatch.delete({
      where: { id },
    });
  }

  /**
   * One-time backfill: create one StockBatch per Product from existing product stock data.
   * Use this so stock created before the stock_batches table was added shows in All Stock again.
   */
  async backfillFromProducts() {
    const products = await this.prisma.product.findMany();
    const existing = await this.prisma.stockBatch.findMany({
      select: { productId: true },
    });
    const productIdsWithBatch = new Set(existing.map((b) => b.productId));
    let nextStockNumber = await this.getNextStockNumber();
    let created = 0;
    for (const p of products) {
      if (productIdsWithBatch.has(p.id)) continue;
      const quantity = p.quantity ?? 0;
      const soldQty = p.soldQty ?? 0;
      const remainingQty = p.remainingQty ?? Math.max(0, quantity - soldQty);
      await this.prisma.stockBatch.create({
        data: {
          stockNumber: nextStockNumber++,
          productId: p.id,
          unitType: p.unitType ?? 'Unit',
          price: p.price,
          agentPrice: p.agentPrice,
          specialDiscount: p.specialDiscount ?? false,
          quantity,
          soldQty,
          remainingQty,
          stockCreateDate: p.stockCreateDate ?? p.createdAt,
          expiryDate: p.expiryDate,
        },
      });
      created++;
    }
    return { created, total: products.length };
  }
}
