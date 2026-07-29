import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import {
  CreatePopupCampaignDto,
  UpdatePopupCampaignDto,
} from './dto/popup-campaign.dto';

@Injectable()
export class PopupCampaignService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async create(dto: CreatePopupCampaignDto) {
    return this.prisma.popupCampaign.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.popupCampaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.popupCampaign.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const popup = await this.prisma.popupCampaign.findUnique({
      where: { id },
    });
    if (!popup) throw new NotFoundException(`Popup campaign ${id} not found`);
    return popup;
  }

  async update(id: string, dto: UpdatePopupCampaignDto) {
    await this.findOne(id);
    return this.prisma.popupCampaign.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.popupCampaign.delete({
      where: { id },
    });
  }
}
