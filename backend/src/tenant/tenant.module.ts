import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SettingsModule } from './settings/settings.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { SupplierModule } from './supplier/supplier.module';
import { CouponModule } from './coupon/coupon.module';
import { OrderModule } from './order/order.module';
import { IntegrationModule } from './integration/integration.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    AuthModule,
    SettingsModule,
    CategoryModule,
    ProductModule,
    SupplierModule,
    CouponModule,
    OrderModule,
    IntegrationModule,
    AnalyticsModule,
    UploadModule
  ]
})
export class TenantModule {}
