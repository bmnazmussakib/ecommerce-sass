import { Injectable, NotFoundException } from '@nestjs/common';
import { MasterPrismaService } from '../../core/database/master-prisma.service';
import { UpdateSubscriptionDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: MasterPrismaService) {}

  async findAll() {
    return this.prisma.subscription.findMany({
      include: {
        tenant: true,
        plan: true,
      },
    });
  }

  async findOne(tenantId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantId },
          { subdomain: tenantId },
        ],
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId: tenant.id },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found for this tenant');
    }

    return subscription;
  }

  async update(tenantId: string, dto: UpdateSubscriptionDto) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantId },
          { subdomain: tenantId },
        ],
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    if (dto.planId) {
      const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
      if (!plan) throw new NotFoundException('Plan not found');
    }

    return this.prisma.subscription.upsert({
      where: { tenantId: tenant.id },
      update: {
        planId: dto.planId,
        status: dto.status,
        currentPeriodEnd: dto.currentPeriodEnd ? new Date(dto.currentPeriodEnd) : undefined,
      },
      create: {
        tenantId: tenant.id,
        planId: dto.planId || '',
        status: dto.status || 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: dto.currentPeriodEnd ? new Date(dto.currentPeriodEnd) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async remove(tenantId: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantId },
          { subdomain: tenantId },
        ],
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId: tenant.id },
    });
    if (!subscription) throw new NotFoundException('Subscription record not found');

    return this.prisma.subscription.delete({
      where: { tenantId: tenant.id },
    });
  }
}
