import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { PlanModule } from './plan/plan.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [TenantModule, PlanModule, AuthModule]
})
export class MasterModule {}

