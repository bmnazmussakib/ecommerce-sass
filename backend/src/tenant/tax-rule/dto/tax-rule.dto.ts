import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaxRuleDto {
  @ApiProperty({ example: 'Dhaka VAT 5%' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Bangladesh', required: false, default: '*' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: 'Dhaka', required: false, default: '*' })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({ example: 5.0, description: 'Tax rate percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  rate!: number;

  @ApiProperty({ example: 0, required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateTaxRuleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  rate?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
