import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '@prisma/master-client';

export class UpdateSubscriptionDto {
  @ApiProperty({ description: 'The Plan ID', required: false })
  @IsString()
  @IsOptional()
  planId?: string;

  @ApiProperty({ enum: SubscriptionStatus, required: false })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @ApiProperty({ description: 'The custom expiry date', required: false })
  @IsDateString()
  @IsOptional()
  currentPeriodEnd?: string;
}
