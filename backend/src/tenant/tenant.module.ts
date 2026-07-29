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
import { SearchModule } from './search/search.module';
import { SupplyBatchModule } from './supply-batch/supply-batch.module';
import { FlashSaleModule } from './flash-sale/flash-sale.module';
import { CustomerModule } from './customer/customer.module';
import { ShippingModule } from './shipping/shipping.module';
import { DataExportModule } from './data-export/data-export.module';
import { DigitalProductModule } from './digital-product/digital-product.module';
import { WebhookModule } from './webhook/webhook.module';
import { TaxRuleModule } from './tax-rule/tax-rule.module';
import { BogoOfferModule } from './bogo-offer/bogo-offer.module';
import { SeoModule } from './seo/seo.module';
import { SocialModule } from './social/social.module';

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
    UploadModule,
    SearchModule,
    SupplyBatchModule,
    FlashSaleModule,
    CustomerModule,
    ShippingModule,
    DataExportModule,
    DigitalProductModule,
    WebhookModule,
    TaxRuleModule,
    BogoOfferModule,
    SeoModule,
    SocialModule,
  ]
})
export class TenantModule {}

