import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PaymentType } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Get()
  findAll(
    @Query('shopId') shopId?: string,
    @Query('paymentMethod') paymentMethod?: PaymentType,
  ) {
    return this.paymentsService.findAll({
      shopId,
      paymentMethod,
    });
  }
}

