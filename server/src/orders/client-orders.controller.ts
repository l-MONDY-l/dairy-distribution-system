import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

// Client orders API: separate route namespace that currently
// reuses the same underlying OrdersService / data model.
// This lets the admin app track client-originated orders
// independently from agent orders via /client-orders endpoints.

@Controller('client-orders')
export class ClientOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAllClient();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    const tagged: CreateOrderDto = {
      ...createOrderDto,
      notes: createOrderDto.notes
        ? `[CLIENT] ${createOrderDto.notes}`
        : '[CLIENT]',
    };
    return this.ordersService.create(tagged);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('orderStatus') orderStatus?: OrderStatus,
    @Body('notes') notes?: string,
    @Body('agentId') agentId?: string | null,
    @Body('driverId') driverId?: string | null,
    @Body('paymentType') paymentType?: any,
    @Body('performedByUserId') performedByUserId?: string,
  ) {
    return this.ordersService.update(id, {
      orderStatus,
      notes,
      agentId,
      driverId,
      paymentType,
      actionUserId: performedByUserId ?? null,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}

