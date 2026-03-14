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

  async getDistricts() {
    return this.prisma.district.findMany({
      include: { region: true },
      orderBy: [{ region: { name: 'asc' } }, { name: 'asc' }],
    });
  }

  async createDistrict(name: string, regionId: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new BadRequestException('District name is required');
    }
    if (!regionId) {
      throw new BadRequestException('Province (region) is required for district');
    }
    const code = trimmed.toUpperCase().replace(/\s+/g, '_');
    try {
      return await this.prisma.district.create({
        data: { name: trimmed, code, regionId, status: true },
      });
    } catch (err: unknown) {
      const codeErr = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
      if (codeErr === 'P2002') {
        throw new BadRequestException('A district with this name already exists in this province.');
      }
      throw err;
    }
  }

  async updateDistrict(
    id: string,
    payload: { name?: string; status?: boolean; regionId?: string },
  ) {
    const data: { name?: string; status?: boolean; regionId?: string } = {};
    if (typeof payload.name === 'string') {
      const trimmed = payload.name.trim();
      if (!trimmed) throw new BadRequestException('District name cannot be empty');
      data.name = trimmed;
    }
    if (typeof payload.status === 'boolean') data.status = payload.status;
    if (typeof payload.regionId === 'string' && payload.regionId) data.regionId = payload.regionId;
    return this.prisma.district.update({ where: { id }, data });
  }

  async deleteDistrict(id: string) {
    await this.prisma.district.delete({ where: { id } });
    return { deleted: true };
  }

  async getCities() {
    return this.prisma.city.findMany({
      include: { region: true, district: true },
      orderBy: [{ region: { name: 'asc' } }, { name: 'asc' }],
    });
  }

  async createCity(name: string, districtId: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new BadRequestException('City name is required');
    }
    if (!districtId) {
      throw new BadRequestException('District is required for city');
    }
    const district = await this.prisma.district.findUnique({
      where: { id: districtId },
      select: { regionId: true },
    });
    if (!district) {
      throw new NotFoundException('District not found');
    }

    const existing = await this.prisma.city.findUnique({
      where: {
        regionId_name: { regionId: district.regionId, name: trimmed },
      },
    });
    if (existing) {
      throw new BadRequestException(
        'A city with this name already exists in this province.',
      );
    }

    try {
      return await this.prisma.city.create({
        data: {
          name: trimmed,
          districtId,
          regionId: district.regionId,
          status: true,
        },
        include: { region: true, district: true },
      });
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
      if (code === 'P2002') {
        throw new BadRequestException(
          'A city with this name already exists in this province.',
        );
      }
      throw err;
    }
  }

  async updateCity(
    id: string,
    payload: { name?: string; status?: boolean; districtId?: string },
  ) {
    const data: {
      name?: string;
      status?: boolean;
      districtId?: string;
      regionId?: string;
    } = {};

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

    if (typeof payload.districtId === 'string' && payload.districtId) {
      const district = await this.prisma.district.findUnique({
        where: { id: payload.districtId },
        select: { regionId: true },
      });
      if (!district) {
        throw new NotFoundException('District not found');
      }
      data.districtId = payload.districtId;
      data.regionId = district.regionId;
    }

    return this.prisma.city.update({
      where: { id },
      data,
      include: { region: true, district: true },
    });
  }

  async deleteCity(id: string) {
    await this.prisma.city.delete({ where: { id } });
    return { deleted: true };
  }

  // ----- Towns -----

  async getTowns() {
    return this.prisma.town.findMany({
      include: { city: { include: { district: true, region: true } } },
      orderBy: [{ city: { name: 'asc' } }, { name: 'asc' }],
    });
  }

  async createTown(name: string, cityId: string) {
    const trimmed = typeof name === 'string' ? name.trim() : '';
    if (!trimmed) {
      throw new BadRequestException('Town name is required');
    }
    if (!cityId || typeof cityId !== 'string' || !cityId.trim()) {
      throw new BadRequestException('City is required');
    }
    const city = await this.prisma.city.findUnique({
      where: { id: cityId.trim() },
      include: { district: true, region: true },
    });
    if (!city) {
      throw new NotFoundException('City not found');
    }
    const uniqueCode = `TWN_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    try {
      return await this.prisma.town.create({
        data: {
          name: trimmed,
          code: uniqueCode,
          cityId: cityId.trim(),
          status: true,
        },
        include: { city: { include: { district: true, region: true } } },
      });
    } catch (err: unknown) {
      const codeErr = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
      if (codeErr === 'P2002') {
        const province = city.region?.name ?? '—';
        const district = city.district?.name ?? '—';
        const cityName = city.name;
        const message =
          `A town with this name already exists in this city.\n\nRegistered under:\n• Province: ${province}\n• District: ${district}\n• City: ${cityName}`;
        throw new BadRequestException(message);
      }
      throw err;
    }
  }

  async updateTown(
    id: string,
    payload: { name?: string; status?: boolean },
  ) {
    const data: { name?: string; status?: boolean } = {};
    if (typeof payload.name === 'string') {
      const trimmed = payload.name.trim();
      if (!trimmed) throw new BadRequestException('Town name cannot be empty');
      data.name = trimmed;
    }
    if (typeof payload.status === 'boolean') data.status = payload.status;
    return this.prisma.town.update({
      where: { id },
      data,
      include: { city: { include: { district: true, region: true } } },
    });
  }

  async deleteTown(id: string) {
    await this.prisma.town.delete({ where: { id } });
    return { deleted: true };
  }

  // ----- Assignment options: from User Management (Users with role AGENT / DRIVER) -----
  // id = profile.id if user has profile, else user.id (so save and load both work)

  async getAssignmentOptions(): Promise<{
    agents: { id: string; _id?: string; displayName: string }[];
    drivers: { id: string; _id?: string; displayName: string }[];
  }> {
    const [agentUsers, driverUsers] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: { code: 'AGENT' } },
        select: { id: true, fullName: true, agentProfile: { select: { id: true } } },
        orderBy: { fullName: 'asc' },
      }),
      this.prisma.user.findMany({
        where: { role: { code: 'DRIVER' } },
        select: { id: true, fullName: true, driverProfile: { select: { id: true } } },
        orderBy: { fullName: 'asc' },
      }),
    ]);
    return {
      agents: agentUsers.map((u) => {
        const id = u.agentProfile?.id ?? u.id;
        return {
          id,
          _id: id,
          displayName: u.fullName?.trim() || `Agent ${u.id.slice(0, 8)}`,
        };
      }),
      drivers: driverUsers.map((u) => {
        const id = u.driverProfile?.id ?? u.id;
        return {
          id,
          _id: id,
          displayName: u.fullName?.trim() || `Driver ${u.id.slice(0, 8)}`,
        };
      }),
    };
  }

  // ----- City assignments -----

  async getCityAssignments() {
    return (this.prisma as any).cityAssignment.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Resolve agentId (may be AgentProfile.id or User.id) to AgentProfile.id; create profile for user if needed. */
  private async resolveAgentId(agentId: string, regionId: string): Promise<string> {
    const byProfile = await this.prisma.agentProfile.findUnique({
      where: { id: agentId },
    });
    if (byProfile) return byProfile.id;
    const user = await this.prisma.user.findUnique({
      where: { id: agentId },
      include: { role: true, agentProfile: true },
    });
    if (!user) throw new NotFoundException('Agent user not found');
    if (user.role?.code !== 'AGENT') throw new BadRequestException('User is not an agent');
    if (user.agentProfile) return user.agentProfile.id;
    const created = await this.prisma.agentProfile.create({
      data: {
        userId: user.id,
        regionId,
        monthlyTarget: 0,
        notificationSms: true,
        notificationEmail: true,
        status: true,
      },
    });
    return created.id;
  }

  /** Resolve driverId (may be DriverProfile.id or User.id) to DriverProfile.id; create profile for user if needed. */
  private async resolveDriverId(driverId: string, regionId: string): Promise<string> {
    const byProfile = await this.prisma.driverProfile.findUnique({
      where: { id: driverId },
    });
    if (byProfile) return byProfile.id;
    const user = await this.prisma.user.findUnique({
      where: { id: driverId },
      include: { role: true, driverProfile: true },
    });
    if (!user) throw new NotFoundException('Driver user not found');
    if (user.role?.code !== 'DRIVER') throw new BadRequestException('User is not a driver');
    if (user.driverProfile) return user.driverProfile.id;
    const created = await this.prisma.driverProfile.create({
      data: {
        userId: user.id,
        regionId,
        fuelQuotaDaily: 0,
        notificationSms: true,
        notificationEmail: true,
        status: true,
      },
    });
    return created.id;
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

    const resolvedAgentId = await this.resolveAgentId(agentId, city.regionId);
    const resolvedDriverId = await this.resolveDriverId(driverId, city.regionId);

    return this.prisma.cityAssignment.upsert({
      where: { cityId },
      update: { agentId: resolvedAgentId, driverId: resolvedDriverId },
      create: {
        cityId,
        agentId: resolvedAgentId,
        driverId: resolvedDriverId,
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

  // ----- Town assignments (one town = one agent + one driver; no duplicates) -----

  async getTownAssignments() {
    return this.prisma.townAssignment.findMany({
      include: { town: { include: { city: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async upsertTownAssignment(params: {
    townId: string;
    agentId: string;
    driverId: string;
  }) {
    const { townId, agentId, driverId } = params;

    const town = await this.prisma.town.findUnique({
      where: { id: townId },
      include: { city: true },
    });
    if (!town) {
      throw new NotFoundException('Town not found');
    }
    const regionId = town.city.regionId;

    const resolvedAgentId = await this.resolveAgentId(agentId, regionId);
    const resolvedDriverId = await this.resolveDriverId(driverId, regionId);

    return this.prisma.townAssignment.upsert({
      where: { townId },
      update: { agentId: resolvedAgentId, driverId: resolvedDriverId },
      create: {
        townId,
        agentId: resolvedAgentId,
        driverId: resolvedDriverId,
      },
    });
  }

  async deleteTownAssignment(townId: string) {
    const existing = await this.prisma.townAssignment.findUnique({
      where: { townId },
    });
    if (!existing) {
      return { deleted: false };
    }
    await this.prisma.townAssignment.delete({ where: { townId } });
    return { deleted: true };
  }

  // ----- Simple region management -----

  async createRegion(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new BadRequestException('Region name is required');
    }

    const code = trimmed.toUpperCase().replace(/\s+/g, '_');

    try {
      return await this.prisma.region.create({
        data: {
          name: trimmed,
          code,
          status: true,
        },
      });
    } catch (err: unknown) {
      const codeErr = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';
      if (codeErr === 'P2002') {
        throw new BadRequestException('A province with this name already exists.');
      }
      throw err;
    }
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
    const region = await this.prisma.region.findUnique({ where: { id } });
    if (!region) {
      throw new NotFoundException('Region not found');
    }

    // Find another region to reassign dependents (shops, orders, agents, drivers)
    const fallback = await this.prisma.region.findFirst({
      where: { id: { not: id } },
      include: { cities: { take: 1 } },
    });
    if (!fallback) {
      throw new BadRequestException(
        'Cannot delete the only region. Add another province first.',
      );
    }
    await this.prisma.$transaction(async (tx) => {
      let fallbackCityId = fallback.cities[0]?.id ?? null;
      if (!fallbackCityId) {
        const fallbackCity = await tx.city.create({
          data: { regionId: fallback.id, name: fallback.name, status: true },
        });
        fallbackCityId = fallbackCity.id;
      }
      await tx.agentProfile.updateMany({
        where: { regionId: id },
        data: { regionId: fallback.id },
      });
      await tx.driverProfile.updateMany({
        where: { regionId: id },
        data: { regionId: fallback.id },
      });
      await tx.order.updateMany({
        where: { regionId: id },
        data: { regionId: fallback.id, cityId: fallbackCityId },
      });
      await tx.shop.updateMany({
        where: { regionId: id },
        data: { regionId: fallback.id, cityId: fallbackCityId },
      });
      await tx.region.delete({ where: { id } });
    });

    return { deleted: true };
  }

  async seedDefaults() {
    // 1. Sri Lanka provinces (regions table)
    const provinces = [
      { name: 'Western', code: 'WESTERN' },
      { name: 'Central', code: 'CENTRAL' },
      { name: 'Southern', code: 'SOUTHERN' },
      { name: 'Northern', code: 'NORTHERN' },
      { name: 'Eastern', code: 'EASTERN' },
      { name: 'North Western', code: 'NORTH_WESTERN' },
      { name: 'North Central', code: 'NORTH_CENTRAL' },
      { name: 'Uva', code: 'UVA' },
      { name: 'Sabaragamuwa', code: 'SABARAGAMUWA' },
    ];
    for (const p of provinces) {
      await this.prisma.region.upsert({
        where: { code: p.code },
        update: { name: p.name },
        create: p,
      });
    }

    const allRegions = await this.prisma.region.findMany();
    const regionMap = new Map(allRegions.map((r) => [r.code, r.id]));

    // 2. Sri Lanka districts (districts table) with province (regionId)
    const districts: { name: string; code: string; regionCode: string }[] = [
      { name: 'Colombo', code: 'COLOMBO', regionCode: 'WESTERN' },
      { name: 'Gampaha', code: 'GAMPAHA', regionCode: 'WESTERN' },
      { name: 'Kalutara', code: 'KALUTARA', regionCode: 'WESTERN' },
      { name: 'Kandy', code: 'KANDY', regionCode: 'CENTRAL' },
      { name: 'Matale', code: 'MATALE', regionCode: 'CENTRAL' },
      { name: 'Nuwara Eliya', code: 'NUWARA_ELIYA', regionCode: 'CENTRAL' },
      { name: 'Galle', code: 'GALLE', regionCode: 'SOUTHERN' },
      { name: 'Hambantota', code: 'HAMBANTOTA', regionCode: 'SOUTHERN' },
      { name: 'Matara', code: 'MATARA', regionCode: 'SOUTHERN' },
      { name: 'Jaffna', code: 'JAFFNA', regionCode: 'NORTHERN' },
      { name: 'Kilinochchi', code: 'KILINOCHCHI', regionCode: 'NORTHERN' },
      { name: 'Mannar', code: 'MANNAR', regionCode: 'NORTHERN' },
      { name: 'Mullaitivu', code: 'MULLAITIVU', regionCode: 'NORTHERN' },
      { name: 'Vavuniya', code: 'VAVUNIYA', regionCode: 'NORTHERN' },
      { name: 'Ampara', code: 'AMPARA', regionCode: 'EASTERN' },
      { name: 'Batticaloa', code: 'BATTICALOA', regionCode: 'EASTERN' },
      { name: 'Trincomalee', code: 'TRINCOMALEE', regionCode: 'EASTERN' },
      { name: 'Kurunegala', code: 'KURUNEGALA', regionCode: 'NORTH_WESTERN' },
      { name: 'Puttalam', code: 'PUTTALAM', regionCode: 'NORTH_WESTERN' },
      { name: 'Anuradhapura', code: 'ANURADHAPURA', regionCode: 'NORTH_CENTRAL' },
      { name: 'Polonnaruwa', code: 'POLONNARUWA', regionCode: 'NORTH_CENTRAL' },
      { name: 'Badulla', code: 'BADULLA', regionCode: 'UVA' },
      { name: 'Monaragala', code: 'MONARAGALA', regionCode: 'UVA' },
      { name: 'Kegalle', code: 'KEGALLE', regionCode: 'SABARAGAMUWA' },
      { name: 'Ratnapura', code: 'RATNAPURA', regionCode: 'SABARAGAMUWA' },
    ];
    for (const d of districts) {
      const regionId = regionMap.get(d.regionCode);
      if (!regionId) throw new BadRequestException(`Region not found: ${d.regionCode}`);
      await this.prisma.district.upsert({
        where: { code: d.code },
        update: { name: d.name, regionId },
        create: { name: d.name, code: d.code, regionId, status: true },
      });
    }

    // 3. Cities by province (region)
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

    const allDistricts = await this.prisma.district.findMany({
      include: { region: true },
    });

    for (const city of cities) {
      const regionId = regionMap.get(city.regionCode);
      if (!regionId) {
        throw new BadRequestException(`Region not found for ${city.regionCode}`);
      }
      const districtInRegion = allDistricts.find(
        (d) => d.regionId === regionId && d.name === city.name,
      ) || allDistricts.find((d) => d.regionId === regionId);

      await this.prisma.city.upsert({
        where: {
          regionId_name: {
            regionId,
            name: city.name,
          },
        },
        update: districtInRegion ? { districtId: districtInRegion.id } : {},
        create: {
          regionId,
          name: city.name,
          districtId: districtInRegion?.id,
        },
      });
    }

    return {
      message: 'Sri Lanka provinces, districts and cities seeded successfully',
    };
  }
}