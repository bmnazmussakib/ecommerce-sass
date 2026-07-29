import { Injectable, NotFoundException } from '@nestjs/common';
import { MasterPrismaService } from '../../core/database/master-prisma.service';
import { CreatePlanDto, UpdatePlanDto, SetPlanCurrencyPriceDto } from './dto/plan.dto';

@Injectable()
export class PlanService {
  constructor(private prisma: MasterPrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    return this.prisma.plan.create({
      data: {
        ...createPlanDto,
        currency: createPlanDto.currency ? createPlanDto.currency.toUpperCase() : 'USD',
      },
      include: { prices: true },
    });
  }

  async findAll() {
    return this.prisma.plan.findMany({
      include: { prices: true },
      orderBy: { price: 'asc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: { prices: true },
    });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto) {
    await this.findOne(id);
    return this.prisma.plan.update({
      where: { id },
      data: {
        ...updatePlanDto,
        currency: updatePlanDto.currency ? updatePlanDto.currency.toUpperCase() : undefined,
      } as any,
      include: { prices: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.plan.delete({ where: { id } });
  }

  /**
   * Set or update currency specific price for a plan
   */
  async setCurrencyPrice(planId: string, dto: SetPlanCurrencyPriceDto) {
    const plan = await this.findOne(planId);
    const currency = dto.currency.toUpperCase();

    const priceRecord = await this.prisma.planPricing.upsert({
      where: {
        planId_currency: {
          planId: plan.id,
          currency,
        },
      },
      update: { price: dto.price },
      create: {
        planId: plan.id,
        currency,
        price: dto.price,
      },
    });

    return priceRecord;
  }

  /**
   * Get all multi-currency prices for a plan
   */
  async getCurrencyPrices(planId: string) {
    const plan = await this.findOne(planId);
    return plan.prices;
  }

  /**
   * Resolve price for requested currency, falling back to base plan price
   */
  async getPlanPriceInCurrency(planId: string, currency: string) {
    const plan = await this.findOne(planId);
    const targetCurrency = currency.toUpperCase();

    if (plan.currency.toUpperCase() === targetCurrency) {
      return {
        planId: plan.id,
        planName: plan.name,
        currency: plan.currency,
        price: Number(plan.price),
        isFallback: false,
      };
    }

    const specificPrice = await this.prisma.planPricing.findUnique({
      where: {
        planId_currency: {
          planId: plan.id,
          currency: targetCurrency,
        },
      },
    });

    if (specificPrice) {
      return {
        planId: plan.id,
        planName: plan.name,
        currency: specificPrice.currency,
        price: Number(specificPrice.price),
        isFallback: false,
      };
    }

    // Fallback to base plan currency & price
    return {
      planId: plan.id,
      planName: plan.name,
      currency: plan.currency,
      price: Number(plan.price),
      isFallback: true,
      requestedCurrency: targetCurrency,
    };
  }

  /**
   * Delete specific currency price tier
   */
  async removeCurrencyPrice(planId: string, currency: string) {
    await this.findOne(planId);
    return this.prisma.planPricing.delete({
      where: {
        planId_currency: {
          planId,
          currency: currency.toUpperCase(),
        },
      },
    });
  }
}
