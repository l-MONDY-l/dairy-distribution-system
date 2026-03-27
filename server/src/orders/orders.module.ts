import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ClientOrdersController } from './client-orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController, ClientOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

