import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient, Prisma } from '@prisma/tenant-client';
import { CreateOrderDto, UpdateOrderStatusDto, RefundOrderDto } from './dto/order.dto';
import { BkashService } from '../integration/adapters/bkash.service';
import { SslCommerzService } from '../integration/adapters/sslcommerz.service';
import { SteadfastService } from '../integration/adapters/steadfast.service';
import { PathaoService } from '../integration/adapters/pathao.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
    private readonly bkashService: BkashService,
    private readonly sslCommerzService: SslCommerzService,
    private readonly steadfastService: SteadfastService,
    private readonly pathaoService: PathaoService,
  ) {}

  async checkout(dto: CreateOrderDto, tenantId: string, origin: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // 1. Check Spam Blocklist (Email and Phone)
    const blockList = await this.prisma.blockedContact.findFirst({
      where: {
        OR: [
          { value: dto.customerPhone },
          dto.customerEmail ? { value: dto.customerEmail } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (blockList) {
      throw new BadRequestException('Order rejected. Contact support for assistance.');
    }

    // 2. Check Device Fingerprint Blocklist
    if (dto.fingerprint) {
      const blockedFingerprint = await this.prisma.blockedFingerprint.findUnique({
        where: { fingerprint: dto.fingerprint },
      });
      if (blockedFingerprint) {
        throw new BadRequestException('Order rejected. Suspicious activity detected.');
      }

      // 3. Velocity check: Max 3 orders within 5 minutes from same device signature
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentOrdersCount = await this.prisma.order.count({
        where: {
          fingerprint: dto.fingerprint,
          createdAt: { gte: fiveMinutesAgo },
        },
      });

      if (recentOrdersCount >= 3) {
        throw new BadRequestException('Too many orders placed. Please try again later.');
      }
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

        // Check if there is an active flash sale for this variant
        const now = new Date();
        const activeFlashSaleProd = await tx.flashSaleProduct.findFirst({
          where: {
            productVariantId: variant.id,
            flashSale: {
              isActive: true,
              startDate: { lte: now },
              endDate: { gte: now },
            },
          },
        });

        let itemPrice = variant.price;
        if (activeFlashSaleProd) {
          const availableFlashSaleQty = activeFlashSaleProd.limitQuantity - activeFlashSaleProd.soldQuantity;
          if (availableFlashSaleQty < item.quantity) {
            throw new BadRequestException(
              `Requested quantity (${item.quantity}) exceeds available flash sale limit (${availableFlashSaleQty}) for ${variant.product.title}`
            );
          }

          // Override price with flash sale price
          itemPrice = activeFlashSaleProd.salePrice;

          // Increment soldQuantity in flash sale
          await tx.flashSaleProduct.update({
            where: { id: activeFlashSaleProd.id },
            data: { soldQuantity: { increment: item.quantity } },
          });
        }

        const itemTotal = itemPrice.mul(item.quantity);
        subTotal = subTotal.add(itemTotal);

        // Deduct stock
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: item.quantity } }
        });

        orderItemsData.push({
          variantId: variant.id,
          quantity: item.quantity,
          price: itemPrice
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

      // Fetch store settings to get taxRate
      const settings = await tx.storeSetting.findFirst();
      const taxRatePercent = settings?.taxRate ? Number(settings.taxRate) : 0;
      
      const priceBeforeTax = subTotal.sub(discount);
      const taxPaid = priceBeforeTax.mul(taxRatePercent).div(100);
      const totalPrice = priceBeforeTax.add(taxPaid).add(shippingCharge);

      const order = await tx.order.create({
        data: {
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          customerPhone: dto.customerPhone,
          shippingAddress: dto.shippingAddress,
          paymentMethod: dto.paymentMethod,
          shippingCharge,
          taxPaid,
          totalPrice,
          fingerprint: dto.fingerprint,
          orderItems: {
            create: orderItemsData
          }
        },
        include: { orderItems: true }
      });


      let bkashURL: string | null = null;
      let sslczGatewayUrl: string | null = null;

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
      } else if (dto.paymentMethod === 'CARD') {
        const integration = await tx.integration.findUnique({
          where: { provider: 'SSLCOMMERZ' }
        });
        if (!integration || !integration.isActive) {
          throw new BadRequestException('SSLCommerz integration is not configured or active');
        }

        const keys = integration.keysJson as any;
        const successUrl = `${origin}/api/tenant/orders/ssl-callback?status=success&orderId=${order.id}&tenantId=${tenantId}`;
        const failUrl = `${origin}/api/tenant/orders/ssl-callback?status=fail&orderId=${order.id}&tenantId=${tenantId}`;
        const cancelUrl = `${origin}/api/tenant/orders/ssl-callback?status=cancel&orderId=${order.id}&tenantId=${tenantId}`;

        sslczGatewayUrl = await this.sslCommerzService.initiatePayment(keys, {
          total_amount: totalPrice.toNumber(),
          tran_id: order.id,
          success_url: successUrl,
          fail_url: failUrl,
          cancel_url: cancelUrl,
          cus_name: order.customerName,
          cus_email: order.customerEmail || 'customer@ecomize.com',
          cus_phone: order.customerPhone,
          cus_add1: order.shippingAddress,
        });
      }

      return {
        message: bkashURL || sslczGatewayUrl ? 'Redirect to Payment Gateway' : 'Order placed successfully',
        orderId: order.id,
        subTotal,
        discount,
        shippingCharge,
        taxPaid,
        totalPrice,
        paymentUrl: bkashURL || sslczGatewayUrl,
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

  async verifySslCommerzPayment(orderId: string, valId: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (status !== 'success' || !valId) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' }
      });
      return { success: false, orderId, reason: `Payment status failed: ${status}` };
    }

    const integration = await this.prisma.integration.findUnique({
      where: { provider: 'SSLCOMMERZ' }
    });

    if (!integration || !integration.isActive) {
      throw new BadRequestException('SSLCommerz configuration missing');
    }

    const keys = integration.keysJson as any;
    const isValid = await this.sslCommerzService.validatePayment(keys, valId);

    if (isValid) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' }
      });
      return { success: true, orderId };
    } else {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' }
      });
      return { success: false, orderId, reason: 'Payment validation failed at SSLCommerz' };
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

  async fulfillOrder(orderId: string, courier: 'STEADFAST' | 'PATHAO', metadata?: any) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { variant: { include: { product: true } } } } }
    });

    if (!order) throw new NotFoundException('Order not found');

    const integration = await this.prisma.integration.findUnique({
      where: { provider: courier as any }
    });

    if (!integration || !integration.isActive) {
      throw new BadRequestException(`${courier} integration is not configured or active`);
    }

    const keys = integration.keysJson as any;
    let awbCode = '';
    let trackingUrl = '';

    if (courier === 'STEADFAST') {
      const res = await this.steadfastService.createOrder(keys, {
        invoice: order.id,
        recipient_name: order.customerName,
        recipient_phone: order.customerPhone,
        recipient_address: order.shippingAddress,
        cod_amount: order.totalPrice.toNumber(),
        note: metadata?.note || 'Fulfill order',
      });
      awbCode = res.consignment_id;
      trackingUrl = res.tracking_url;
    } else if (courier === 'PATHAO') {
      const res = await this.pathaoService.createOrder(keys, {
        recipient_name: order.customerName,
        recipient_phone: order.customerPhone,
        recipient_address: order.shippingAddress,
        recipient_city: metadata?.recipient_city,
        recipient_zone: metadata?.recipient_zone,
        recipient_area: metadata?.recipient_area,
        item_quantity: order.orderItems.reduce((acc, item) => acc + item.quantity, 0),
        item_weight: metadata?.item_weight || 0.5,
        amount_to_collect: order.totalPrice.toNumber(),
        special_instruction: metadata?.special_instruction,
      });
      awbCode = res.consignment_id;
      trackingUrl = res.tracking_url;
    }

    return await this.prisma.order.update({
      where: { id: orderId },
      data: {
        awbCode,
        trackingUrl,
        shippingStatus: 'SHIPPED',
      }
    });
  }

  async refundOrder(orderId: string, dto: RefundOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { variant: { include: { product: true } } } }
      }
    });

    if (!order) throw new NotFoundException('Order not found');

    const eligibleStatuses: string[] = ['PAID', 'DELIVERED'];
    if (!eligibleStatuses.includes(order.paymentStatus)) {
      throw new BadRequestException(
        `Cannot refund order with payment status: ${order.paymentStatus}. Order must be PAID or DELIVERED.`
      );
    }

    // Determine which items to restock
    const itemsToReturn = dto.items && dto.items.length > 0
      ? dto.items
      : order.orderItems.map(i => ({ variantId: i.variantId, quantity: i.quantity }));

    return await this.prisma.$transaction(async (tx) => {
      for (const returnItem of itemsToReturn) {
        // Validate quantity against original order
        const original = order.orderItems.find(i => i.variantId === returnItem.variantId);
        if (!original) {
          throw new BadRequestException(`Variant ${returnItem.variantId} not found in this order`);
        }
        if (returnItem.quantity > original.quantity) {
          throw new BadRequestException(
            `Return quantity (${returnItem.quantity}) exceeds ordered quantity (${original.quantity}) for variant ${returnItem.variantId}`
          );
        }

        // Restock
        await tx.productVariant.update({
          where: { id: returnItem.variantId },
          data: { stock: { increment: returnItem.quantity } }
        });
      }

      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'REFUNDED',
          shippingStatus: 'RETURNED',
          awbCode: order.awbCode ? `${order.awbCode} [REFUNDED]` : undefined,
        },
        include: { orderItems: true }
      });

      return {
        message: 'Order refunded successfully',
        orderId: updated.id,
        refundReason: dto.reason || 'Not specified',
        restockedItems: itemsToReturn,
        paymentStatus: updated.paymentStatus,
        shippingStatus: updated.shippingStatus,
      };
    });
  }
}

