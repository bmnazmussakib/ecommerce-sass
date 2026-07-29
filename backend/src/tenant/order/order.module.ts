import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { DatabaseModule } from '../../core/database/database.module';
import { IntegrationModule } from '../integration/integration.module';
import { InvoiceService } from './invoice.service';
import { StoreClosedGuard } from '../settings/store-closed.guard';
import { ShippingModule } from '../shipping/shipping.module';
import { DigitalProductModule } from '../digital-product/digital-product.module';
import { WebhookModule } from '../webhook/webhook.module';
import { TaxRuleModule } from '../tax-rule/tax-rule.module';
import { BogoOfferModule } from '../bogo-offer/bogo-offer.module';
import { AffiliateModule } from '../affiliate/affiliate.module';

@Module({
  imports: [
    DatabaseModule,
    IntegrationModule,
    ShippingModule,
    DigitalProductModule,
    WebhookModule,
    TaxRuleModule,
    BogoOfferModule,
    AffiliateModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, InvoiceService, StoreClosedGuard],
})
export class OrderModule {}
