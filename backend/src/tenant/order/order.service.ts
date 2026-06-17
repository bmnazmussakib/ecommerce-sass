import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient, Prisma } from '@prisma/tenant-client';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { BkashService } from '../integration/adapters/bkash.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
    private readonly bkashService: BkashService,
  ) {}

  async checkout(dto: CreateOrderDto, tenantId: string, origin: string) {
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

      // Flat shipping charge
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

      let bkashURL: string | null = null;
      if (dto.paymentMethod === 'BKASH') {
        const integration = await tx.integration.findUnique({
          where: { provider: 'BKASH' }
        });
        if (!integration || !integration.isActive) {
          throw new BadRequestException('bKash integration is not configured or active');
        }

        const keys = integration.keysJson as any;
        const token = await this.bkashService.grantToken(keys);
        const callbackUrl = `${origin}/api/tenant/orders/bkash-callback?tenantId=${tenantId}&orderId=${order.id}`;
        const paymentRes = await this.bkashService.createPayment(
          token,
          order.id,
          totalPrice.toNumber(),
          keys,
          callbackUrl
        );
        bkashURL = paymentRes.bkashURL;
      }

      return {
        message: bkashURL ? 'Redirect to bKash' : 'Order placed successfully',
        orderId: order.id,
        subTotal,
        discount,
        shippingCharge,
        totalPrice,
        bkashURL
      };
    });
  }

  async verifyBkashPayment(orderId: string, paymentID: string, status: string) {
    console.log(`Verifying bKash Payment: orderId=${orderId}, paymentID=${paymentID}, status=${status}`);
    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });
    if (!order) throw new NotFoundException('Order not found');

    if (status !== 'success') {
      console.log(`Payment status was not success: ${status}`);
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' }
      });
      return { orderId, success: false, reason: `bKash redirected with status: ${status}` };
    }

    const integration = await this.prisma.integration.findUnique({
      where: { provider: 'BKASH' }
    });
    if (!integration || !integration.isActive) {
      throw new BadRequestException('bKash integration is not active or configured');
    }

    const keys = integration.keysJson as any;
    try {
      const token = await this.bkashService.grantToken(keys);
      console.log(`Granted token for execution: ${token.substring(0, 15)}...`);
      const executeRes = await this.bkashService.executePayment(token, paymentID, keys);
      console.log('bKash execute payment response:', JSON.stringify(executeRes, null, 2));
      
      if (executeRes.statusCode === '0000') {
        await this.prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'PAID' }
        });
        return { orderId, success: true };
      } else {
        console.log(`bKash returned status code: ${executeRes.statusCode} - ${executeRes.statusMessage}`);
        await this.prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'FAILED' }
        });
        return { orderId, success: false, reason: executeRes.statusMessage };
      }
    } catch (error) {
      console.error('Error in bKash verification execution:', error);
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' }
      });
      throw error;
    }
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
