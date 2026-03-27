import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/** Generate SKU from product name: first letter of each word, uppercase. e.g. "Fresh Milk" -> "FM" */
function skuFromName(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return initials || 'P';
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    let sku =
      createProductDto.sku?.trim() || skuFromName(createProductDto.name);
    let suffix = 0;
    while (true) {
      const candidate = suffix === 0 ? sku : `${sku}${suffix}`;
      const existing = await this.prisma.product.findUnique({
        where: { sku: candidate },
      });
      if (!existing) {
        sku = candidate;
        break;
      }
      suffix += 1;
    }

    const quantity = createProductDto.quantity ?? 0;
    const soldQty = createProductDto.soldQty ?? 0;
    const remainingQty =
      createProductDto.remainingQty ?? Math.max(0, quantity - soldQty);

    const createData = {
      name: createProductDto.name,
      sku,
      unitType: createProductDto.unitType ?? 'Unit',
      unitVolume: createProductDto.unitVolume,
      price: new Prisma.Decimal(createProductDto.price ?? '0'),
      status: createProductDto.status ?? true,
      description: createProductDto.description,
      imageUrl: createProductDto.imageUrl,
      agentPrice: createProductDto.agentPrice
        ? new Prisma.Decimal(createProductDto.agentPrice)
        : null,
      specialDiscount: createProductDto.specialDiscount ?? false,
      quantity,
      soldQty,
      remainingQty,
      expiryDate: createProductDto.expiryDate
        ? new Date(createProductDto.expiryDate)
        : null,
      stockCreateDate: createProductDto.stockCreateDate
        ? new Date(createProductDto.stockCreateDate)
        : new Date(),
    };
    return this.prisma.product.create({
      data: createData as Prisma.ProductUncheckedCreateInput,
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
      const skuExists = await this.prisma.product.findUnique({
        where: { sku: updateProductDto.sku },
      });

      if (skuExists) {
        throw new BadRequestException('SKU already exists');
      }
    }

    const updateData: Record<string, unknown> = {
      name: updateProductDto.name,
      sku: updateProductDto.sku,
      unitType: updateProductDto.unitType,
      unitVolume: updateProductDto.unitVolume,
      price: updateProductDto.price
        ? new Prisma.Decimal(updateProductDto.price)
        : undefined,
      status: updateProductDto.status,
      description: updateProductDto.description,
      imageUrl: updateProductDto.imageUrl,
      agentPrice: updateProductDto.agentPrice
        ? new Prisma.Decimal(updateProductDto.agentPrice)
        : undefined,
      specialDiscount: updateProductDto.specialDiscount,
      quantity: updateProductDto.quantity,
      soldQty: updateProductDto.soldQty,
      remainingQty: updateProductDto.remainingQty,
      expiryDate: updateProductDto.expiryDate
        ? new Date(updateProductDto.expiryDate)
        : undefined,
      stockCreateDate: updateProductDto.stockCreateDate
        ? new Date(updateProductDto.stockCreateDate)
        : undefined,
    };

    if (
      updateProductDto.quantity !== undefined &&
      updateProductDto.soldQty !== undefined &&
      updateProductDto.remainingQty === undefined
    ) {
      updateData.remainingQty = Math.max(
        0,
        updateProductDto.quantity - updateProductDto.soldQty,
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData as Prisma.ProductUpdateInput,
    });
  }

  async updateStatus(id: string, status: boolean) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}