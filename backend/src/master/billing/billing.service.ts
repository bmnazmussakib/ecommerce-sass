import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MasterPrismaService } from '../../core/database/master-prisma.service';
import { InitiateGatewayPaymentDto, SubmitManualPaymentDto, ReviewPaymentDto } from './dto/billing.dto';

@Injectable()
export class BillingService {
  private readonly isSandbox = true;
  private readonly baseUrl = 'https://sandbox.sslcommerz.com';

  constructor(private readonly prisma: MasterPrismaService) {}

  async initiateGatewayPayment(tenantId: string, planId: string, origin: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantId },
          { subdomain: tenantId },
        ],
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    // Create a pending payment log in the Master DB
    const payment = await this.prisma.subscriptionPayment.create({
      data: {
        tenantId: tenant.id,
        planId,
        amount: plan.price,
        method: 'GATEWAY',
        gateway: 'SSLCOMMERZ',
        status: 'PENDING',
      },
    });

    const storeId = process.env.MASTER_SSLCOMMERZ_STORE_ID || 'teste6a6655dc347ee';
    const storePass = process.env.MASTER_SSLCOMMERZ_STORE_PASSWD || 'teste6a6655dc347ee@ssl';

    const url = `${this.baseUrl}/gwprocess/v4/api.php`;
    const formData = new URLSearchParams();
    formData.append('store_id', storeId);
    formData.append('store_passwd', storePass);
    formData.append('total_amount', plan.price.toString());
    formData.append('currency', 'BDT');
    formData.append('tran_id', payment.id); // Use payment log ID as transaction ID
    formData.append('success_url', `${origin}/api/master/billing/ssl-callback?status=success&paymentId=${payment.id}`);
    formData.append('fail_url', `${origin}/api/master/billing/ssl-callback?status=fail&paymentId=${payment.id}`);
    formData.append('cancel_url', `${origin}/api/master/billing/ssl-callback?status=cancel&paymentId=${payment.id}`);

    formData.append('cus_name', tenant.subdomain);
    formData.append('cus_email', 'tenant@ecomize.com');
    formData.append('cus_add1', 'Dhaka');
    formData.append('cus_phone', '01700000000');
    formData.append('cus_country', 'Bangladesh');

    formData.append('shipping_method', 'NO');
    formData.append('num_of_item', '1');
    formData.append('product_name', `Plan: ${plan.name}`);
    formData.append('product_category', 'Software');
    formData.append('product_profile', 'non-physical-goods');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new BadRequestException(`SSLCommerz response parse error: ${text}`);
    }

    if (data.status === 'SUCCESS' && data.GatewayPageURL) {
      return { paymentUrl: data.GatewayPageURL };
    } else {
      throw new BadRequestException(`SSLCommerz Payment Initiation Failed: ${data.failedreason || 'Unknown Error'}`);
    }
  }

  async verifyGatewayPayment(paymentId: string, valId: string, status: string) {
    const payment = await this.prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment record not found');

    if (status !== 'success' || !valId) {
      await this.prisma.subscriptionPayment.update({
        where: { id: paymentId },
        data: { status: 'FAILED' },
      });
      return { success: false };
    }

    const storeId = process.env.MASTER_SSLCOMMERZ_STORE_ID || 'teste6a6655dc347ee';
    const storePass = process.env.MASTER_SSLCOMMERZ_STORE_PASSWD || 'teste6a6655dc347ee@ssl';
    const verifyUrl = `${this.baseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePass}&format=json`;

    const res = await fetch(verifyUrl);
    const data = await res.json() as any;

    if (data.status === 'VALID' || data.status === 'VALIDATED') {
      await this.prisma.$transaction([
        this.prisma.subscriptionPayment.update({
          where: { id: paymentId },
          data: { status: 'SUCCESS', transactionId: data.bank_tran_id || valId },
        }),
        this.prisma.subscription.upsert({
          where: { tenantId: payment.tenantId },
          update: {
            planId: payment.planId,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days
          },
          create: {
            tenantId: payment.tenantId,
            planId: payment.planId,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);
      return { success: true };
    } else {
      await this.prisma.subscriptionPayment.update({
        where: { id: paymentId },
        data: { status: 'FAILED', notes: 'Verification failed at SSLCommerz' },
      });
      return { success: false };
    }
  }

  async submitManualPayment(tenantId: string, planId: string, transactionId: string, senderNumber: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantId },
          { subdomain: tenantId },
        ],
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const existingTx = await this.prisma.subscriptionPayment.findUnique({
      where: { transactionId },
    });
    if (existingTx) throw new BadRequestException('Transaction ID already submitted');

    return this.prisma.subscriptionPayment.create({
      data: {
        tenantId: tenant.id,
        planId,
        amount: plan.price,
        method: 'MANUAL',
        status: 'PENDING',
        transactionId,
        senderNumber,
      },
    });
  }


  async reviewManualPayment(paymentId: string, reviewStatus: 'SUCCESS' | 'FAILED', notes?: string) {
    const payment = await this.prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment record not found');
    if (payment.status !== 'PENDING') throw new BadRequestException('Payment is already reviewed');

    if (reviewStatus === 'FAILED') {
      return this.prisma.subscriptionPayment.update({
        where: { id: paymentId },
        data: { status: 'FAILED', notes },
      });
    }

    return await this.prisma.$transaction([
      this.prisma.subscriptionPayment.update({
        where: { id: paymentId },
        data: { status: 'SUCCESS', notes },
      }),
      this.prisma.subscription.upsert({
        where: { tenantId: payment.tenantId },
        update: {
          planId: payment.planId,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days
        },
        create: {
          tenantId: payment.tenantId,
          planId: payment.planId,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);
  }

  async getPayments() {
    return this.prisma.subscriptionPayment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tenant: true, plan: true },
    });
  }
}
