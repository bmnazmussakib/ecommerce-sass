import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { CreateSupplyBatchDto, UpdateSupplyBatchDto } from './dto/supply-batch.dto';

@Injectable()
export class SupplyBatchService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async create(dto: CreateSupplyBatchDto) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
    });
    if (!variant) throw new NotFoundException('Product variant not found');

    return this.prisma.$transaction(async (tx) => {
      const batch = await tx.supplyBatch.create({
        data: {
          supplierId: dto.supplierId,
          variantId: dto.variantId,
          quantity: dto.quantity,
          costPrice: dto.costPrice,
          date: dto.date ? new Date(dto.date) : undefined,
        },
      });

      await tx.productVariant.update({
        where: { id: dto.variantId },
        data: {
          stock: { increment: dto.quantity },
        },
      });

      return batch;
    });
  }

  async findAll() {
    return this.prisma.supplyBatch.findMany({
      include: {
        supplier: true,
        variant: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const batch = await this.prisma.supplyBatch.findUnique({
      where: { id },
      include: {
        supplier: true,
        variant: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!batch) throw new NotFoundException('Supply batch not found');
    return batch;
  }

  async update(id: string, dto: UpdateSupplyBatchDto) {
    const batch = await this.findOne(id);

    if (dto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: dto.supplierId },
      });
      if (!supplier) throw new NotFoundException('Supplier not found');
    }

    if (dto.variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: dto.variantId },
      });
      if (!variant) throw new NotFoundException('Product variant not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const targetVariantId = dto.variantId || batch.variantId;
      const targetQuantity = dto.quantity !== undefined ? dto.quantity : batch.quantity;

      if (batch.variantId !== targetVariantId) {
        // Variant changed: revert stock on old variant, apply to new variant
        await tx.productVariant.update({
          where: { id: batch.variantId },
          data: {
            stock: { decrement: batch.quantity },
          },
        });

        await tx.productVariant.update({
          where: { id: targetVariantId },
          data: {
            stock: { increment: targetQuantity },
          },
        });
      } else if (batch.quantity !== targetQuantity) {
        // Same variant, different quantity
        const diff = targetQuantity - batch.quantity;
        await tx.productVariant.update({
          where: { id: batch.variantId },
          data: {
            stock: { increment: diff },
          },
        });
      }

      return tx.supplyBatch.update({
        where: { id },
        data: {
          supplierId: dto.supplierId,
          variantId: dto.variantId,
          quantity: dto.quantity,
          costPrice: dto.costPrice,
          date: dto.date ? new Date(dto.date) : undefined,
        },
      });
    });
  }

  async remove(id: string) {
    const batch = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { id: batch.variantId },
        data: {
          stock: { decrement: batch.quantity },
        },
      });

      return tx.supplyBatch.delete({
        where: { id },
      });
    });
  }

  async getCosting(variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) throw new NotFoundException('Product variant not found');

    const batches = await this.prisma.supplyBatch.findMany({
      where: { variantId },
    });

    if (batches.length === 0) {
      return {
        variantId,
        totalQuantity: 0,
        averageCostPrice: 0,
      };
    }

    let totalQuantity = 0;
    let totalCost = 0;

    for (const batch of batches) {
      const qty = batch.quantity;
      const cost = Number(batch.costPrice);
      totalQuantity += qty;
      totalCost += qty * cost;
    }

    const averageCostPrice = totalQuantity > 0 ? Number((totalCost / totalQuantity).toFixed(2)) : 0;

    return {
      variantId,
      totalQuantity,
      averageCostPrice,
    };
  }
}
