import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Dhaka Central Hub' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'WH-DHK-01' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Plot 12, Sector 3, Uttara', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Dhaka', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: '+8801700000000', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: true, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateWarehouseDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SetWarehouseStockDto {
  @ApiProperty({ example: 'warehouse-uuid' })
  @IsString()
  warehouseId!: string;

  @ApiProperty({ example: 'variant-uuid' })
  @IsString()
  variantId!: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  stock!: number;
}

export class TransferStockDto {
  @ApiProperty({ example: 'source-warehouse-uuid' })
  @IsString()
  fromWarehouseId!: string;

  @ApiProperty({ example: 'destination-warehouse-uuid' })
  @IsString()
  toWarehouseId!: string;

  @ApiProperty({ example: 'variant-uuid' })
  @IsString()
  variantId!: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}
