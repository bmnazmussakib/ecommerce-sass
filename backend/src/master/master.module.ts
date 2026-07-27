import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { PlanModule } from './plan/plan.module';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [TenantModule, PlanModule, AuthModule, BillingModule]
})
export class MasterModule {}


