import { Module } from '@nestjs/common';
import { TenantModule } from './tenant/tenant.module';
import { PlanModule } from './plan/plan.module';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { GlobalThemeModule } from './theme/global-theme.module';

@Module({
  imports: [TenantModule, PlanModule, AuthModule, BillingModule, SubscriptionModule, GlobalThemeModule]
})
export class MasterModule {}



