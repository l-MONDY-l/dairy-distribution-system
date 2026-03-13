import {
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAgentDto {
  @IsString()
  userId: string;

  @IsString()
  regionId: string;

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

