import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { CreateFlashSaleDto, UpdateFlashSaleDto } from './dto/flash-sale.dto';

@Injectable()
export class FlashSaleService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async create(dto: CreateFlashSaleDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start >= end) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Overlap validation: Ensure none of the variants are already in an active/overlapping flash sale
    for (const prod of dto.products) {
      const overlapping = await this.prisma.flashSaleProduct.findFirst({
        where: {
          productVariantId: prod.productVariantId,
          flashSale: {
            isActive: true,
            OR: [
              {
                startDate: { lte: end },
                endDate: { gte: start },
              },
            ],
          },
        },
        include: { flashSale: true },
      });

      if (overlapping) {
        throw new BadRequestException(
          `Variant ${prod.productVariantId} is already in an overlapping active flash sale: "${overlapping.flashSale.title}"`
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.flashSale.create({
        data: {
          title: dto.title,
          description: dto.description,
          startDate: start,
          endDate: end,
        },
      });

      const productData = dto.products.map((p) => ({
        flashSaleId: sale.id,
        productVariantId: p.productVariantId,
        salePrice: p.salePrice,
        limitQuantity: p.limitQuantity,
      }));

      await tx.flashSaleProduct.createMany({
        data: productData,
      });

      return tx.flashSale.findUnique({
        where: { id: sale.id },
        include: { products: { include: { variant: { include: { product: true } } } } },
      });
    });
  }

  async findAll() {
    return this.prisma.flashSale.findMany({
      orderBy: { createdAt: 'desc' },
      include: { products: { include: { variant: { include: { product: true } } } } },
    });
  }

  async findActive() {
    const now = new Date();
    return this.prisma.flashSale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { products: { include: { variant: { include: { product: true } } } } },
    });
  }

  async findOne(id: string) {
    const sale = await this.prisma.flashSale.findUnique({
      where: { id },
      include: { products: { include: { variant: { include: { product: true } } } } },
    });
    if (!sale) throw new NotFoundException('Flash Sale not found');
    return sale;
  }

  async update(id: string, dto: UpdateFlashSaleDto) {
    // Keep it simple, basic update
    const sale = await this.findOne(id);
    return this.prisma.flashSale.update({
      where: { id },
      data: { ...dto } as any,
      include: { products: { include: { variant: { include: { product: true } } } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.flashSale.delete({
      where: { id },
    });
    return { success: true, message: 'Flash Sale deleted successfully' };
  }
}
