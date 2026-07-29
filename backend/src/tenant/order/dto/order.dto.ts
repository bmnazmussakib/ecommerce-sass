import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
export enum PaymentMethod {
  COD = 'COD',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  CARD = 'CARD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum ShippingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

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

  @ApiProperty({ example: 'device-fingerprint-hash-val', required: false })
  @IsOptional()
  @IsString()
  fingerprint?: string;
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

export class FulfillOrderDto {
  @ApiProperty({ enum: ['STEADFAST', 'PATHAO'] })
  @IsString()
  courier!: 'STEADFAST' | 'PATHAO';

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: any;
}

export class RefundItemDto {
  @ApiProperty({ example: 'variant-uuid' })
  @IsString()
  variantId!: string;

  @ApiProperty({ example: 1, description: 'Quantity to return and restock' })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class RefundOrderDto {
  @ApiProperty({ example: 'Customer returned damaged item', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    type: [RefundItemDto],
    required: false,
    description:
      'Specific items to return. If omitted, all order items are restocked.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RefundItemDto)
  items?: RefundItemDto[];
}
