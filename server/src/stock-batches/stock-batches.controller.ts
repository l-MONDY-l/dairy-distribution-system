import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateStockBatchDto } from './dto/create-stock-batch.dto';
import { UpdateStockBatchDto } from './dto/update-stock-batch.dto';
import { StockBatchesService } from './stock-batches.service';

@Controller('stock-batches')
export class StockBatchesController {
  constructor(private readonly stockBatchesService: StockBatchesService) {}

  @Post()
  create(@Body() dto: CreateStockBatchDto) {
    return this.stockBatchesService.create(dto);
  }

  @Get()
  findAll() {
    return this.stockBatchesService.findAll();
  }

  @Get('count')
  count() {
    return this.stockBatchesService.count();
  }

  @Post('backfill-from-products')
  backfillFromProducts() {
    return this.stockBatchesService.backfillFromProducts();
  }

  @Get('count-by-product/:productId')
  countByProduct(@Param('productId') productId: string) {
    return this.stockBatchesService.countByProduct(productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockBatchesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStockBatchDto) {
    return this.stockBatchesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockBatchesService.remove(id);
  }
}
