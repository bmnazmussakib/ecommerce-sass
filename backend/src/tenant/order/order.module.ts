import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { DatabaseModule } from '../../core/database/database.module';
import { IntegrationModule } from '../integration/integration.module';
import { InvoiceService } from './invoice.service';
import { StoreClosedGuard } from '../settings/store-closed.guard';
import { ShippingModule } from '../shipping/shipping.module';

@Module({
  imports: [DatabaseModule, IntegrationModule, ShippingModule],
  controllers: [OrderController],
  providers: [OrderService, InvoiceService, StoreClosedGuard],
})
export class OrderModule {}

