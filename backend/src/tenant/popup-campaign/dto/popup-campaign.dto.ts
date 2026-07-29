import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PopupTriggerType {
  EXIT_INTENT = 'EXIT_INTENT',
  TIMED_DELAY = 'TIMED_DELAY',
  PAGE_SCROLL = 'PAGE_SCROLL',
}

export class CreatePopupCampaignDto {
  @ApiProperty({ example: 'Summer Exit Sale' })
  @IsString()
  title!: string;

  @ApiProperty({ example: "Wait! Don't Leave Yet!" })
  @IsString()
  headline!: string;

  @ApiProperty({ example: 'Get 10% off your first order before you go.', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ example: 'https://example.com/popup-banner.jpg', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 'Claim 10% Discount', required: false })
  @IsString()
  @IsOptional()
  ctaText?: string;

  @ApiProperty({ example: '/products', required: false })
  @IsString()
  @IsOptional()
  ctaLink?: string;

  @ApiProperty({ enum: PopupTriggerType, default: PopupTriggerType.EXIT_INTENT })
  @IsEnum(PopupTriggerType)
  @IsOptional()
  triggerType?: PopupTriggerType;

  @ApiProperty({ example: 5, required: false, default: 5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  delaySeconds?: number;

  @ApiProperty({ example: 50, required: false, default: 50 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  scrollPercent?: number;

  @ApiProperty({ example: 'SAVE10', required: false })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePopupCampaignDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  headline?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ctaText?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ctaLink?: string;

  @ApiProperty({ enum: PopupTriggerType, required: false })
  @IsEnum(PopupTriggerType)
  @IsOptional()
  triggerType?: PopupTriggerType;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  delaySeconds?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  scrollPercent?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
