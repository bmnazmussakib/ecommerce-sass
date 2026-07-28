import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FlashSaleProductDto {
  @ApiProperty({ example: 'variant-uuid' })
  @IsString()
  productVariantId!: string;

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  @Min(0)
  salePrice!: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(1)
  limitQuantity!: number;
}

export class CreateFlashSaleDto {
  @ApiProperty({ example: 'Friday Flash Sale' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Special weekend discounts', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-07-30T12:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-07-30T18:00:00Z' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ type: [FlashSaleProductDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlashSaleProductDto)
  products!: FlashSaleProductDto[];
}

export class UpdateFlashSaleDto {
  @ApiProperty({ example: 'Friday Flash Sale v2', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-07-30T12:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2026-07-30T18:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
