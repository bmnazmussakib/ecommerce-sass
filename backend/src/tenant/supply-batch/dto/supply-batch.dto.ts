import { IsString, IsNotEmpty, IsInt, IsPositive, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplyBatchDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supplierId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  quantity!: number;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  costPrice!: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  date?: string;
}

export class UpdateSupplyBatchDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  variantId?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsPositive()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  costPrice?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  date?: string;
}
