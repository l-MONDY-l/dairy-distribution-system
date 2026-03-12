import { IsBoolean, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsString()
  unitType: string;

  @IsOptional()
  @IsString()
  unitVolume?: string;

  @IsNumberString()
  price: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}