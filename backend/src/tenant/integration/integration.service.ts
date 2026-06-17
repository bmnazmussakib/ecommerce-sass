import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient, IntProviderType } from '@prisma/tenant-client';

@Injectable()
export class IntegrationService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async create(createIntegrationDto: CreateIntegrationDto) {
    return this.prisma.integration.upsert({
      where: { provider: createIntegrationDto.provider },
      update: {
        keysJson: createIntegrationDto.keysJson,
        isActive: createIntegrationDto.isActive !== undefined ? createIntegrationDto.isActive : true,
      },
      create: {
        provider: createIntegrationDto.provider,
        keysJson: createIntegrationDto.keysJson,
        isActive: createIntegrationDto.isActive !== undefined ? createIntegrationDto.isActive : true,
      },
    });
  }

  async findAll() {
    return this.prisma.integration.findMany();
  }

  async findOne(provider: IntProviderType) {
    const integration = await this.prisma.integration.findUnique({
      where: { provider },
    });
    if (!integration) throw new NotFoundException(`Integration for ${provider} not found`);
    return integration;
  }

  async update(provider: IntProviderType, updateIntegrationDto: UpdateIntegrationDto) {
    await this.findOne(provider);
    return this.prisma.integration.update({
      where: { provider },
      data: {
        ...updateIntegrationDto,
      },
    });
  }

  async remove(provider: IntProviderType) {
    await this.findOne(provider);
    return this.prisma.integration.delete({
      where: { provider },
    });
  }
}
