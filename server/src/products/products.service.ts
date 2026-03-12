import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existingSku) {
      throw new BadRequestException('SKU already exists');
    }

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        sku: createProductDto.sku,
        unitType: createProductDto.unitType,
        unitVolume: createProductDto.unitVolume,
        price: new Prisma.Decimal(createProductDto.price),
        status: createProductDto.status ?? true,
      },
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

    return this.prisma.product.update({
      where: { id },
      data: {
        name: updateProductDto.name,
        sku: updateProductDto.sku,
        unitType: updateProductDto.unitType,
        unitVolume: updateProductDto.unitVolume,
        price: updateProductDto.price
          ? new Prisma.Decimal(updateProductDto.price)
          : undefined,
        status: updateProductDto.status,
      },
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
}