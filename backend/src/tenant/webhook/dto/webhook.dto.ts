import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateWebhookDto {
  @ApiProperty({ example: 'https://myshop.com/hooks/orders' })
  @IsString()
  @IsUrl({ require_tld: false })
  url!: string;

  @ApiProperty({ example: ['order.placed', 'payment.confirmed'] })
  @IsArray()
  @IsString({ each: true })
  events!: string[];

  @ApiProperty({ example: 'my-signing-secret', required: false })
  @IsOptional()
  @IsString()
  secret?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateWebhookDto extends PartialType(CreateWebhookDto) {}
