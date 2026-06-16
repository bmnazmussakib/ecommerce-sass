import { Module, Global } from '@nestjs/common';
import { MasterPrismaService } from './master-prisma.service';
import { TenantConnectionProvider, TENANT_PRISMA_CLIENT } from './tenant-connection.provider';

@Global()
@Module({
  providers: [
    MasterPrismaService,
    TenantConnectionProvider.getProvider(),
  ],
  exports: [
    MasterPrismaService,
    TENANT_PRISMA_CLIENT,
  ],
})
export class DatabaseModule {}
