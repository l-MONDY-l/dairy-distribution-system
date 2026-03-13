import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRegions() {
    return this.prisma.region.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getCities() {
    return this.prisma.city.findMany({
      include: { region: true },
      orderBy: [{ region: { name: 'asc' } }, { name: 'asc' }],
    });
  }

  async createCity(name: string, regionId: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new BadRequestException('City name is required');
    }
    if (!regionId) {
      throw new BadRequestException('Region is required for city');
    }

    return this.prisma.city.create({
      data: {
        name: trimmed,
        regionId,
        status: true,
      },
    });
  }

  async updateCity(
    id: string,
    payload: { name?: string; status?: boolean; regionId?: string },
  ) {
    const data: { name?: string; status?: boolean; regionId?: string } = {};

    if (typeof payload.name === 'string') {
      const trimmed = payload.name.trim();
      if (!trimmed) {
        throw new BadRequestException('City name cannot be empty');
      }
      data.name = trimmed;
    }

    if (typeof payload.status === 'boolean') {
      data.status = payload.status;
    }

    if (typeof payload.regionId === 'string' && payload.regionId) {
      data.regionId = payload.regionId;
    }

    return this.prisma.city.update({
      where: { id },
      data,
    });
  }

  async deleteCity(id: string) {
    await this.prisma.city.delete({ where: { id } });
    return { deleted: true };
  }

  // ----- City assignments -----

  async getCityAssignments() {
    return (this.prisma as any).cityAssignment.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async upsertCityAssignment(params: {
    cityId: string;
    agentId: string;
    driverId: string;
  }) {
    const { cityId, agentId, driverId } = params;

    const city = await this.prisma.city.findUnique({ where: { id: cityId } });
    if (!city) {
      throw new NotFoundException('City not found');
    }

    const agent = await this.prisma.agentProfile.findUnique({
      where: { id: agentId },
    });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const driver = await this.prisma.driverProfile.findUnique({
      where: { id: driverId },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return (this.prisma as any).cityAssignment.upsert({
      where: { cityId },
      update: { agentId, driverId },
      create: {
        cityId,
        agentId,
        driverId,
      },
    });
  }

  async deleteCityAssignment(cityId: string) {
    // If there is no assignment, treat as success
    const existing = await (this.prisma as any).cityAssignment.findUnique({
      where: { cityId },
    });
    if (!existing) {
      return { deleted: false };
    }
    await (this.prisma as any).cityAssignment.delete({ where: { cityId } });
    return { deleted: true };
  }

  // ----- Simple region management -----

  async createRegion(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new BadRequestException('Region name is required');
    }

    const code = trimmed.toUpperCase().replace(/\s+/g, '_');

    return this.prisma.region.create({
      data: {
        name: trimmed,
        code,
        status: true,
      },
    });
  }

  async updateRegion(id: string, payload: { name?: string; status?: boolean }) {
    const data: { name?: string; status?: boolean } = {};

    if (typeof payload.name === 'string') {
      const trimmed = payload.name.trim();
      if (!trimmed) {
        throw new BadRequestException('Region name cannot be empty');
      }
      data.name = trimmed;
    }

    if (typeof payload.status === 'boolean') {
      data.status = payload.status;
    }

    return this.prisma.region.update({
      where: { id },
      data,
    });
  }

  async deleteRegion(id: string) {
    // Simple delete; if there are dependent records DB will reject
    await this.prisma.region.delete({ where: { id } });
    return { deleted: true };
  }

  async seedDefaults() {
    // Predefined Sri Lanka regions (district-level) to match legacy app
    const regions = [
      { name: 'Ampara', code: 'AMPARA' },
      { name: 'Anuradhapura', code: 'ANURADHAPURA' },
      { name: 'Badulla', code: 'BADULLA' },
      { name: 'Batticaloa', code: 'BATTICALOA' },
      { name: 'Colombo', code: 'COLOMBO' },
      { name: 'Galle', code: 'GALLE' },
      { name: 'Gampaha', code: 'GAMPAHA' },
      { name: 'Hambantota', code: 'HAMBANTOTA' },
      { name: 'Jaffna', code: 'JAFFNA' },
      { name: 'Kalutara', code: 'KALUTARA' },
      { name: 'Kandy', code: 'KANDY' },
      { name: 'Kegalle', code: 'KEGALLE' },
      { name: 'Kilinochchi', code: 'KILINOCHCHI' },
      { name: 'Kurunegala', code: 'KURUNEGALA' },
      { name: 'Mannar', code: 'MANNAR' },
      { name: 'Matale', code: 'MATALE' },
      { name: 'Matara', code: 'MATARA' },
      { name: 'Moneragala', code: 'MONERAGALA' },
      { name: 'Mullaitivu', code: 'MULLAITIVU' },
      { name: 'Nuwara Eliya', code: 'NUWARA_ELIYA' },
      { name: 'Polonnaruwa', code: 'POLONNARUWA' },
      { name: 'Puttalam', code: 'PUTTALAM' },
      { name: 'Ratnapura', code: 'RATNAPURA' },
      { name: 'Trincomalee', code: 'TRINCOMALEE' },
      { name: 'Vavuniya', code: 'VAVUNIYA' },
    ];

    for (const region of regions) {
      await this.prisma.region.upsert({
        where: { code: region.code },
        update: { name: region.name },
        create: region,
      });
    }

    const allRegions = await this.prisma.region.findMany();

    const regionMap = new Map(allRegions.map((r) => [r.code, r.id]));

    const cities = [
      // Western
      { regionCode: 'WESTERN', name: 'Colombo' },
      { regionCode: 'WESTERN', name: 'Gampaha' },
      { regionCode: 'WESTERN', name: 'Kalutara' },
      { regionCode: 'WESTERN', name: 'Maharagama' },
      { regionCode: 'WESTERN', name: 'Kaduwela' },
      { regionCode: 'WESTERN', name: 'Moratuwa' },
      { regionCode: 'WESTERN', name: 'Negombo' },
      { regionCode: 'WESTERN', name: 'Panadura' },

      // Central
      { regionCode: 'CENTRAL', name: 'Kandy' },
      { regionCode: 'CENTRAL', name: 'Matale' },
      { regionCode: 'CENTRAL', name: 'Nuwara Eliya' },
      { regionCode: 'CENTRAL', name: 'Gampola' },
      { regionCode: 'CENTRAL', name: 'Katugastota' },

      // Southern
      { regionCode: 'SOUTHERN', name: 'Galle' },
      { regionCode: 'SOUTHERN', name: 'Matara' },
      { regionCode: 'SOUTHERN', name: 'Hambantota' },
      { regionCode: 'SOUTHERN', name: 'Ambalangoda' },

      // Northern
      { regionCode: 'NORTHERN', name: 'Jaffna' },
      { regionCode: 'NORTHERN', name: 'Kilinochchi' },
      { regionCode: 'NORTHERN', name: 'Mannar' },
      { regionCode: 'NORTHERN', name: 'Vavuniya' },

      // Eastern
      { regionCode: 'EASTERN', name: 'Trincomalee' },
      { regionCode: 'EASTERN', name: 'Batticaloa' },
      { regionCode: 'EASTERN', name: 'Ampara' },
      { regionCode: 'EASTERN', name: 'Kalmunai' },

      // North Western
      { regionCode: 'NORTH_WESTERN', name: 'Kurunegala' },
      { regionCode: 'NORTH_WESTERN', name: 'Puttalam' },
      { regionCode: 'NORTH_WESTERN', name: 'Kuliyapitiya' },

      // North Central
      { regionCode: 'NORTH_CENTRAL', name: 'Anuradhapura' },
      { regionCode: 'NORTH_CENTRAL', name: 'Polonnaruwa' },

      // Uva
      { regionCode: 'UVA', name: 'Badulla' },
      { regionCode: 'UVA', name: 'Monaragala' },
      { regionCode: 'UVA', name: 'Bandarawela' },

      // Sabaragamuwa
      { regionCode: 'SABARAGAMUWA', name: 'Ratnapura' },
      { regionCode: 'SABARAGAMUWA', name: 'Kegalle' },
      { regionCode: 'SABARAGAMUWA', name: 'Balangoda' },
    ];

    for (const city of cities) {
      const regionId = regionMap.get(city.regionCode);

      if (!regionId) {
        throw new BadRequestException(`Region not found for ${city.regionCode}`);
      }

      await this.prisma.city.upsert({
        where: {
          regionId_name: {
            regionId,
            name: city.name,
          },
        },
        update: {},
        create: {
          regionId,
          name: city.name,
        },
      });
    }

    return {
      message: 'Sri Lanka provinces and cities seeded successfully',
    };
  }
}