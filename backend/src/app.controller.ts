import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { MasterPrismaService } from './core/database/master-prisma.service';
import { TENANT_PRISMA_CLIENT } from './core/database/tenant-connection.provider';

@ApiTags('General')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly masterPrisma: MasterPrismaService,
    @Inject(TENANT_PRISMA_CLIENT) private readonly tenantPrisma: any,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get hello world message' })
  @ApiResponse({ status: 200, description: 'Hello world string returned.' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-tenant')
  @ApiOperation({ summary: 'Test dynamic tenant connection switching' })
  async testTenantConnection() {
    // We try to query store name from tenant DB if resolved
    try {
      const storeSettings = await this.tenantPrisma.storeSetting.findFirst();
      return {
        success: true,
        message: 'Successfully resolved tenant and connected to Tenant DB!',
        storeName: storeSettings?.storeName || 'Unnamed Store',
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Resolved tenant but failed to query database.',
        error: err.message,
      };
    }
  }
}
