import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import {
  PrismaClient as TenantPrismaClient,
  Prisma,
} from '@prisma/tenant-client';
import {
  CreateShippingZoneDto,
  UpdateShippingZoneDto,
  CreateShippingRateDto,
  UpdateShippingRateDto,
} from './dto/shipping.dto';

@Injectable()
export class ShippingService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  // --- Shipping Zones ---

  async createZone(dto: CreateShippingZoneDto) {
    return this.prisma.shippingZone.create({ data: dto });
  }

  async findAllZones() {
    return this.prisma.shippingZone.findMany({
      include: { rates: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneZone(id: string) {
    const zone = await this.prisma.shippingZone.findUnique({
      where: { id },
      include: { rates: true },
    });
    if (!zone) throw new NotFoundException('Shipping zone not found');
    return zone;
  }

  async updateZone(id: string, dto: UpdateShippingZoneDto) {
    await this.findOneZone(id);
    return this.prisma.shippingZone.update({ where: { id }, data: dto });
  }

  async removeZone(id: string) {
    await this.findOneZone(id);
    return this.prisma.shippingZone.delete({ where: { id } });
  }

  // --- Shipping Rates ---

  async createRate(dto: CreateShippingRateDto) {
    await this.findOneZone(dto.zoneId);
    return this.prisma.shippingRate.create({
      data: {
        zoneId: dto.zoneId,
        minOrderValue: dto.minOrderValue ?? undefined,
        maxOrderValue: dto.maxOrderValue ?? undefined,
        rate: dto.rate,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAllRates() {
    return this.prisma.shippingRate.findMany({
      include: { zone: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneRate(id: string) {
    const rate = await this.prisma.shippingRate.findUnique({
      where: { id },
      include: { zone: true },
    });
    if (!rate) throw new NotFoundException('Shipping rate not found');
    return rate;
  }

  async updateRate(id: string, dto: UpdateShippingRateDto) {
    await this.findOneRate(id);
    if (dto.zoneId) {
      await this.findOneZone(dto.zoneId);
    }
    return this.prisma.shippingRate.update({
      where: { id },
      data: dto,
    });
  }

  async removeRate(id: string) {
    await this.findOneRate(id);
    return this.prisma.shippingRate.delete({ where: { id } });
  }

  // --- Shipping Calculation ---

  async calculateShipping(
    address: string,
    subtotal: Prisma.Decimal,
  ): Promise<Prisma.Decimal> {
    const zones = await this.prisma.shippingZone.findMany({
      where: { isActive: true },
      include: {
        rates: {
          where: { isActive: true },
          orderBy: { rate: 'asc' },
        },
      },
    });

    const matchingZone = zones.find(
      (zone) =>
        zone.countries.some((c) =>
          address.toLowerCase().includes(c.toLowerCase()),
        ) ||
        zone.regions.some((r) =>
          address.toLowerCase().includes(r.toLowerCase()),
        ),
    );

    if (!matchingZone) {
      return new Prisma.Decimal(0);
    }

    const subtotalNum = Number(subtotal);
    const matchingRate = matchingZone.rates.find((rate) => {
      const meetsMin =
        rate.minOrderValue === null ||
        subtotalNum >= Number(rate.minOrderValue);
      const meetsMax =
        rate.maxOrderValue === null || subtotalNum < Number(rate.maxOrderValue);
      return meetsMin && meetsMax;
    });

    if (!matchingRate) {
      return new Prisma.Decimal(0);
    }

    return new Prisma.Decimal(Number(matchingRate.rate));
  }
}
