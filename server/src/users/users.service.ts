import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const role = await this.prisma.role.findUnique({
      where: { code: createUserDto.roleCode },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          ...(createUserDto.username ? [{ username: createUserDto.username }] : []),
          ...(createUserDto.phone ? [{ phone: createUserDto.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        fullName: createUserDto.fullName,
        username: createUserDto.username,
        email: createUserDto.email,
        phone: createUserDto.phone,
        passwordHash,
        roleId: role.id,
      },
      include: {
        role: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findByIdentifier(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      include: { role: true },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    let roleId = existingUser.roleId;

    if (updateUserDto.roleCode) {
      const role = await this.prisma.role.findUnique({
        where: { code: updateUserDto.roleCode },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      roleId = role.id;
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (
      updateUserDto.phone &&
      updateUserDto.phone !== existingUser.phone
    ) {
      const phoneExists = await this.prisma.user.findFirst({
        where: { phone: updateUserDto.phone },
      });

      if (phoneExists) {
        throw new BadRequestException('Phone already in use');
      }
    }

    if (
      updateUserDto.username &&
      updateUserDto.username !== existingUser.username
    ) {
      const usernameExists = await this.prisma.user.findFirst({
        where: { username: updateUserDto.username },
      });

      if (usernameExists) {
        throw new BadRequestException('Username already in use');
      }
    }

    const data: Parameters<typeof this.prisma.user.update>[0]['data'] = {
      fullName: updateUserDto.fullName,
      username: updateUserDto.username,
      email: updateUserDto.email,
      phone: updateUserDto.phone,
      roleId,
      status: updateUserDto.status,
    };

    if (updateUserDto.password && updateUserDto.password.trim()) {
      data.passwordHash = await bcrypt.hash(updateUserDto.password.trim(), 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateUserStatusDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
      },
      include: { role: true },
    });
  }

  async remove(id: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { success: true };
  }
}