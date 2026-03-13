import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createShopDto: CreateShopDto) {
    const existingCode = await this.prisma.shop.findUnique({
      where: { code: createShopDto.code },
    });

    if (existingCode) {
      throw new BadRequestException('Shop code already exists');
    }

    if (createShopDto.email) {
      const existingEmail = await this.prisma.shop.findUnique({
        where: { email: createShopDto.email },
      });

      if (existingEmail) {
        throw new BadRequestException('Shop email already exists');
      }
    }

    const region = await this.prisma.region.findUnique({
      where: { id: createShopDto.regionId },
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    const city = await this.prisma.city.findUnique({
      where: { id: createShopDto.cityId },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    if (city.regionId !== createShopDto.regionId) {
      throw new BadRequestException('Selected city does not belong to the selected region');
    }

    return this.prisma.shop.create({
      data: {
        code: createShopDto.code,
        shopName: createShopDto.shopName,
        ownerName: createShopDto.ownerName,
        phone: createShopDto.phone,
        email: createShopDto.email,
        address: createShopDto.address,
        website: createShopDto.website,
        regionId: createShopDto.regionId,
        cityId: createShopDto.cityId,
        notifySms: createShopDto.notifySms ?? true,
        notifyEmail: createShopDto.notifyEmail ?? true,
      },
      include: {
        region: true,
        city: true,
      },
    });
  }

  async findAll() {
    return this.prisma.shop.findMany({
      include: {
        region: true,
        city: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        region: true,
        city: true,
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return shop;
  }

  async update(id: string, updateShopDto: UpdateShopDto) {
    const existingShop = await this.prisma.shop.findUnique({
      where: { id },
    });

    if (!existingShop) {
      throw new NotFoundException('Shop not found');
    }

    if (updateShopDto.code && updateShopDto.code !== existingShop.code) {
      const codeExists = await this.prisma.shop.findUnique({
        where: { code: updateShopDto.code },
      });

      if (codeExists) {
        throw new BadRequestException('Shop code already exists');
      }
    }

    if (updateShopDto.email && updateShopDto.email !== existingShop.email) {
      const emailExists = await this.prisma.shop.findUnique({
        where: { email: updateShopDto.email },
      });

      if (emailExists) {
        throw new BadRequestException('Shop email already exists');
      }
    }

    const regionId = updateShopDto.regionId ?? existingShop.regionId;
    const cityId = updateShopDto.cityId ?? existingShop.cityId;

    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    const city = await this.prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    if (city.regionId !== regionId) {
      throw new BadRequestException('Selected city does not belong to the selected region');
    }

    return this.prisma.shop.update({
      where: { id },
      data: {
        code: updateShopDto.code,
        shopName: updateShopDto.shopName,
        ownerName: updateShopDto.ownerName,
        phone: updateShopDto.phone,
        email: updateShopDto.email,
        address: updateShopDto.address,
        website: updateShopDto.website,
        regionId,
        cityId,
        notifySms: updateShopDto.notifySms,
        notifyEmail: updateShopDto.notifyEmail,
        status: updateShopDto.status,
      },
      include: {
        region: true,
        city: true,
      },
    });
  }
}