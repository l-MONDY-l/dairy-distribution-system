import {
  IsBoolean,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  unitType?: string;

  @IsOptional()
  @IsString()
  unitVolume?: string;

  @IsOptional()
  @IsNumberString()
  price?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumberString()
  agentPrice?: string;

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
  expiryDate?: string; // ISO date string

  @IsOptional()
  @IsString()
  stockCreateDate?: string; // ISO date string; defaults to now if not set
}