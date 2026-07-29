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
  CreateWarehouseDto,
  UpdateWarehouseDto,
  SetWarehouseStockDto,
  TransferStockDto,
} from './dto/warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async create(dto: CreateWarehouseDto) {
    const existing = await this.prisma.warehouse.findUnique({
      where: { code: dto.code.toUpperCase() },
    });
    if (existing) throw new ConflictException(`Warehouse code ${dto.code} already exists`);

    if (dto.isPrimary) {
      await this.prisma.warehouse.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.warehouse.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        address: dto.address,
        city: dto.city,
        phone: dto.phone,
        isPrimary: dto.isPrimary ?? false,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.warehouse.findMany({
      include: {
        _count: {
          select: { stocks: true },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        stocks: {
          include: {
            variant: {
              select: { sku: true, price: true, product: { select: { title: true } } },
            },
          },
        },
      },
    });
    if (!warehouse) throw new NotFoundException(`Warehouse ${id} not found`);
    return warehouse;
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    await this.findOne(id);
    if (dto.isPrimary) {
      await this.prisma.warehouse.updateMany({
        where: { id: { not: id }, isPrimary: true },
        data: { isPrimary: false },
      });
    }
    return this.prisma.warehouse.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toUpperCase() : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.warehouse.delete({
      where: { id },
    });
  }

  /**
   * Set stock quantity for a variant in a specific warehouse
   */
  async setStock(dto: SetWarehouseStockDto) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: dto.warehouseId } });
    if (!warehouse) throw new NotFoundException(`Warehouse ${dto.warehouseId} not found`);

    const variant = await this.prisma.productVariant.findUnique({ where: { id: dto.variantId } });
    if (!variant) throw new NotFoundException(`Variant ${dto.variantId} not found`);

    const warehouseStock = await this.prisma.warehouseStock.upsert({
      where: {
        warehouseId_variantId: {
          warehouseId: dto.warehouseId,
          variantId: dto.variantId,
        },
      },
      update: { stock: dto.stock },
      create: {
        warehouseId: dto.warehouseId,
        variantId: dto.variantId,
        stock: dto.stock,
      },
    });

    // Update aggregate ProductVariant stock
    await this.recalculateTotalVariantStock(dto.variantId);

    return warehouseStock;
  }

  /**
   * Transfer stock between warehouses
   */
  async transferStock(dto: TransferStockDto) {
    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new BadRequestException('Source and destination warehouses cannot be the same');
    }

    const sourceStock = await this.prisma.warehouseStock.findUnique({
      where: {
        warehouseId_variantId: {
          warehouseId: dto.fromWarehouseId,
          variantId: dto.variantId,
        },
      },
    });

    if (!sourceStock || sourceStock.stock < dto.quantity) {
      const available = sourceStock ? sourceStock.stock : 0;
      throw new BadRequestException(
        `Insufficient stock in source warehouse (${available} available, requested ${dto.quantity})`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.warehouseStock.update({
        where: { id: sourceStock.id },
        data: { stock: { decrement: dto.quantity } },
      }),
      this.prisma.warehouseStock.upsert({
        where: {
          warehouseId_variantId: {
            warehouseId: dto.toWarehouseId,
            variantId: dto.variantId,
          },
        },
        update: { stock: { increment: dto.quantity } },
        create: {
          warehouseId: dto.toWarehouseId,
          variantId: dto.variantId,
          stock: dto.quantity,
        },
      }),
    ]);

    await this.recalculateTotalVariantStock(dto.variantId);

    return {
      message: `Successfully transferred ${dto.quantity} units`,
      fromWarehouseId: dto.fromWarehouseId,
      toWarehouseId: dto.toWarehouseId,
      variantId: dto.variantId,
    };
  }

  /**
   * Get variant stock across all warehouses
   */
  async getVariantStocks(variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, sku: true, stock: true, product: { select: { title: true } } },
    });
    if (!variant) throw new NotFoundException(`Variant ${variantId} not found`);

    const warehouseStocks = await this.prisma.warehouseStock.findMany({
      where: { variantId },
      include: {
        warehouse: {
          select: { id: true, name: true, code: true, isPrimary: true, city: true },
        },
      },
      orderBy: { warehouse: { isPrimary: 'desc' } },
    });

    return {
      variantId: variant.id,
      sku: variant.sku,
      productTitle: variant.product.title,
      totalStock: variant.stock,
      warehouseBreakdown: warehouseStocks,
    };
  }

  /**
   * Internal helper to sync aggregate ProductVariant.stock with sum of all warehouse stocks
   */
  private async recalculateTotalVariantStock(variantId: string) {
    const aggregates = await this.prisma.warehouseStock.aggregate({
      where: { variantId },
      _sum: { stock: true },
    });

    const totalStock = aggregates._sum.stock || 0;
    await this.prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: totalStock },
    });
  }
}
