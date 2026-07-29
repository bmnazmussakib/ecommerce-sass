import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import {
  CreateAffiliatePartnerDto,
  UpdateAffiliatePartnerDto,
  CreatePayoutDto,
} from './dto/affiliate.dto';

@Injectable()
export class AffiliateService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async createPartner(dto: CreateAffiliatePartnerDto) {
    const existingCode = await this.prisma.affiliatePartner.findUnique({
      where: { code: dto.code.toUpperCase() },
    });
    if (existingCode) throw new ConflictException(`Referral code ${dto.code} already exists`);

    const existingEmail = await this.prisma.affiliatePartner.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) throw new ConflictException(`Email ${dto.email} already registered`);

    return this.prisma.affiliatePartner.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        code: dto.code.toUpperCase(),
        commissionRate: dto.commissionRate ?? 5.0,
      },
    });
  }

  async validateCode(code: string) {
    const partner = await this.prisma.affiliatePartner.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!partner || partner.status !== 'ACTIVE') {
      return { valid: false, code };
    }
    return {
      valid: true,
      code: partner.code,
      name: partner.name,
      commissionRate: Number(partner.commissionRate),
    };
  }

  async findAllPartners() {
    return this.prisma.affiliatePartner.findMany({
      include: {
        _count: {
          select: { conversions: true, payouts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOnePartner(id: string) {
    const partner = await this.prisma.affiliatePartner.findUnique({
      where: { id },
      include: {
        conversions: { orderBy: { createdAt: 'desc' }, take: 10 },
        payouts: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!partner) throw new NotFoundException(`Affiliate partner ${id} not found`);
    return partner;
  }

  async updatePartner(id: string, dto: UpdateAffiliatePartnerDto) {
    await this.findOnePartner(id);
    return this.prisma.affiliatePartner.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toUpperCase() : undefined,
      },
    });
  }

  /**
   * Internal method called during checkout to credit affiliate
   */
  async trackConversion(affiliateCode: string, orderId: string, orderAmount: number) {
    const partner = await this.prisma.affiliatePartner.findUnique({
      where: { code: affiliateCode.toUpperCase() },
    });
    if (!partner || partner.status !== 'ACTIVE') return null;

    const rate = Number(partner.commissionRate);
    const commissionAmount = (orderAmount * rate) / 100;

    const [conversion] = await this.prisma.$transaction([
      this.prisma.affiliateConversion.create({
        data: {
          affiliateId: partner.id,
          orderId,
          orderAmount,
          commissionAmount,
          status: 'APPROVED',
        },
      }),
      this.prisma.affiliatePartner.update({
        where: { id: partner.id },
        data: {
          totalEarnings: { increment: commissionAmount },
        },
      }),
    ]);

    return conversion;
  }

  async getConversions(affiliateId?: string) {
    return this.prisma.affiliateConversion.findMany({
      where: affiliateId ? { affiliateId } : undefined,
      include: {
        affiliate: {
          select: { name: true, email: true, code: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPayout(dto: CreatePayoutDto) {
    const partner = await this.findOnePartner(dto.affiliateId);
    const totalEarnings = Number(partner.totalEarnings);
    const paidEarnings = Number(partner.paidEarnings);
    const pendingBalance = totalEarnings - paidEarnings;

    if (dto.amount > pendingBalance) {
      throw new BadRequestException(
        `Payout amount (${dto.amount}) exceeds unpaid balance (${pendingBalance.toFixed(2)})`,
      );
    }

    const [payout] = await this.prisma.$transaction([
      this.prisma.affiliatePayout.create({
        data: {
          affiliateId: dto.affiliateId,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          reference: dto.reference,
          notes: dto.notes,
        },
      }),
      this.prisma.affiliatePartner.update({
        where: { id: dto.affiliateId },
        data: {
          paidEarnings: { increment: dto.amount },
        },
      }),
    ]);

    return payout;
  }

  async getPayouts(affiliateId?: string) {
    return this.prisma.affiliatePayout.findMany({
      where: affiliateId ? { affiliateId } : undefined,
      include: {
        affiliate: {
          select: { name: true, email: true, code: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const totalPartners = await this.prisma.affiliatePartner.count();
    const activePartners = await this.prisma.affiliatePartner.count({ where: { status: 'ACTIVE' } });
    const totalConversions = await this.prisma.affiliateConversion.count();
    
    const aggregates = await this.prisma.affiliatePartner.aggregate({
      _sum: {
        totalEarnings: true,
        paidEarnings: true,
      },
    });

    const totalCommissions = Number(aggregates._sum.totalEarnings || 0);
    const totalPaid = Number(aggregates._sum.paidEarnings || 0);
    const pendingPayouts = totalCommissions - totalPaid;

    return {
      totalPartners,
      activePartners,
      totalConversions,
      totalCommissions,
      totalPaid,
      pendingPayouts,
    };
  }
}
