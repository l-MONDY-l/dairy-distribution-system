import { IsInt, IsString, Min } from 'class-validator';

export class CreateReturnItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(0)
  goodQty: number;

  @IsInt()
  @Min(0)
  brokenQty: number;

  @IsInt()
  @Min(0)
  missingQty: number;
}

