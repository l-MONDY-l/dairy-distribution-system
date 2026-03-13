import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get('report')
  getOrderReport(
    @Query('shopId') shopId?: string,
    @Query('agentId') agentId?: string,
    @Query('driverId') driverId?: string,
    @Query('status') status?: OrderStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ordersService.getReport({
      shopId,
      agentId,
      driverId,
      status,
      from,
      to,
    });
  }

  @Get('report/export')
  async exportOrderReport(
    @Res() res,
    @Query('shopId') shopId?: string,
    @Query('agentId') agentId?: string,
    @Query('driverId') driverId?: string,
    @Query('status') status?: OrderStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.ordersService.getReport({
      shopId,
      agentId,
      driverId,
      status,
      from,
      to,
    });

    const header = [
      'OrderNo',
      'Date',
      'Shop',
      'Region',
      'City',
      'Agent',
      'Driver',
      'Status',
      'Total',
    ];

    const rows = data.map((o) => [
      o.orderNo,
      o.orderedAt.toISOString(),
      o.shop.shopName,
      o.region.name,
      o.city.name,
      o.agent?.user.fullName || '',
      o.driver?.user.fullName || '',
      o.orderStatus,
      o.grandTotal.toString(),
    ]);

    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="order-report.csv"',
    );
    res.send(csv);
  }
}

