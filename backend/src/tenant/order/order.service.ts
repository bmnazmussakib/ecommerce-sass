import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient, Prisma } from '@prisma/tenant-client';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(@Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient) {}

  async checkout(dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    return await this.prisma.$transaction(async (tx) => {
      let subTotal = new Prisma.Decimal(0);
      const orderItemsData = [];

      for (const item of dto.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true }
        });

        if (!variant) throw new NotFoundException(`Variant ${item.variantId} not found`);
        if (variant.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${variant.product.title}`);
        }

        const itemTotal = variant.price.mul(item.quantity);
        subTotal = subTotal.add(itemTotal);

        // Deduct stock
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: item.quantity } }
        });

        orderItemsData.push({
          variantId: variant.id,
          quantity: item.quantity,
          price: variant.price
        });
      }

      let discount = new Prisma.Decimal(0);
      let couponUsed = null;

      if (dto.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: dto.couponCode } });
        if (!coupon || !coupon.isActive) {
          throw new BadRequestException('Invalid or expired coupon');
        }
        if (new Date() < coupon.startDate || new Date() > coupon.endDate) {
          throw new BadRequestException('Coupon is not active currently');
        }
        if (subTotal.lessThan(coupon.minOrderValue)) {
          throw new BadRequestException(`Minimum order value of ${coupon.minOrderValue} required for this coupon`);
        }

        if (coupon.type === 'PERCENTAGE') {
          discount = subTotal.mul(coupon.value).div(100);
        } else {
          discount = coupon.value;
        }
        couponUsed = coupon.id;
      }

      // Simplification: flat shipping charge 100 for example, or based on settings
      const shippingCharge = new Prisma.Decimal(100);
      
      const totalPrice = subTotal.sub(discount).add(shippingCharge);

      const order = await tx.order.create({
        data: {
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          shippingAddress: dto.shippingAddress,
          paymentMethod: dto.paymentMethod,
          shippingCharge,
          totalPrice,
          orderItems: {
            create: orderItemsData
          }
        },
        include: { orderItems: true }
      });

      return {
        message: 'Order placed successfully',
        orderId: order.id,
        subTotal,
        discount,
        shippingCharge,
        totalPrice
      };
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { orderItems: true }
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { variant: { include: { product: true } } }
        }
      }
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { ...dto }
    });
  }
}
