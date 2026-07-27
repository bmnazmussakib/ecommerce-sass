import { Injectable } from '@nestjs/common';
import { MasterPrismaService } from '../../core/database/master-prisma.service';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';

@Injectable()
export class PlatformAnalyticsService {
  constructor(private readonly prisma: MasterPrismaService) {}

  async getPlatformMetrics() {
    // 1. Total Tenants and Active/Pending/Suspended breakdown
    const tenantsGroup = await this.prisma.tenant.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const tenantStats = {
      total: 0,
      ACTIVE: 0,
      PENDING: 0,
      SUSPENDED: 0,
    };

    for (const group of tenantsGroup) {
      tenantStats[group.status] = group._count.id;
      tenantStats.total += group._count.id;
    }

    // 2. Active subscriptions count and plan distribution
    const activeSubscriptions = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });

    // 3. Calculate MRR (Monthly Recurring Revenue)
    let mrr = 0;
    const planDistribution: Record<string, number> = {};

    for (const sub of activeSubscriptions) {
      const price = Number(sub.plan.price);
      const isYearly = sub.plan.interval === 'YEARLY';
      
      // MRR is plan price divided by 12 if yearly, else raw monthly price
      mrr += isYearly ? price / 12 : price;

      const planName = sub.plan.name;
      planDistribution[planName] = (planDistribution[planName] || 0) + 1;
    }

    // 4. Sum up all payments received
    const paymentsSummary = await this.prisma.subscriptionPayment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalRevenue = Number(paymentsSummary._sum.amount || 0);
    const successfulPaymentsCount = paymentsSummary._count.id;

    // 5. Total Products and Orders across all tenants (dynamic databases aggregation)
    const tenants = await this.prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
    });

    let totalProducts = 0;
    let totalOrders = 0;
    let totalGMV = 0; // Gross Merchandise Value (Sum of all orders across tenants)

    for (const tenant of tenants) {
      const tenantPrisma = new TenantPrismaClient({
        datasources: {
          db: {
            url: tenant.dbConnectionString,
          },
        },
      });

      try {
        await tenantPrisma.$connect();
        
        const productCount = await tenantPrisma.product.count();
        totalProducts += productCount;

        const orderStats = await tenantPrisma.order.aggregate({
          _count: {
            id: true,
          },
          _sum: {
            totalPrice: true,
          },
        });

        totalOrders += orderStats._count.id;
        totalGMV += Number(orderStats._sum.totalPrice || 0);

      } catch (err: any) {
        console.error(`[PlatformAnalytics] Failed to query tenant DB for ${tenant.subdomain}:`, err.message);
      } finally {
        await tenantPrisma.$disconnect();
      }
    }

    // 6. Recent Platform Payments (last 5)
    const recentPayments = await this.prisma.subscriptionPayment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        tenant: {
          select: {
            subdomain: true,
          },
        },
        plan: {
          select: {
            name: true,
            interval: true,
          },
        },
      },
    });

    return {
      tenants: tenantStats,
      subscriptions: {
        totalActive: activeSubscriptions.length,
        planDistribution,
      },
      revenue: {
        mrr: Number(mrr.toFixed(2)),
        totalSubscriptionRevenue: totalRevenue,
        successfulPaymentsCount,
      },
      merchantActivity: {
        totalProducts,
        totalOrders,
        totalGMV: Number(totalGMV.toFixed(2)),
      },
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        tenantSubdomain: p.tenant.subdomain,
        planName: p.plan.name,
        amount: Number(p.amount),
        method: p.method,
        status: p.status,
        createdAt: p.createdAt,
      })),
    };
  }
}
