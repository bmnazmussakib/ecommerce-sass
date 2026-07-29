import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { CreateTaxRuleDto, UpdateTaxRuleDto } from './dto/tax-rule.dto';

@Injectable()
export class TaxRuleService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async create(dto: CreateTaxRuleDto) {
    return this.prisma.taxRule.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.taxRule.findMany({
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const rule = await this.prisma.taxRule.findUnique({
      where: { id },
    });
    if (!rule) throw new NotFoundException(`Tax rule ${id} not found`);
    return rule;
  }

  async update(id: string, dto: UpdateTaxRuleDto) {
    await this.findOne(id);
    return this.prisma.taxRule.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.taxRule.delete({
      where: { id },
    });
  }

  /**
   * Find matching tax rate based on customer address
   */
  async findMatchingTaxRate(address?: string): Promise<number | null> {
    if (!address) return null;

    const rules = await this.prisma.taxRule.findMany({
      where: { isActive: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    if (rules.length === 0) return null;

    const normalizedAddress = address.toLowerCase();

    // 1. Try region/country match
    for (const rule of rules) {
      const regionMatch =
        rule.region !== '*' &&
        normalizedAddress.includes(rule.region.toLowerCase());
      const countryMatch =
        rule.country !== '*' &&
        normalizedAddress.includes(rule.country.toLowerCase());

      if (regionMatch || countryMatch) {
        return Number(rule.rate);
      }
    }

    // 2. Global wildcard rule fallback if defined
    const globalRule = rules.find(
      (r) => r.region === '*' && r.country === '*',
    );
    if (globalRule) {
      return Number(globalRule.rate);
    }

    return null;
  }
}
