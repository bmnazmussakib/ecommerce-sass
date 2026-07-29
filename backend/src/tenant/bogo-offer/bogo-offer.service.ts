import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient, Prisma } from '@prisma/tenant-client';
import { CreateBogoOfferDto, UpdateBogoOfferDto } from './dto/bogo-offer.dto';

@Injectable()
export class BogoOfferService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async create(dto: CreateBogoOfferDto) {
    return this.prisma.bogoOffer.create({
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: new Date(dto.endDate),
      },
    });
  }

  async findAll() {
    return this.prisma.bogoOffer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const offer = await this.prisma.bogoOffer.findUnique({
      where: { id },
    });
    if (!offer) throw new NotFoundException(`BOGO offer ${id} not found`);
    return offer;
  }

  async update(id: string, dto: UpdateBogoOfferDto) {
    await this.findOne(id);
    return this.prisma.bogoOffer.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.bogoOffer.delete({
      where: { id },
    });
  }

  /**
   * Evaluates active BOGO offers against order items and returns total discount
   */
  async calculateBogoDiscount(
    orderItems: { variantId: string; quantity: number; price: number }[],
  ): Promise<Prisma.Decimal> {
    const now = new Date();
    const activeOffers = await this.prisma.bogoOffer.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (activeOffers.length === 0 || orderItems.length === 0) {
      return new Prisma.Decimal(0);
    }

    let totalBogoDiscount = new Prisma.Decimal(0);

    for (const offer of activeOffers) {
      const buyItem = orderItems.find((i) => i.variantId === offer.buyVariantId);
      const getItem = orderItems.find((i) => i.variantId === offer.getVariantId);

      if (!buyItem) continue;

      // How many full BOGO sets qualified
      let setMultiplier = 0;

      if (offer.buyVariantId === offer.getVariantId) {
        // e.g. Buy 1 Get 1 free of same item => Total 2 items needed for 1 free
        const requiredTotalQty = offer.buyQuantity + offer.getQuantity;
        setMultiplier = Math.floor(buyItem.quantity / requiredTotalQty);
      } else {
        // Different items: check buyItem qty & getItem qty
        if (!getItem) continue;
        const buySets = Math.floor(buyItem.quantity / offer.buyQuantity);
        const getSets = Math.floor(getItem.quantity / offer.getQuantity);
        setMultiplier = Math.min(buySets, getSets);
      }

      if (setMultiplier > 0 && getItem) {
        const freeQtyCount = setMultiplier * offer.getQuantity;
        const discountRatePercent = Number(offer.discountPercent);
        const singleDiscountAmount = new Prisma.Decimal(getItem.price)
          .mul(discountRatePercent)
          .div(100);

        const dealDiscount = singleDiscountAmount.mul(freeQtyCount);
        totalBogoDiscount = totalBogoDiscount.add(dealDiscount);
      }
    }

    return totalBogoDiscount;
  }
}
