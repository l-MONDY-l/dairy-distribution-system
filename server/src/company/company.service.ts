import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompany() {
    const existing = await this.prisma.companySetting.findFirst();
    if (!existing) {
      throw new NotFoundException('Company settings not found');
    }
    return existing;
  }

  async updateCompany(id: string, dto: UpdateCompanyDto) {
    return this.prisma.companySetting.update({
      where: { id },
      data: dto,
    });
  }
}

