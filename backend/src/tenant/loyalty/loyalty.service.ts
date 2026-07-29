import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import {
  UpdateLoyaltySettingDto,
  AdjustPointsDto,
} from './dto/loyalty.dto';

@Injectable()
export class LoyaltyService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async getSettings() {
    let setting = await this.prisma.loyaltySetting.findFirst();
    if (!setting) {
      setting = await this.prisma.loyaltySetting.create({
        data: {
          pointsPerCurrency: 0.1, // 10 points per 100 BDT
          redemptionRate: 0.1,    // 100 points = 10 BDT
          minPointsToRedeem: 100,
          isEnabled: true,
        },
      });
    }
    return setting;
  }

  async updateSettings(dto: UpdateLoyaltySettingDto) {
    const existing = await this.getSettings();
    return this.prisma.loyaltySetting.update({
      where: { id: existing.id },
      data: dto,
    });
  }

  async getCustomerBalance(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        loyaltyTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!customer) throw new NotFoundException(`Customer ${customerId} not found`);

    const settings = await this.getSettings();
    return {
      customerId: customer.id,
      customerName: customer.name,
      loyaltyPoints: customer.loyaltyPoints,
      estimatedDiscountValue: (customer.loyaltyPoints * Number(settings.redemptionRate)).toFixed(2),
      isEnabled: settings.isEnabled,
      minPointsToRedeem: settings.minPointsToRedeem,
      transactions: customer.loyaltyTransactions,
    };
  }

  /**
   * Called during checkout to earn points on order total
   */
  async earnPointsForOrder(customerId: string, orderId: string, orderTotal: number) {
    const settings = await this.getSettings();
    if (!settings.isEnabled) return null;

    const rate = Number(settings.pointsPerCurrency);
    const pointsEarned = Math.floor(orderTotal * rate);
    if (pointsEarned <= 0) return null;

    const [tx] = await this.prisma.$transaction([
      this.prisma.loyaltyTransaction.create({
        data: {
          customerId,
          points: pointsEarned,
          type: 'EARNED',
          description: `Earned from Order #${orderId.slice(0, 8)}`,
          orderId,
        },
      }),
      this.prisma.customer.update({
        where: { id: customerId },
        data: {
          loyaltyPoints: { increment: pointsEarned },
        },
      }),
    ]);

    return { pointsEarned, transaction: tx };
  }

  /**
   * Called during checkout to calculate points redemption discount
   */
  async calculateRedemptionDiscount(customerId: string, pointsToRedeem: number) {
    const settings = await this.getSettings();
    if (!settings.isEnabled) {
      throw new BadRequestException('Loyalty rewards program is currently disabled');
    }

    if (pointsToRedeem < settings.minPointsToRedeem) {
      throw new BadRequestException(
        `Minimum ${settings.minPointsToRedeem} points required for redemption`,
      );
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw new NotFoundException(`Customer ${customerId} not found`);

    if (customer.loyaltyPoints < pointsToRedeem) {
      throw new BadRequestException(
        `Insufficient points balance (${customer.loyaltyPoints} available, requested ${pointsToRedeem})`,
      );
    }

    const discountAmount = pointsToRedeem * Number(settings.redemptionRate);
    return {
      pointsToRedeem,
      discountAmount,
    };
  }

  /**
   * Deducts points during checkout redemption
   */
  async processPointsRedemption(customerId: string, orderId: string, pointsToRedeem: number) {
    const { discountAmount } = await this.calculateRedemptionDiscount(customerId, pointsToRedeem);

    const [tx] = await this.prisma.$transaction([
      this.prisma.loyaltyTransaction.create({
        data: {
          customerId,
          points: -Math.abs(pointsToRedeem),
          type: 'REDEEMED',
          description: `Redeemed for Order #${orderId.slice(0, 8)} discount`,
          orderId,
        },
      }),
      this.prisma.customer.update({
        where: { id: customerId },
        data: {
          loyaltyPoints: { decrement: Math.abs(pointsToRedeem) },
        },
      }),
    ]);

    return { discountAmount, transaction: tx };
  }

  /**
   * Merchant manual point adjustment
   */
  async adjustPoints(dto: AdjustPointsDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) throw new NotFoundException(`Customer ${dto.customerId} not found`);

    const newBalance = customer.loyaltyPoints + dto.points;
    if (newBalance < 0) {
      throw new BadRequestException(`Adjustment result cannot be negative balance (${newBalance})`);
    }

    const [tx] = await this.prisma.$transaction([
      this.prisma.loyaltyTransaction.create({
        data: {
          customerId: dto.customerId,
          points: dto.points,
          type: 'ADJUSTMENT',
          description: dto.description || 'Merchant manual points adjustment',
        },
      }),
      this.prisma.customer.update({
        where: { id: dto.customerId },
        data: {
          loyaltyPoints: newBalance,
        },
      }),
    ]);

    return { newBalance, transaction: tx };
  }
}
