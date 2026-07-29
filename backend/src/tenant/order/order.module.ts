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

@Module({
  imports: [
    DatabaseModule,
    IntegrationModule,
    ShippingModule,
    DigitalProductModule,
    WebhookModule,
    TaxRuleModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, InvoiceService, StoreClosedGuard],
})
export class OrderModule {}
