import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { SetDigitalFileDto } from './dto/digital-product.dto';
import * as crypto from 'crypto';

@Injectable()
export class DigitalProductService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async setDigitalFile(variantId: string, dto: SetDigitalFileDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        isDigital: dto.isDigital ?? true,
        fileUrl: dto.fileUrl,
      },
    });
  }

  async generateDownloadTokens(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { variant: { include: { product: true } } },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    const digitalItems = order.orderItems.filter(
      (item) => item.variant.isDigital && item.variant.fileUrl,
    );

    if (digitalItems.length === 0) {
      throw new BadRequestException('No digital items found in this order');
    }

    const tokens = [];
    for (const item of digitalItems) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const download = await this.prisma.digitalDownload.create({
        data: {
          variantId: item.variant.id,
          orderId: order.id,
          token,
          expiresAt,
        },
      });

      tokens.push({
        id: download.id,
        token: download.token,
        variantId: item.variant.id,
        productTitle: item.variant.product.title,
        fileUrl: item.variant.fileUrl,
        expiresAt: download.expiresAt,
      });
    }

    return tokens;
  }

  async downloadByToken(token: string) {
    const download = await this.prisma.digitalDownload.findUnique({
      where: { token },
      include: { variant: { include: { product: true } } },
    });

    if (!download) throw new NotFoundException('Invalid download token');
    if (new Date() > download.expiresAt)
      throw new ForbiddenException('Download link has expired');
    if (download.downloadedAt)
      throw new ForbiddenException('Download link has already been used');

    await this.prisma.digitalDownload.update({
      where: { id: download.id },
      data: { downloadedAt: new Date() },
    });

    return {
      fileUrl: download.variant.fileUrl,
      productTitle: download.variant.product.title,
      variantId: download.variant.id,
    };
  }

  async getOrderDownloads(orderId: string) {
    const downloads = await this.prisma.digitalDownload.findMany({
      where: { orderId },
      include: { variant: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return downloads.map((d) => ({
      id: d.id,
      token: d.token,
      variantId: d.variantId,
      productTitle: d.variant.product.title,
      fileUrl: d.variant.fileUrl,
      expiresAt: d.expiresAt,
      downloadedAt: d.downloadedAt,
      isExpired: new Date() > d.expiresAt,
    }));
  }

  async getCustomerDownloads(phone: string) {
    const orders = await this.prisma.order.findMany({
      where: { customerPhone: phone },
      select: { id: true },
    });

    if (orders.length === 0) return [];

    const downloads = await this.prisma.digitalDownload.findMany({
      where: { orderId: { in: orders.map((o) => o.id) } },
      include: { variant: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return downloads.map((d) => ({
      id: d.id,
      token: d.token,
      variantId: d.variantId,
      productTitle: d.variant.product.title,
      fileUrl: d.variant.fileUrl,
      expiresAt: d.expiresAt,
      downloadedAt: d.downloadedAt,
      isExpired: new Date() > d.expiresAt,
    }));
  }
}
