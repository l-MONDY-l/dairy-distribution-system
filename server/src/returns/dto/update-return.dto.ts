import { IsOptional, IsString } from 'class-validator';

export class UpdateReturnDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
