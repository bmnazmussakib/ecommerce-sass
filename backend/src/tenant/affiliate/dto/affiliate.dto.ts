import { IsString, IsOptional, IsEmail, IsNumber, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AffiliateStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class CreateAffiliatePartnerDto {
  @ApiProperty({ example: 'Rahim Digital' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'rahim@affiliate.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '01700000000', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'RAHIM10' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 5.0, required: false, default: 5.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionRate?: number;
}

export class UpdateAffiliatePartnerDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionRate?: number;

  @ApiProperty({ enum: AffiliateStatus, required: false })
  @IsEnum(AffiliateStatus)
  @IsOptional()
  status?: AffiliateStatus;
}

export class CreatePayoutDto {
  @ApiProperty({ example: 'affiliate-partner-uuid' })
  @IsString()
  affiliateId!: string;

  @ApiProperty({ example: 500.0 })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiProperty({ example: 'bKash' })
  @IsString()
  paymentMethod!: string;

  @ApiProperty({ example: 'TRX987654321', required: false })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ example: 'Monthly payout clear', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
