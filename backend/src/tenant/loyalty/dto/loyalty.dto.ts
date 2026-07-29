import { IsString, IsOptional, IsNumber, Min, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LoyaltyTransactionType {
  EARNED = 'EARNED',
  REDEEMED = 'REDEEMED',
  ADJUSTMENT = 'ADJUSTMENT',
}

export class UpdateLoyaltySettingDto {
  @ApiProperty({ example: 0.1, required: false, description: 'Points earned per currency unit (e.g. 0.1 = 10 pts per 100 BDT)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pointsPerCurrency?: number;

  @ApiProperty({ example: 0.1, required: false, description: 'Discount currency per point redeemed (e.g. 0.1 = 100 pts = 10 BDT discount)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  redemptionRate?: number;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  minPointsToRedeem?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}

export class AdjustPointsDto {
  @ApiProperty({ example: 'customer-uuid' })
  @IsString()
  customerId!: string;

  @ApiProperty({ example: 50, description: 'Points to add (positive) or subtract (negative)' })
  @IsNumber()
  points!: number;

  @ApiProperty({ example: 'Bonus points for campaign', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CalculateRedemptionDto {
  @ApiProperty({ example: 'customer-uuid' })
  @IsString()
  customerId!: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  pointsToRedeem!: number;
}
