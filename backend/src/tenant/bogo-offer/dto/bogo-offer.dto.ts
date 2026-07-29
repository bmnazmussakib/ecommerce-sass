import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBogoOfferDto {
  @ApiProperty({ example: 'Buy 1 T-Shirt Get 1 Free' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'ProductVariant ID required to buy' })
  @IsString()
  buyVariantId!: string;

  @ApiProperty({ example: 1, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  buyQuantity?: number;

  @ApiProperty({ description: 'ProductVariant ID received for promotion' })
  @IsString()
  getVariantId!: string;

  @ApiProperty({ example: 1, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  getQuantity?: number;

  @ApiProperty({ example: 100.0, description: 'Discount percentage on offer item (100% = Free)', default: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercent?: number;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ default: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBogoOfferDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  buyVariantId?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  buyQuantity?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  getVariantId?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  getQuantity?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercent?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
