import {
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAgentDto {
  @IsOptional()
  @IsString()
  regionId?: string;

  @IsOptional()
  @IsNumberString()
  monthlyTarget?: string;

  @IsOptional()
  @IsBoolean()
  notificationSms?: boolean;

  @IsOptional()
  @IsBoolean()
  notificationEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

