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

    const registrationNoTrimmed = createShopDto.registrationNo?.trim();
    if (registrationNoTrimmed) {
      const existingBr = await this.prisma.shop.findFirst({
        where: { registrationNo: registrationNoTrimmed },
      });
      if (existingBr) {
        throw new BadRequestException('BR number already exists');
      }
    }

    const nationalIdTrimmed = createShopDto.nationalId?.trim();
    if (nationalIdTrimmed) {
      const existingNationalId = await this.prisma.shop.findFirst({
        where: { nationalId: nationalIdTrimmed },
      });
      if (existingNationalId) {
        throw new BadRequestException('National ID already exists');
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

    let townId: string | null = createShopDto.townId ?? null;
    if (townId) {
      const town = await this.prisma.town.findUnique({
        where: { id: townId },
      });
      if (!town || town.cityId !== createShopDto.cityId) {
        throw new BadRequestException('Town not found or does not belong to the selected city');
      }
    }

    // Auto-assign agent and driver from Territory & Region Management (town assignments)
    let assignedAgentId: string | null = null;
    let assignedDriverId: string | null = null;
    if (townId) {
      const townAssignment = await this.prisma.townAssignment.findUnique({
        where: { townId },
      });
      if (townAssignment) {
        assignedAgentId = townAssignment.agentId;
        assignedDriverId = townAssignment.driverId;
      }
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
        townId,
        assignedAgentId,
        assignedDriverId,
        notifySms: createShopDto.notifySms ?? true,
        notifyEmail: createShopDto.notifyEmail ?? true,
        legalBusinessName: createShopDto.legalBusinessName,
        businessType: createShopDto.businessType,
        registrationNo: createShopDto.registrationNo,
        taxId: createShopDto.taxId,
        certificateOfRegistrationUrl: createShopDto.certificateOfRegistrationUrl,
        ownerIdFrontUrl: createShopDto.ownerIdFrontUrl,
        ownerIdBackUrl: createShopDto.ownerIdBackUrl,
        shopFrontPhotoUrl: createShopDto.shopFrontPhotoUrl,
        addressLine1: createShopDto.addressLine1,
        addressLine2: createShopDto.addressLine2,
        whatsappNumber: createShopDto.whatsappNumber,
        nationalId: createShopDto.nationalId,
        ownerPhone: createShopDto.ownerPhone,
        bankAccountName: createShopDto.bankAccountName,
        bankAccountNumber: createShopDto.bankAccountNumber,
        bankName: createShopDto.bankName,
        branch: createShopDto.branch,
      },
      include: {
        region: true,
        city: true,
        town: true,
        assignedAgent: {
          include: { user: { select: { fullName: true } } },
        },
        assignedDriver: {
          include: { user: { select: { fullName: true } } },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.shop.findMany({
      include: {
        region: true,
        city: true,
        town: true,
        assignedAgent: {
          include: { user: { select: { fullName: true } } },
        },
        assignedDriver: {
          include: { user: { select: { fullName: true } } },
        },
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
        town: true,
        assignedAgent: {
          include: { user: { select: { fullName: true } } },
        },
        assignedDriver: {
          include: { user: { select: { fullName: true } } },
        },
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

    const registrationNoTrimmed = updateShopDto.registrationNo?.trim();
    if (
      registrationNoTrimmed &&
      registrationNoTrimmed !== (existingShop.registrationNo ?? '').trim()
    ) {
      const existingBr = await this.prisma.shop.findFirst({
        where: {
          registrationNo: registrationNoTrimmed,
          id: { not: id },
        },
      });
      if (existingBr) {
        throw new BadRequestException('BR number already exists');
      }
    }

    const nationalIdTrimmed = updateShopDto.nationalId?.trim();
    if (
      nationalIdTrimmed &&
      nationalIdTrimmed !== (existingShop.nationalId ?? '').trim()
    ) {
      const existingNationalId = await this.prisma.shop.findFirst({
        where: {
          nationalId: nationalIdTrimmed,
          id: { not: id },
        },
      });
      if (existingNationalId) {
        throw new BadRequestException('National ID already exists');
      }
    }

    const regionId = updateShopDto.regionId ?? existingShop.regionId;
    const cityId = updateShopDto.cityId ?? existingShop.cityId;
    let townId: string | null = updateShopDto.townId !== undefined ? updateShopDto.townId ?? null : existingShop.townId;

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

    if (townId) {
      const town = await this.prisma.town.findUnique({
        where: { id: townId },
      });
      if (!town || town.cityId !== cityId) {
        throw new BadRequestException('Town not found or does not belong to the selected city');
      }
    }

    // Resolve agent and driver from Territory & Region Management (town assignments)
    let assignedAgentId: string | null = null;
    let assignedDriverId: string | null = null;
    if (townId) {
      const townAssignment = await this.prisma.townAssignment.findUnique({
        where: { townId },
      });
      if (townAssignment) {
        assignedAgentId = townAssignment.agentId;
        assignedDriverId = townAssignment.driverId;
      }
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
        townId,
        assignedAgentId,
        assignedDriverId,
        notifySms: updateShopDto.notifySms,
        notifyEmail: updateShopDto.notifyEmail,
        status: updateShopDto.status,
        legalBusinessName: updateShopDto.legalBusinessName,
        businessType: updateShopDto.businessType,
        registrationNo: updateShopDto.registrationNo,
        taxId: updateShopDto.taxId,
        certificateOfRegistrationUrl: updateShopDto.certificateOfRegistrationUrl,
        ownerIdFrontUrl: updateShopDto.ownerIdFrontUrl,
        ownerIdBackUrl: updateShopDto.ownerIdBackUrl,
        shopFrontPhotoUrl: updateShopDto.shopFrontPhotoUrl,
        addressLine1: updateShopDto.addressLine1,
        addressLine2: updateShopDto.addressLine2,
        whatsappNumber: updateShopDto.whatsappNumber,
        nationalId: updateShopDto.nationalId,
        ownerPhone: updateShopDto.ownerPhone,
        bankAccountName: updateShopDto.bankAccountName,
        bankAccountNumber: updateShopDto.bankAccountNumber,
        bankName: updateShopDto.bankName,
        branch: updateShopDto.branch,
      },
      include: {
        region: true,
        city: true,
        town: true,
        assignedAgent: {
          include: { user: { select: { fullName: true } } },
        },
        assignedDriver: {
          include: { user: { select: { fullName: true } } },
        },
      },
    });
  }

  async remove(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    await this.prisma.shop.delete({
      where: { id },
    });

    return { deleted: true, id };
  }
}