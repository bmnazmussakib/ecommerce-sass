import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreatePlanDto {
  @ApiProperty({ description: 'Name of the plan (e.g. Basic, Pro)' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Max number of products allowed' })
  @IsNumber()
  @Min(0)
  productLimit!: number;

  @ApiProperty({ description: 'Max traffic/bandwidth limit' })
  @IsNumber()
  @Min(0)
  trafficLimit!: number;

  @ApiProperty({ description: 'Max storage limit in MB' })
  @IsNumber()
  @Min(0)
  storageLimit!: number;

  @ApiProperty({ description: 'Price of the plan' })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ enum: BillingCycle, default: BillingCycle.MONTHLY })
  @IsEnum(BillingCycle)
  @IsOptional()
  interval?: BillingCycle;
}

export class UpdatePlanDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  productLimit?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  trafficLimit?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  storageLimit?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ enum: BillingCycle, required: false })
  @IsEnum(BillingCycle)
  @IsOptional()
  interval?: BillingCycle;
}
