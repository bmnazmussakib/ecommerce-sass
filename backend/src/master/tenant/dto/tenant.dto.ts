import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TenantStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class CreateTenantDto {
  @ApiProperty({ description: 'The subdomain of the tenant (e.g. mystore)' })
  @IsString()
  subdomain!: string;

  @ApiProperty({ description: 'Optional custom domain (e.g. www.mystore.com)', required: false })
  @IsString()
  @IsOptional()
  customDomain?: string;

  @ApiProperty({ description: 'Supabase DB Connection String for this tenant' })
  @IsString()
  dbConnectionString!: string;
}

export class UpdateTenantDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  subdomain?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  customDomain?: string;

  @ApiProperty({ required: false, enum: TenantStatus })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  dbConnectionString?: string;
}
