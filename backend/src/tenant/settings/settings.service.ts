import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { UpdateSettingsDto, ToggleStoreDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async getSettings() {
    // Return the latest settings record to avoid duplicate row conflicts
    let settings = await this.prisma.storeSetting.findFirst({
      orderBy: { updatedAt: 'desc' }
    });
    
    // If not exists, we can create a default one
    if (!settings) {
      settings = await this.prisma.storeSetting.create({
        data: {
          storeName: 'New Store',
          themeConfig: {},
        },
      });
    }
    
    return settings;
  }

  async updateSettings(updateDto: UpdateSettingsDto) {
    const settings = await this.getSettings();
    return this.prisma.storeSetting.update({
      where: { id: settings.id },
      data: updateDto as any,
    });
  }

  async getStoreStatus() {
    const settings = await this.getSettings();
    return {
      isStoreOpen: settings.isStoreOpen,
      maintenanceMessage: settings.maintenanceMessage,
      storeName: settings.storeName,
    };
  }

  async toggleStore(dto: ToggleStoreDto) {
    const settings = await this.getSettings();
    const updated = await this.prisma.storeSetting.update({
      where: { id: settings.id },
      data: {
        isStoreOpen: dto.isStoreOpen,
        ...(dto.maintenanceMessage !== undefined && { maintenanceMessage: dto.maintenanceMessage }),
      },
    });
    return {
      isStoreOpen: updated.isStoreOpen,
      maintenanceMessage: updated.maintenanceMessage,
      storeName: updated.storeName,
      message: updated.isStoreOpen ? '✅ Store is now OPEN' : '🔒 Store is now CLOSED',
    };
  }
}
