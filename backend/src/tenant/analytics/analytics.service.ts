import { Injectable, Inject } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async getSummary() {
    const [totalOrders, paidOrders, totalCustomers] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalPrice: true },
        _count: true,
      }),
      this.prisma.order.groupBy({
        by: ['customerPhone'],
        _count: true,
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: paidOrders._sum.totalPrice ?? 0,
      paidOrders: paidOrders._count,
      totalCustomers: totalCustomers.length,
    };
  }

  async getSalesChart(period: '7d' | '30d' | '90d' = '7d') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: since },
      },
      select: { createdAt: true, totalPrice: true },
    });

    // Group by date
    const map = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      map.set(key, 0);
    }
    for (const o of orders) {
      const key = o.createdAt.toISOString().split('T')[0];
      if (map.has(key)) {
        map.set(key, (map.get(key) ?? 0) + Number(o.totalPrice));
      }
    }

    return Array.from(map.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTopProducts(limit = 5) {
    const items = await this.prisma.orderItem.groupBy({
      by: ['variantId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const variantIds = items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { select: { title: true } } },
    });

    return items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      return {
        variantId: item.variantId,
        productTitle: variant?.product?.title ?? 'Unknown',
        sku: variant?.sku ?? '-',
        totalSold: item._sum.quantity ?? 0,
      };
    });
  }

  async getOrdersByStatus() {
    const [byPayment, byShipping] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['paymentStatus'],
        _count: true,
      }),
      this.prisma.order.groupBy({
        by: ['shippingStatus'],
        _count: true,
      }),
    ]);

    return {
      paymentStatus: byPayment.map((r) => ({
        status: r.paymentStatus,
        count: r._count,
      })),
      shippingStatus: byShipping.map((r) => ({
        status: r.shippingStatus,
        count: r._count,
      })),
    };
  }

  async getRecentOrders(limit = 10) {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        totalPrice: true,
        paymentStatus: true,
        shippingStatus: true,
        createdAt: true,
      },
    });
  }
}
