import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateShopDto {
  @IsString()
  code: string;

  @IsString()
  shopName: string;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsString()
  regionId: string;

  @IsString()
  cityId: string;

  @IsOptional()
  @IsString()
  townId?: string;

  @IsOptional()
  @IsBoolean()
  notifySms?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyEmail?: boolean;

  @IsOptional()
  @IsString()
  legalBusinessName?: string;
  @IsOptional()
  @IsString()
  businessType?: string;
  @IsOptional()
  @IsString()
  registrationNo?: string;
  @IsOptional()
  @IsString()
  taxId?: string;
  @IsOptional()
  @IsString()
  certificateOfRegistrationUrl?: string;
  @IsOptional()
  @IsString()
  ownerIdFrontUrl?: string;
  @IsOptional()
  @IsString()
  ownerIdBackUrl?: string;
  @IsOptional()
  @IsString()
  shopFrontPhotoUrl?: string;
  @IsOptional()
  @IsString()
  addressLine1?: string;
  @IsOptional()
  @IsString()
  addressLine2?: string;
  @IsOptional()
  @IsString()
  whatsappNumber?: string;
  @IsOptional()
  @IsString()
  nationalId?: string;
  @IsOptional()
  @IsString()
  ownerPhone?: string;
  @IsOptional()
  @IsString()
  bankAccountName?: string;
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;
  @IsOptional()
  @IsString()
  bankName?: string;
  @IsOptional()
  @IsString()
  branch?: string;
}