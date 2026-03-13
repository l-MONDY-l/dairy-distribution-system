import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ReturnStatus } from '@prisma/client';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  create(@Body() dto: CreateReturnDto) {
    return this.returnsService.create(dto);
  }

  @Get()
  findAll(
    @Query('shopId') shopId?: string,
    @Query('agentId') agentId?: string,
    @Query('driverId') driverId?: string,
    @Query('status') status?: ReturnStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.returnsService.findAll({
      shopId,
      agentId,
      driverId,
      status,
      from,
      to,
    });
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReturnStatusDto,
  ) {
    return this.returnsService.updateStatus(id, dto);
  }
}

