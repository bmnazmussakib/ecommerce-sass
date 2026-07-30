import { IsString, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested, IsDateString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  SCHEDULED = 'SCHEDULED',
}

export class ProductOptionDto {
  @ApiProperty({ example: 'Storage' })
  @IsString()
  name!: string;

  @ApiProperty({ example: ['128GB', '256GB'] })
  @IsArray()
  @IsString({ each: true })
  values!: string[];

  @ApiProperty({ required: false, example: 1 })
  @IsNumber()
  @IsOptional()
  position?: number;
}

export class ProductVariantDto {
  @ApiProperty()
  @IsString()
  sku!: string;

  @ApiProperty()
  @IsNumber()
  price!: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({ required: false, example: { Storage: '128GB', Color: 'Black' } })
  @IsObject()
  @IsOptional()
  options?: Record<string, string>;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  color?: string;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsNumber()
  basePrice!: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  comparePrice?: number;

  @ApiProperty({ enum: ProductStatus, required: false })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({ required: false, example: '2026-08-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ type: [ProductOptionDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionDto)
  @IsOptional()
  options?: ProductOptionDto[];

  @ApiProperty({ type: [ProductVariantDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  variants?: ProductVariantDto[];
}

export class UpdateProductDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  basePrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  comparePrice?: number;

  @ApiProperty({ enum: ProductStatus, required: false })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({ required: false, example: '2026-08-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ type: [ProductOptionDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionDto)
  @IsOptional()
  options?: ProductOptionDto[];
}
