import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.driverProfile.findMany({
      include: {
        user: { include: { role: true } },
        region: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAvailableUsers() {
    return this.prisma.user.findMany({
      where: {
        role: { code: 'DRIVER' },
        driverProfile: null,
      },
      include: { role: true },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: { id },
      include: {
        user: { include: { role: true } },
        region: true,
      },
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    return driver;
  }

  async create(createDriverDto: CreateDriverDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: createDriverDto.userId },
      include: { role: true, driverProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role.code !== 'DRIVER') {
      throw new BadRequestException('Selected user is not a driver role');
    }

    if (user.driverProfile) {
      throw new BadRequestException('Driver profile already exists for this user');
    }

    const region = await this.prisma.region.findUnique({
      where: { id: createDriverDto.regionId },
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    return this.prisma.driverProfile.create({
      data: {
        userId: createDriverDto.userId,
        regionId: createDriverDto.regionId,
        vehicleNumber: createDriverDto.vehicleNumber,
        licenseNumber: createDriverDto.licenseNumber,
        fuelQuotaDaily: new Prisma.Decimal(
          createDriverDto.fuelQuotaDaily ?? '0',
        ),
        notificationSms: createDriverDto.notificationSms ?? true,
        notificationEmail: createDriverDto.notificationEmail ?? true,
        status: createDriverDto.status ?? true,
      },
      include: {
        user: { include: { role: true } },
        region: true,
      },
    });
  }

  async update(id: string, updateDriverDto: UpdateDriverDto) {
    const existing = await this.prisma.driverProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Driver profile not found');
    }

    if (updateDriverDto.regionId) {
      const region = await this.prisma.region.findUnique({
        where: { id: updateDriverDto.regionId },
      });

      if (!region) {
        throw new NotFoundException('Region not found');
      }
    }

    return this.prisma.driverProfile.update({
      where: { id },
      data: {
        regionId: updateDriverDto.regionId,
        vehicleNumber: updateDriverDto.vehicleNumber,
        licenseNumber: updateDriverDto.licenseNumber,
        fuelQuotaDaily: updateDriverDto.fuelQuotaDaily
          ? new Prisma.Decimal(updateDriverDto.fuelQuotaDaily)
          : undefined,
        notificationSms: updateDriverDto.notificationSms,
        notificationEmail: updateDriverDto.notificationEmail,
        status: updateDriverDto.status,
      },
      include: {
        user: { include: { role: true } },
        region: true,
      },
    });
  }

  async updateStatus(id: string, status: boolean) {
    const existing = await this.prisma.driverProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Driver profile not found');
    }

    return this.prisma.driverProfile.update({
      where: { id },
      data: { status },
      include: {
        user: { include: { role: true } },
        region: true,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.driverProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Driver profile not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.cityAssignment.deleteMany({ where: { driverId: id } });
      await tx.townAssignment.deleteMany({ where: { driverId: id } });
      await tx.dispatch.deleteMany({ where: { driverId: id } });
      await tx.fuelAllocation.deleteMany({ where: { driverId: id } });
      await tx.tripLog.deleteMany({ where: { driverId: id } });
      await tx.return.updateMany({
        where: { driverId: id },
        data: { driverId: null },
      });
      await tx.order.updateMany({
        where: { driverId: id },
        data: { driverId: null },
      });
      await tx.shop.updateMany({
        where: { assignedDriverId: id },
        data: { assignedDriverId: null },
      });
      await tx.driverProfile.delete({ where: { id } });
    });

    return { deleted: true };
  }
}

