import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MasterPrismaService } from '../../core/database/master-prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';

@Injectable()
export class TenantService {
  constructor(
    private prisma: MasterPrismaService,
    private jwtService: JwtService,
  ) {}

  async impersonate(id: string) {
    const tenant = await this.findOne(id);

    // Dynamic resolution of tenant DB to fetch owner/staff details
    const tenantPrisma = new TenantPrismaClient({
      datasources: {
        db: {
          url: tenant.dbConnectionString,
        },
      },
    });

    try {
      await tenantPrisma.$connect();
      // Find an owner or admin to impersonate
      const owner = await tenantPrisma.staff.findFirst({
        where: { role: 'OWNER' },
      });

      if (!owner) {
        throw new NotFoundException('No OWNER staff member found in tenant DB');
      }

      // Generate a secure JWT signed with tenant scope
      const payload = { sub: owner.id, email: owner.email, role: owner.role, impersonated: true };
      const token = this.jwtService.sign(payload);

      return {
        access_token: token,
        subdomain: tenant.subdomain,
        customDomain: tenant.customDomain,
        staff: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          role: owner.role,
        },
      };
    } finally {
      await tenantPrisma.$disconnect();
    }
  }

  private async getTenantPrismaClient(tenantId: string): Promise<TenantPrismaClient> {
    const tenant = await this.findOne(tenantId);
    return new TenantPrismaClient({
      datasources: {
        db: {
          url: tenant.dbConnectionString,
        },
      },
    });
  }

  async getTenantProducts(tenantId: string) {
    const tenantPrisma = await this.getTenantPrismaClient(tenantId);
    try {
      await tenantPrisma.$connect();
      return await tenantPrisma.product.findMany({
        include: { variants: true },
      });
    } finally {
      await tenantPrisma.$disconnect();
    }
  }

  async getTenantOrders(tenantId: string) {
    const tenantPrisma = await this.getTenantPrismaClient(tenantId);
    try {
      await tenantPrisma.$connect();
      return await tenantPrisma.order.findMany({
        include: { orderItems: { include: { variant: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } finally {
      await tenantPrisma.$disconnect();
    }
  }

  async getTenantStaff(tenantId: string) {
    const tenantPrisma = await this.getTenantPrismaClient(tenantId);
    try {
      await tenantPrisma.$connect();
      return await tenantPrisma.staff.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });
    } finally {
      await tenantPrisma.$disconnect();
    }
  }


  async create(createTenantDto: CreateTenantDto) {
    // Check if subdomain exists
    const existing = await this.prisma.tenant.findUnique({
      where: { subdomain: createTenantDto.subdomain },
    });
    if (existing) {
      throw new ConflictException('Subdomain already exists');
    }

    const tenant = await this.prisma.tenant.create({
      data: createTenantDto,
    });

    // Automatically push/initialize tables to the new tenant database instance
    try {
      const { execSync } = require('child_process');
      console.log(`[Auto-Onboard] Pushing tenant schema to new database connection: ${tenant.dbConnectionString}`);
      execSync(`npx prisma db push --schema=prisma/tenant.prisma`, {
        env: {
          ...process.env,
          TENANT_DATABASE_TEMPLATE_URL: tenant.dbConnectionString,
        },
      });
      console.log(`[Auto-Onboard] Tenant schema synchronized successfully.`);
    } catch (error) {
      console.error(`[Auto-Onboard] Failed to push schema to tenant DB:`, error);
      // Fail gracefully or handle depending on requirements (here we log and allow metadata creation)
    }

    return tenant;
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
