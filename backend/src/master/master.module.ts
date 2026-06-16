import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { PlanModule } from './plan/plan.module';

@Module({
  imports: [TenantModule, PlanModule]
})
export class MasterModule {}
