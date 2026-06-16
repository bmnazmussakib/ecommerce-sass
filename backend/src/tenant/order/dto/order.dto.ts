import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus, ShippingStatus } from '@prisma/tenant-client';

export class OrderItemDto {
  @ApiProperty({ example: 'variant-uuid' })
  @IsString()
  variantId!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  customerName!: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ example: '+8801700000000' })
  @IsString()
  customerPhone!: string;

  @ApiProperty({ example: 'Dhaka, Bangladesh' })
  @IsString()
  shippingAddress!: string;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.COD })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({ example: 'SUMMER20', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: PaymentStatus, required: false })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({ enum: ShippingStatus, required: false })
  @IsOptional()
  @IsEnum(ShippingStatus)
  shippingStatus?: ShippingStatus;

  @ApiProperty({ example: 'AWB123456', required: false })
  @IsOptional()
  @IsString()
  awbCode?: string;

  @ApiProperty({ example: 'https://track.com/AWB123456', required: false })
  @IsOptional()
  @IsString()
  trackingUrl?: string;
}
