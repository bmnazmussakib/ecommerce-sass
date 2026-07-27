import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReviewStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export class InitiateGatewayPaymentDto {
  @ApiProperty({ description: 'The Plan ID to subscribe to' })
  @IsString()
  @IsNotEmpty()
  planId!: string;
}

export class SubmitManualPaymentDto {
  @ApiProperty({ description: 'The Plan ID to subscribe to' })
  @IsString()
  @IsNotEmpty()
  planId!: string;

  @ApiProperty({ description: 'Manual Payment Transaction ID (TxID)' })
  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  @ApiProperty({ description: 'Sender MFS Number' })
  @IsString()
  @IsNotEmpty()
  senderNumber!: string;
}

export class ReviewPaymentDto {
  @ApiProperty({ enum: ReviewStatus })
  @IsEnum(ReviewStatus)
  status!: ReviewStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
