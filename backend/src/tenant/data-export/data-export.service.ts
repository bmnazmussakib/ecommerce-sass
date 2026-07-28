import { Injectable, Inject } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';

export type ExportFormat = 'csv' | 'json';
export type ExportEntity = 'products' | 'orders' | 'customers';

function escapeCSV(val: unknown): string {
  if (val == null) return '';
  if (typeof val === 'object') {
    return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
  }
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const str = String(val);
  if (
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    headers.map((h) => escapeCSV(row[h])).join(','),
  );
  return [headers.join(','), ...lines].join('\r\n');
}

@Injectable()
export class DataExportService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async exportProducts(format: ExportFormat): Promise<string> {
    const products = await this.prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    const rows = products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      basePrice: Number(p.basePrice),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : '',
      status: p.status,
      category: p.category?.name ?? '',
      createdAt: p.createdAt.toISOString(),
    }));

    return this.serialize(rows, format);
  }

  async exportOrders(format: ExportFormat): Promise<string> {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const rows = orders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      customerEmail: o.customerEmail ?? '',
      customerPhone: o.customerPhone,
      shippingAddress: o.shippingAddress,
      totalPrice: Number(o.totalPrice),
      shippingCharge: Number(o.shippingCharge),
      taxPaid: Number(o.taxPaid),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      shippingStatus: o.shippingStatus,
      awbCode: o.awbCode ?? '',
      createdAt: o.createdAt.toISOString(),
    }));

    return this.serialize(rows, format);
  }

  async exportCustomers(format: ExportFormat): Promise<string> {
    const customers = await this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const rows = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email ?? '',
      phone: c.phone,
      address: c.address ?? '',
      createdAt: c.createdAt.toISOString(),
    }));

    return this.serialize(rows, format);
  }

  private serialize(
    rows: Record<string, unknown>[],
    format: ExportFormat,
  ): string {
    if (format === 'csv') {
      return toCSV(rows);
    }
    return JSON.stringify(rows, null, 2);
  }
}
