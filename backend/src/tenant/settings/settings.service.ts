import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async getSettings() {
    // There should be only one setting per tenant, or we fetch the first one
    let settings = await this.prisma.storeSetting.findFirst();
    
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
}
