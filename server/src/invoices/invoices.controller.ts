import { Controller, Get, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoiceFiltersDto } from './dto/invoice-filters.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@Query() filters: InvoiceFiltersDto) {
    return this.invoicesService.findAll(filters);
  }

  @Get('outstanding')
  getOutstanding(@Query('shopId') shopId: string) {
    return this.invoicesService.getOutstandingByShop(shopId);
  }
}

