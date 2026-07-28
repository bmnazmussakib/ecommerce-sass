import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateShippingZoneDto {
  @ApiProperty({ example: 'Inside Dhaka' })
  @IsString()
  name!: string;

  @ApiProperty({ example: ['Bangladesh'] })
  @IsArray()
  @IsString({ each: true })
  countries!: string[];

  @ApiProperty({ example: ['Dhaka'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateShippingZoneDto extends PartialType(CreateShippingZoneDto) {}

export class CreateShippingRateDto {
  @ApiProperty({ example: 'zone-uuid' })
  @IsString()
  zoneId!: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxOrderValue?: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  rate!: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateShippingRateDto extends PartialType(CreateShippingRateDto) {}
