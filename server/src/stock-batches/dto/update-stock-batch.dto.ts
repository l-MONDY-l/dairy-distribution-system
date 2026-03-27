import {
  IsBoolean,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStockBatchDto {
  @IsOptional()
  @IsString()
  unitType?: string;

  @IsOptional()
  @IsNumberString()
  price?: string;

  @IsOptional()
  @IsNumberString()
  agentPrice?: string;

  @IsOptional()
  @IsNumberString()
  retailPrice?: string;

  @IsOptional()
  @IsBoolean()
  specialDiscount?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  soldQty?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  remainingQty?: number;

  @IsOptional()
  @IsString()
  stockCreateDate?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;
}
