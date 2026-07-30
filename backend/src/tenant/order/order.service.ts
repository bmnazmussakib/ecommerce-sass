import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import {
  PrismaClient as TenantPrismaClient,
  Prisma,
} from '@prisma/tenant-client';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  RefundOrderDto,
} from './dto/order.dto';
import { BkashService } from '../integration/adapters/bkash.service';
import { SslCommerzService } from '../integration/adapters/sslcommerz.service';
import { SteadfastService } from '../integration/adapters/steadfast.service';
import { PathaoService } from '../integration/adapters/pathao.service';
import { ShippingService } from '../shipping/shipping.service';
import { DigitalProductService } from '../digital-product/digital-product.service';
import { WebhookService } from '../webhook/webhook.service';
import { TaxRuleService } from '../tax-rule/tax-rule.service';
import { BogoOfferService } from '../bogo-offer/bogo-offer.service';
import { AffiliateService } from '../affiliate/affiliate.service';
import { LoyaltyService } from '../loyalty/loyalty.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
    private readonly bkashService: BkashService,
    private readonly sslCommerzService: SslCommerzService,
    private readonly steadfastService: SteadfastService,
    private readonly pathaoService: PathaoService,
    private readonly shippingService: ShippingService,
    private readonly digitalProductService: DigitalProductService,
    private readonly webhookService: WebhookService,
    private readonly taxRuleService: TaxRuleService,
    private readonly bogoOfferService: BogoOfferService,
    private readonly affiliateService: AffiliateService,
    private readonly loyaltyService: LoyaltyService,
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
      throw new BadRequestException(
        'Order rejected. Contact support for assistance.',
      );
    }

    // 2. Check Device Fingerprint Blocklist
    if (dto.fingerprint) {
      const blockedFingerprint =
        await this.prisma.blockedFingerprint.findUnique({
          where: { fingerprint: dto.fingerprint },
        });
      if (blockedFingerprint) {
        throw new BadRequestException(
          'Order rejected. Suspicious activity detected.',
        );
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
        throw new BadRequestException(
          'Too many orders placed. Please try again later.',
        );
      }
    }

    const transactionResult = await this.prisma.$transaction(async (tx) => {
      let subTotal = new Prisma.Decimal(0);
      const orderItemsData = [];
      let allDigital = true;

      for (const item of dto.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant)
          throw new NotFoundException(`Variant ${item.variantId} not found`);
        if (!variant.isDigital && variant.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${variant.product.title}`,
          );
        }
        if (!variant.isDigital) allDigital = false;

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
          const availableFlashSaleQty =
            activeFlashSaleProd.limitQuantity -
            activeFlashSaleProd.soldQuantity;
          if (availableFlashSaleQty < item.quantity) {
            throw new BadRequestException(
              `Requested quantity (${item.quantity}) exceeds available flash sale limit (${availableFlashSaleQty}) for ${variant.product.title}`,
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
          data: { stock: { decrement: item.quantity } },
        });

        orderItemsData.push({
          variantId: variant.id,
          quantity: item.quantity,
          price: itemPrice,
        });
      }

      let discount = new Prisma.Decimal(0);
      let couponUsed = null;

      if (dto.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: dto.couponCode },
        });
        if (!coupon || !coupon.isActive) {
          throw new BadRequestException('Invalid or expired coupon');
        }
        if (new Date() < coupon.startDate || new Date() > coupon.endDate) {
          throw new BadRequestException('Coupon is not active currently');
        }
        if (subTotal.lessThan(coupon.minOrderValue)) {
          throw new BadRequestException(
            `Minimum order value of ${coupon.minOrderValue} required for this coupon`,
          );
        }

        if (coupon.type === 'PERCENTAGE') {
          discount = subTotal.mul(coupon.value).div(100);
        } else {
          discount = coupon.value;
        }
        couponUsed = coupon.id;
      }

      // Evaluate BOGO offer promotion discounts
      const bogoDiscount = await this.bogoOfferService.calculateBogoDiscount(
        orderItemsData.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          price: Number(i.price),
        })),
      );
      discount = discount.add(bogoDiscount);

      // Calculate shipping: 0 for all-digital orders, otherwise zone-based
      const shippingCharge = allDigital
        ? new Prisma.Decimal(0)
        : await this.shippingService.calculateShipping(
            dto.shippingAddress,
            subTotal,
          );

      // Calculate dynamic tax based on shipping address region, fallback to store settings
      const matchedTaxRate = await this.taxRuleService.findMatchingTaxRate(
        dto.shippingAddress,
      );
      const settings = await tx.storeSetting.findFirst();
      const taxRatePercent =
        matchedTaxRate !== null
          ? matchedTaxRate
          : settings?.taxRate
            ? Number(settings.taxRate)
            : 0;

      const priceBeforeTax = subTotal.sub(discount);
      const taxPaid = priceBeforeTax.mul(taxRatePercent).div(100);
      const totalPrice = priceBeforeTax.add(taxPaid).add(shippingCharge);

      // Upsert Customer profile based on phone number
      let customer = await tx.customer.findUnique({
        where: { phone: dto.customerPhone },
      });

      if (customer) {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: dto.customerName,
            email: dto.customerEmail || customer.email,
            address: dto.shippingAddress || customer.address,
          },
        });
      } else {
        customer = await tx.customer.create({
          data: {
            name: dto.customerName,
            email: dto.customerEmail,
            phone: dto.customerPhone,
            address: dto.shippingAddress,
          },
        });
      }

      const order = await tx.order.create({
        data: {
          customerId: customer.id,
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
            create: orderItemsData,
          },
        },
        include: { orderItems: true },
      });

      if (dto.affiliateCode) {
        await this.affiliateService.trackConversion(
          dto.affiliateCode,
          order.id,
          Number(totalPrice),
        );
      }

      if (dto.redeemPoints && dto.redeemPoints > 0) {
        await this.loyaltyService.processPointsRedemption(
          customer.id,
          order.id,
          dto.redeemPoints,
        );
      }

      // Automatically credit earned loyalty points on order completion
      await this.loyaltyService.earnPointsForOrder(
        customer.id,
        order.id,
        Number(totalPrice),
      );

      return {
        order,
        subTotal,
        discount,
        shippingCharge,
        taxPaid,
        totalPrice,
        allDigital,
      };
    });

    let bkashURL: string | null = null;
    let sslczGatewayUrl: string | null = null;

    if (dto.paymentMethod === 'BKASH') {
      const integration = await this.prisma.integration.findUnique({
        where: { provider: 'BKASH' },
      });
      if (!integration || !integration.isActive) {
        throw new BadRequestException(
          'bKash integration is not configured or active',
        );
      }

      const keys = integration.keysJson as any;
      const token = await this.bkashService.grantToken(keys);
      const callbackUrl = `${origin}/api/tenant/orders/bkash-callback?tenantId=${tenantId}&orderId=${transactionResult.order.id}`;
      const paymentRes = await this.bkashService.createPayment(
        token,
        transactionResult.order.id,
        transactionResult.totalPrice.toNumber(),
        keys,
        callbackUrl,
      );
      bkashURL = paymentRes.bkashURL;
    } else if (dto.paymentMethod === 'CARD') {
      const integration = await this.prisma.integration.findUnique({
        where: { provider: 'SSLCOMMERZ' },
      });
      if (!integration || !integration.isActive) {
        throw new BadRequestException(
          'SSLCommerz integration is not configured or active',
        );
      }

      const keys = integration.keysJson as any;
      const successUrl = `${origin}/api/tenant/orders/ssl-callback?status=success&orderId=${transactionResult.order.id}&tenantId=${tenantId}`;
      const failUrl = `${origin}/api/tenant/orders/ssl-callback?status=fail&orderId=${transactionResult.order.id}&tenantId=${tenantId}`;
      const cancelUrl = `${origin}/api/tenant/orders/ssl-callback?status=cancel&orderId=${transactionResult.order.id}&tenantId=${tenantId}`;

      sslczGatewayUrl = await this.sslCommerzService.initiatePayment(keys, {
        total_amount: transactionResult.totalPrice.toNumber(),
        tran_id: transactionResult.order.id,
        success_url: successUrl,
        fail_url: failUrl,
        cancel_url: cancelUrl,
        cus_name: transactionResult.order.customerName,
        cus_email: transactionResult.order.customerEmail || 'customer@ecomize.com',
        cus_phone: transactionResult.order.customerPhone,
        cus_add1: transactionResult.order.shippingAddress,
      });
    }

    // Dispatch webhook
    void this.webhookService.dispatch('order.placed', {
      orderId: transactionResult.order.id,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      totalPrice: transactionResult.totalPrice.toNumber(),
      paymentMethod: dto.paymentMethod,
    });

    // Auto-generate download tokens for COD digital orders
    let digitalDownloads = null;
    if (transactionResult.allDigital && !bkashURL && !sslczGatewayUrl) {
      digitalDownloads =
        await this.digitalProductService.generateDownloadTokens(transactionResult.order.id);
    }

    return {
      message:
        bkashURL || sslczGatewayUrl
          ? 'Redirect to Payment Gateway'
          : 'Order placed successfully',
      orderId: transactionResult.order.id,
      subTotal: transactionResult.subTotal,
      discount: transactionResult.discount,
      shippingCharge: transactionResult.shippingCharge,
      taxPaid: transactionResult.taxPaid,
      totalPrice: transactionResult.totalPrice,
      paymentUrl: bkashURL || sslczGatewayUrl,
      digitalDownloads,
    };
  }

  async verifyBkashPayment(orderId: string, paymentID: string, status: string) {
    console.log(
      `Verifying bKash Payment: orderId=${orderId}, paymentID=${paymentID}, status=${status}`,
    );
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (status !== 'success') {
      console.log(`Payment status was not success: ${status}`);
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });
      return {
        orderId,
        success: false,
        reason: `bKash redirected with status: ${status}`,
      };
    }

    const integration = await this.prisma.integration.findUnique({
      where: { provider: 'BKASH' },
    });
    if (!integration || !integration.isActive) {
      throw new BadRequestException(
        'bKash integration is not active or configured',
      );
    }

    const keys = integration.keysJson as any;
    try {
      const token = await this.bkashService.grantToken(keys);
      console.log(`Granted token for execution: ${token.substring(0, 15)}...`);
      const executeRes = await this.bkashService.executePayment(
        token,
        paymentID,
        keys,
      );
      console.log(
        'bKash execute payment response:',
        JSON.stringify(executeRes, null, 2),
      );

      if (executeRes.statusCode === '0000') {
        await this.prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'PAID' },
        });
        void this.webhookService.dispatch('payment.confirmed', {
          orderId,
          paymentMethod: 'BKASH',
          paymentStatus: 'PAID',
        });
        let digitalDownloads = null;
        try {
          digitalDownloads =
            await this.digitalProductService.generateDownloadTokens(orderId);
        } catch {}
        return { orderId, success: true, digitalDownloads };
      } else {
        console.log(
          `bKash returned status code: ${executeRes.statusCode} - ${executeRes.statusMessage}`,
        );
        await this.prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'FAILED' },
        });
        return { orderId, success: false, reason: executeRes.statusMessage };
      }
    } catch (error) {
      console.error('Error in bKash verification execution:', error);
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });
      throw error;
    }
  }

  async verifySslCommerzPayment(
    orderId: string,
    valId: string,
    status: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (status !== 'success' || !valId) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });
      return {
        success: false,
        orderId,
        reason: `Payment status failed: ${status}`,
      };
    }

    const integration = await this.prisma.integration.findUnique({
      where: { provider: 'SSLCOMMERZ' },
    });

    if (!integration || !integration.isActive) {
      throw new BadRequestException('SSLCommerz configuration missing');
    }

    const keys = integration.keysJson as any;
    const isValid = await this.sslCommerzService.validatePayment(keys, valId);

    if (isValid) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' },
      });
      void this.webhookService.dispatch('payment.confirmed', {
        orderId,
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
      });
      let digitalDownloads = null;
      try {
        digitalDownloads =
          await this.digitalProductService.generateDownloadTokens(orderId);
      } catch {}
      return { success: true, orderId, digitalDownloads };
    } else {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });
      return {
        success: false,
        orderId,
        reason: 'Payment validation failed at SSLCommerz',
      };
    }
  }

  async findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { orderItems: true },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { variant: { include: { product: true } } },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    const updated = await this.prisma.order.update({
      where: { id },
      data: { ...dto },
    });
    void this.webhookService.dispatch('order.status_changed', {
      orderId: id,
      previousPaymentStatus: order.paymentStatus,
      previousShippingStatus: order.shippingStatus,
      newPaymentStatus: updated.paymentStatus,
      newShippingStatus: updated.shippingStatus,
    });
    return updated;
  }

  async fulfillOrder(
    orderId: string,
    courier: 'STEADFAST' | 'PATHAO',
    metadata?: any,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { variant: { include: { product: true } } } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    const integration = await this.prisma.integration.findUnique({
      where: { provider: courier as any },
    });

    if (!integration || !integration.isActive) {
      throw new BadRequestException(
        `${courier} integration is not configured or active`,
      );
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
        item_quantity: order.orderItems.reduce(
          (acc, item) => acc + item.quantity,
          0,
        ),
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
      },
    });
  }

  async refundOrder(orderId: string, dto: RefundOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { variant: { include: { product: true } } } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    const eligibleStatuses: string[] = ['PAID', 'DELIVERED'];
    if (!eligibleStatuses.includes(order.paymentStatus)) {
      throw new BadRequestException(
        `Cannot refund order with payment status: ${order.paymentStatus}. Order must be PAID or DELIVERED.`,
      );
    }

    // Determine which items to restock
    const itemsToReturn =
      dto.items && dto.items.length > 0
        ? dto.items
        : order.orderItems.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          }));

    return await this.prisma.$transaction(async (tx) => {
      for (const returnItem of itemsToReturn) {
        // Validate quantity against original order
        const original = order.orderItems.find(
          (i) => i.variantId === returnItem.variantId,
        );
        if (!original) {
          throw new BadRequestException(
            `Variant ${returnItem.variantId} not found in this order`,
          );
        }
        if (returnItem.quantity > original.quantity) {
          throw new BadRequestException(
            `Return quantity (${returnItem.quantity}) exceeds ordered quantity (${original.quantity}) for variant ${returnItem.variantId}`,
          );
        }

        // Restock
        await tx.productVariant.update({
          where: { id: returnItem.variantId },
          data: { stock: { increment: returnItem.quantity } },
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
        include: { orderItems: true },
      });

      void this.webhookService.dispatch('order.refunded', {
        orderId,
        reason: dto.reason || 'Not specified',
        paymentStatus: updated.paymentStatus,
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
