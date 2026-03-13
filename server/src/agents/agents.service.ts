import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.agentProfile.findMany({
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
        role: { code: 'AGENT' },
        agentProfile: null,
      },
      include: { role: true },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string) {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { id },
      include: {
        user: { include: { role: true } },
        region: true,
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent profile not found');
    }

    return agent;
  }

  async create(createAgentDto: CreateAgentDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: createAgentDto.userId },
      include: { role: true, agentProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role.code !== 'AGENT') {
      throw new BadRequestException('Selected user is not an agent role');
    }

    if (user.agentProfile) {
      throw new BadRequestException('Agent profile already exists for this user');
    }

    const region = await this.prisma.region.findUnique({
      where: { id: createAgentDto.regionId },
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    return this.prisma.agentProfile.create({
      data: {
        userId: createAgentDto.userId,
        regionId: createAgentDto.regionId,
        monthlyTarget: new Prisma.Decimal(createAgentDto.monthlyTarget ?? '0'),
        notificationSms: createAgentDto.notificationSms ?? true,
        notificationEmail: createAgentDto.notificationEmail ?? true,
        status: createAgentDto.status ?? true,
      },
      include: {
        user: { include: { role: true } },
        region: true,
      },
    });
  }

  async update(id: string, updateAgentDto: UpdateAgentDto) {
    const existing = await this.prisma.agentProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Agent profile not found');
    }

    if (updateAgentDto.regionId) {
      const region = await this.prisma.region.findUnique({
        where: { id: updateAgentDto.regionId },
      });

      if (!region) {
        throw new NotFoundException('Region not found');
      }
    }

    return this.prisma.agentProfile.update({
      where: { id },
      data: {
        regionId: updateAgentDto.regionId,
        monthlyTarget: updateAgentDto.monthlyTarget
          ? new Prisma.Decimal(updateAgentDto.monthlyTarget)
          : undefined,
        notificationSms: updateAgentDto.notificationSms,
        notificationEmail: updateAgentDto.notificationEmail,
        status: updateAgentDto.status,
      },
      include: {
        user: { include: { role: true } },
        region: true,
      },
    });
  }

  async updateStatus(id: string, status: boolean) {
    const existing = await this.prisma.agentProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Agent profile not found');
    }

    return this.prisma.agentProfile.update({
      where: { id },
      data: { status },
      include: {
        user: { include: { role: true } },
        region: true,
      },
    });
  }
}

