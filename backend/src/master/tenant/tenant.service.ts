import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { MasterPrismaService } from '../../core/database/master-prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantService {
  constructor(private prisma: MasterPrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    // Check if subdomain exists
    const existing = await this.prisma.tenant.findUnique({
      where: { subdomain: createTenantDto.subdomain },
    });
    if (existing) {
      throw new ConflictException('Subdomain already exists');
    }

    return this.prisma.tenant.create({
      data: createTenantDto,
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    await this.findOne(id); // Ensure exists
    
    // Check conflict if subdomain is being updated
    if (updateTenantDto.subdomain) {
      const existing = await this.prisma.tenant.findFirst({
        where: { subdomain: updateTenantDto.subdomain, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Subdomain already in use');
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tenant.delete({ where: { id } });
  }
}
