import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsBoolean, IsDateString, IsOptional, Min } from 'class-validator';
import { CouponType } from '@prisma/tenant-client';

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER20' })
  @IsString()
  code!: string;

  @ApiProperty({ enum: CouponType })
  @IsEnum(CouponType)
  type!: CouponType;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @ApiProperty({ example: '2026-06-01T00:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-06-30T23:59:59Z' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}
