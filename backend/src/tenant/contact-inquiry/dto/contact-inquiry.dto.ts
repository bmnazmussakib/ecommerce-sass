import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum InquiryStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateContactInquiryDto {
  @ApiProperty({ example: 'Tanvir Hasan' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'tanvir@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '01700000000', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Order Tracking Inquiry', required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ example: 'Hello, I would like to know the status of my order.' })
  @IsString()
  message!: string;
}

export class UpdateContactInquiryDto {
  @ApiProperty({ enum: InquiryStatus, required: false })
  @IsEnum(InquiryStatus)
  @IsOptional()
  status?: InquiryStatus;

  @ApiProperty({ example: 'Replied via email on July 29.', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
